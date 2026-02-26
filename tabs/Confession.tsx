import React, { useRef, useState } from "react"
import { ImageUploader } from "~/components/ImageUploader"
import { BurnEffect } from "~/components/BurnEffect"
import { ShareForm } from "~/components/ShareForm"

type Phase = "write" | "burning" | "result" | "share" | "shared"

export default function Confession() {
  const [text, setText]         = useState("")
  const [phase, setPhase]       = useState<Phase>("write")
  const [confessionId, setConfessionId] = useState<string | null>(null)
  const contentRef              = useRef<HTMLDivElement>(null)
  const maxChars                = 500
  const [imageUrls, setImageUrls] = useState<string[]>([])

  const handleBurn = () => {
    if (!text.trim()) return
    setPhase("burning")
  }

  if (phase === "write" || phase === "burning") {
    return (
      <div style={{ position: "relative" }}>
        <div ref={contentRef} style={styles.writeContainer}>
          <p style={styles.prompt}>Điều gì vừa xảy ra?</p>
          <div style={styles.textareaWrapper}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, maxChars))}
              placeholder="Cứ viết ra đây... không ai phán xét bạn đâu."
              style={styles.textarea}
              spellCheck={false}
              disabled={phase === "burning"}
            />
            <span style={styles.charCount}>{text.length}/{maxChars}</span>
          </div>

          {/* Thêm dòng này */}
          <ImageUploader images={imageUrls} onChange={setImageUrls} />

          <button
            style={{
              ...styles.burnBtn,
              ...(!text.trim() || phase === "burning" ? styles.burnBtnDisabled : {})
            }}
            disabled={!text.trim() || phase === "burning"}
            onClick={handleBurn}
          >
            <span>🔥</span>
            <span>{phase === "burning" ? "Đang cháy..." : "Burn it"}</span>
          </button>
        </div>

        <BurnEffect
          isActive={phase === "burning"}
          targetRef={contentRef}
          onComplete={() => setPhase("result")}
        />
      </div>
    )
  }

  if (phase === "share") {
    return (
      <ShareForm
        content={text}
        imageUrls={imageUrls}
        onSuccess={(id) => {
          setConfessionId(id)
          setPhase("shared")
        }}
        onBack={() => setPhase("result")}
      />
    )
  }

  if (phase === "shared") {
    return (
      <div style={styles.resultContainer}>
        <div style={styles.ashDeco}><span style={styles.ashIcon}>✓</span></div>
        <p style={styles.resultTitle}>Đã chia sẻ!</p>
        <p style={styles.resultSub}>Cảm ơn bạn đã dũng cảm chia sẻ thất bại.</p>
        <button style={styles.resetBtn} onClick={() => { setText(""); setImageUrls([]); setPhase("write") }}>
          Viết confession khác
        </button>
      </div>
    )
  }

  // phase === "result"
  return (
    <div style={styles.resultContainer}>
      <div style={styles.ashDeco}>
        <span style={styles.ashIcon}>🪶</span>
      </div>
      <p style={styles.resultTitle}>Đã đốt rồi.</p>
      <p style={styles.resultSub}>
        Nó chỉ là một khoảnh khắc — không phải con người bạn.
      </p>
      <div style={styles.resultActions}>
        <button style={styles.shareBtn} onClick={() => setPhase("share")}>
          <span>🌐</span>
          <span>Chia sẻ thất bại</span>
        </button>
        <button
          style={styles.saveBtn}
          onClick={() => {
            // TODO: cất giữ
          }}
        >
          <span>📦</span>
          <span>Cất giữ</span>
        </button>
      </div>
      <button style={styles.resetBtn} onClick={() => { setText(""); setImageUrls([]); setPhase("write") }}>
        Viết confession khác
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  writeContainer: {
    padding: "20px 20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    minHeight: "340px",
    background: "#1D1616"
  },
  prompt: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "700",
    fontSize: "11px",
    letterSpacing: "1px",
    color: "rgba(238,238,238,0.45)",
    textTransform: "uppercase"
  },
  textareaWrapper: { position: "relative", flex: 1 },
  textarea: {
    width: "100%",
    minHeight: "200px",
    background: "rgba(238,238,238,0.04)",
    border: "1px solid rgba(142,22,22,0.4)",
    borderRadius: "10px",
    color: "#EEEEEE",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "500",
    fontSize: "13px",
    lineHeight: "1.7",
    padding: "14px 16px 32px",
    resize: "none",
    outline: "none",
    caretColor: "#D84040"
  },
  charCount: {
    position: "absolute",
    bottom: "10px",
    right: "14px",
    fontSize: "10px",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    color: "rgba(238,238,238,0.2)",
    letterSpacing: "0.5px"
  },
  burnBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #D84040 0%, #8E1616 100%)",
    border: "none",
    borderRadius: "10px",
    color: "#EEEEEE",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "800",
    fontSize: "14px",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: "0 4px 20px rgba(216,64,64,0.3)"
  },
  burnBtnDisabled: {
    opacity: 0.35,
    cursor: "not-allowed",
    boxShadow: "none"
  },
  resultContainer: {
    padding: "32px 24px 28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    minHeight: "340px",
    background: "#1D1616"
  },
  ashDeco: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "rgba(216,64,64,0.08)",
    border: "1px solid rgba(216,64,64,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "4px"
  },
  ashIcon: { fontSize: "24px" },
  resultTitle: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "800",
    fontSize: "22px",
    color: "#EEEEEE",
    letterSpacing: "-0.5px"
  },
  resultSub: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "500",
    fontSize: "12px",
    color: "rgba(238,238,238,0.4)",
    textAlign: "center",
    lineHeight: "1.6",
    maxWidth: "260px",
    marginBottom: "8px"
  },
  resultActions: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "4px"
  },
  shareBtn: {
    width: "100%",
    padding: "13px 16px",
    background: "linear-gradient(135deg, #D84040 0%, #8E1616 100%)",
    border: "none",
    borderRadius: "10px",
    color: "#EEEEEE",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "700",
    fontSize: "13px",
    letterSpacing: "0.5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 4px 16px rgba(216,64,64,0.25)"
  },
  saveBtn: {
    width: "100%",
    padding: "13px 16px",
    background: "transparent",
    border: "1px solid rgba(142,22,22,0.5)",
    borderRadius: "10px",
    color: "rgba(238,238,238,0.7)",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "700",
    fontSize: "13px",
    letterSpacing: "0.5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
  resetBtn: {
    background: "none",
    border: "none",
    color: "rgba(238,238,238,0.2)",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "11px",
    letterSpacing: "0.5px",
    cursor: "pointer",
    marginTop: "8px",
    textDecoration: "underline",
    textUnderlineOffset: "3px"
  }
}