import html2canvas from "html2canvas"
import React, { useEffect, useRef } from "react"
import * as THREE from "three"

interface BurnEffectProps {
  isActive: boolean
  targetRef: React.RefObject<HTMLElement>
  onComplete: () => void
}

export const BurnEffect: React.FC<BurnEffectProps> = ({
                                                        isActive,
                                                        targetRef,
                                                        onComplete
                                                      }) => {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || !overlayRef.current || !targetRef.current) return

    const overlay = overlayRef.current
    const target = targetRef.current
    const width = target.offsetWidth
    const height = target.offsetHeight

    let animationId: number

    const run = async () => {
      try {
        // Chụp lại DOM thành bitmap
        const captured = await html2canvas(target, {
          backgroundColor: "#1D1616",
          scale: 2,
          logging: false,
          useCORS: true
        })

        // --- Three.js setup ---
        const scene = new THREE.Scene()
        const camera = new THREE.OrthographicCamera(
          width / -2, width / 2,
          height / 2, height / -2,
          0.1, 1000
        )
        camera.position.z = 1

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
        renderer.setSize(width, height)
        renderer.setPixelRatio(window.devicePixelRatio)
        overlay.appendChild(renderer.domElement)

        // Texture từ ảnh chụp
        const texture = new THREE.CanvasTexture(captured)
        texture.needsUpdate = true

        // Ẩn nội dung gốc, để WebGL canvas đè lên
        target.style.visibility = "hidden"

        // --- Shaders ---
        const vertexShader = `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `

        const fragmentShader = `
          uniform sampler2D tDiffuse;
          uniform float time;
          uniform float burnProgress;
          varying vec2 vUv;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
          }

          float fbm(vec2 p) {
            float v = 0.0;
            float amp = 0.5;
            for(int i = 0; i < 5; i++) {
              v += amp * noise(p);
              p *= 2.0;
              amp *= 0.5;
            }
            return v;
          }

          vec3 fireColor(float t) {
            vec3 c1 = vec3(0.07, 0.02, 0.0);
            vec3 c2 = vec3(0.85, 0.15, 0.0);
            vec3 c3 = vec3(1.0,  0.45, 0.05);
            vec3 c4 = vec3(1.0,  0.92, 0.3);
            if(t < 0.33) return mix(c1, c2, t / 0.33);
            if(t < 0.66) return mix(c2, c3, (t - 0.33) / 0.33);
            return mix(c3, c4, (t - 0.66) / 0.34);
          }

          void main() {
            vec2 uv = vUv;

            // Burn đi từ dưới lên: burnProgress 0→1 tương ứng uv.y 0→1
            // uv.y = 0 là đáy, = 1 là đỉnh
            float burnFront = burnProgress;
            float burnNoise  = fbm(vec2(uv.x * 14.0, time * 1.8)) * 0.07;
            float edge = burnFront + burnNoise;

            float d = uv.y - edge; // d < 0: đã cháy, d > 0: chưa cháy

            vec4 orig = texture2D(tDiffuse, uv);

            // --- Vùng đã cháy (tro đen) ---
            if(d < -0.04) {
              float charNoise = fbm(uv * 28.0 + time * 0.4) * 0.1;
              vec3 ash = vec3(0.025 + charNoise, 0.01, 0.0);
              // Fade dần về màu nền #1D1616
              float fade = smoothstep(-0.04, -0.35, d);
              vec3 bg = vec3(0.114, 0.086, 0.086);
              gl_FragColor = vec4(mix(ash, bg, fade), 1.0);
              return;
            }

            // --- Vùng đang cháy (lửa) ---
            if(d < 0.13) {
              vec2 fUv = vec2(
                uv.x + fbm(vec2(uv.y * 7.0 - time * 2.5, time * 0.8)) * 0.04,
                uv.y - time * 0.4
              );
              float fNoise     = fbm(fUv * vec2(9.0, 22.0));
              float intensity  = (1.0 - smoothstep(-0.04, 0.13, d)) * fNoise;

              // Ember spots
              float ember = fbm(uv * 38.0 - time * 1.8);
              if(ember > 0.68 && d < 0.05) intensity = max(intensity, 0.95);

              vec3 fireCol = fireColor(intensity);

              // Content fade ở rìa lửa
              float cFade  = smoothstep(-0.04, 0.06, d);
              vec3 scorched = orig.rgb * mix(vec3(0.7, 0.35, 0.2), vec3(1.0), cFade) * (0.25 + cFade * 0.75);
              vec3 final   = mix(scorched, fireCol, intensity * 0.85);

              // Glow
              float glow = exp(-abs(d + 0.01) * 28.0) * 0.45;
              final += vec3(1.0, 0.55, 0.15) * glow;

              gl_FragColor = vec4(final, 1.0);
              return;
            }

            // --- Heat distortion phía trên rìa lửa ---
            if(d < 0.26) {
              float heat  = (0.26 - d) / 0.26;
              float warp  = fbm(vec2(uv.x * 7.0, uv.y * 7.0 - time * 1.8)) * heat * 0.025;
              vec2 wUv    = vec2(uv.x + warp, uv.y + warp * 0.5);
              vec4 warped = texture2D(tDiffuse, wUv);
              vec3 tinted = mix(warped.rgb, warped.rgb * vec3(1.0, 0.88, 0.65), heat * 0.25);
              gl_FragColor = vec4(tinted, 1.0);
              return;
            }

            gl_FragColor = orig;
          }
        `

        const geo = new THREE.PlaneGeometry(width, height)
        const mat = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms: {
            tDiffuse:     { value: texture },
            time:         { value: 0 },
            burnProgress: { value: 0 }
          },
          transparent: false
        })

        scene.add(new THREE.Mesh(geo, mat))

        // --- Animate ---
        const t0 = Date.now()
        const DURATION = 2200 // ms — tốc độ đốt

        const tick = () => {
          const elapsed  = Date.now() - t0
          const progress = Math.min(elapsed / DURATION, 1)

          mat.uniforms.time.value         = elapsed * 0.001
          mat.uniforms.burnProgress.value = progress

          renderer.render(scene, camera)

          if (progress < 1) {
            animationId = requestAnimationFrame(tick)
          } else {
            setTimeout(() => {
              // Cleanup
              target.style.visibility = "visible"
              if (overlay.contains(renderer.domElement)) {
                overlay.removeChild(renderer.domElement)
              }
              geo.dispose()
              mat.dispose()
              texture.dispose()
              renderer.dispose()
              onComplete()
            }, 400)
          }
        }

        tick()
      } catch (err) {
        console.error("BurnEffect error:", err)
        target.style.visibility = "visible"
        onComplete()
      }
    }

    run()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (targetRef.current) targetRef.current.style.visibility = "visible"
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <div
      ref={overlayRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        pointerEvents: "none",
        backgroundColor: "#1D1616"
      }}
    />
  )
}