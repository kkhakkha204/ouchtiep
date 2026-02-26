import React, { useState } from "react";



import { FIELDS } from "~/constants/fields";
import { useAuth } from "~/context/AuthContext";
import { supabase } from "~/lib/supabase";
import { ImageUploader } from "~components/ImageUploader";





interface ShareFormProps {
  content: string
  imageUrls: string[]
  onSuccess: (id: string) => void
  onBack: () => void
}

type DisplayMode = "public" | "anonymous"

export const ShareForm: React.FC<ShareFormProps> = ({
  content,
  imageUrls: initialImageUrls,
  onSuccess,
  onBack
}) => {
  const { user, signIn, signUp } = useAuth()

  const [mode, setMode] = useState<DisplayMode>("public")
  const [field, setField] = useState("")
  const [position, setPosition] = useState("")
  const [level, setLevel] = useState<number>(3)
  const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auth inline nếu chưa đăng nhập
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  const handleAuth = async () => {
    setAuthError(null)
    if (!email.trim() || !password.trim()) {
      setAuthError("Vui lòng điền đầy đủ.")
      return
    }
    setAuthLoading(true)
    const fn = authMode === "login" ? signIn : signUp
    const { error } = await fn(email, password)
    if (error) setAuthError(error)
    setAuthLoading(false)
  }

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)

    const { data, error: insertError } = await supabase
      .from("confessions")
      .insert({
        user_id: mode === "anonymous" ? null : user?.id ?? null,
        content,
        field: field.trim() || null,
        position: position.trim() || null,
        level,
        is_anonymous: mode === "anonymous",
        is_public: true,
        image_urls: imageUrls
      })
      .select("id")
      .single()

    if (insertError) {
      setError("Có lỗi xảy ra. Thử lại nhé.")
      setSubmitting(false)
      return
    }

    onSuccess(data.id)
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>
          ← Quay lại
        </button>
        <p style={styles.title}>Chia sẻ thất bại</p>
      </div>

      {/* Chế độ hiển thị */}
      <div style={styles.section}>
        <p style={styles.label}>Chế độ hiển thị</p>
        <div style={styles.modeToggle}>
          <button
            style={{
              ...styles.modeBtn,
              ...(mode === "public" ? styles.modeBtnActive : {})
            }}
            onClick={() => setMode("public")}>
            🌐 Công khai
          </button>
          <button
            style={{
              ...styles.modeBtn,
              ...(mode === "anonymous" ? styles.modeBtnActive : {})
            }}
            onClick={() => setMode("anonymous")}>
            🎭 Ẩn danh
          </button>
        </div>
      </div>

      {/* Thông tin */}
      <div style={styles.section}>
        <p style={styles.label}>Thông tin (tuỳ chọn)</p>
        <div style={styles.fieldGroup}>
          <select
            value={field}
            onChange={(e) => setField(e.target.value)}
            style={styles.select}
          >
            <option value="">-- Chọn lĩnh vực --</option>
            {FIELDS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Chức vụ (vd: Sinh viên, Founder...)"
            style={styles.input}
          />
        </div>
      </div>

      {/* Mức độ thất bại */}
      <div style={styles.section}>
        <p style={styles.label}>
          Mức độ thất bại: <span style={styles.levelValue}>{level}/5</span>
        </p>
        <div style={styles.levelBtns}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              style={{
                ...styles.levelBtn,
                ...(level === n ? styles.levelBtnActive : {})
              }}
              onClick={() => setLevel(n)}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Ảnh */}
      <div style={styles.section}>
        <p style={styles.label}>
          Ảnh đính kèm
          {imageUrls.length === 0 && (
            <span style={{ color: "rgba(238,238,238,0.25)", marginLeft: "6px", textTransform: "none", fontWeight: 500 }}>
        — chưa có ảnh nào
      </span>
          )}
        </p>
        <ImageUploader images={imageUrls} onChange={setImageUrls} />
      </div>

      {/* Auth inline nếu chưa đăng nhập và chọn public */}
      {!user && mode === "public" && (
        <div style={styles.authSection}>
          <p style={styles.authNote}>
            Đăng nhập để chia sẻ công khai với tên tài khoản.
          </p>
          <div style={styles.authToggle}>
            <button
              style={{
                ...styles.authToggleBtn,
                ...(authMode === "login" ? styles.authToggleBtnActive : {})
              }}
              onClick={() => {
                setAuthMode("login")
                setAuthError(null)
              }}>
              Đăng nhập
            </button>
            <button
              style={{
                ...styles.authToggleBtn,
                ...(authMode === "register" ? styles.authToggleBtnActive : {})
              }}
              onClick={() => {
                setAuthMode("register")
                setAuthError(null)
              }}>
              Đăng ký
            </button>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={styles.input}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            style={styles.input}
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
          />
          {authError && <p style={styles.errorText}>{authError}</p>}
          <button
            style={{
              ...styles.authBtn,
              ...(authLoading ? styles.btnDisabled : {})
            }}
            onClick={handleAuth}
            disabled={authLoading}>
            {authLoading
              ? "Đang xử lý..."
              : authMode === "login"
                ? "Đăng nhập"
                : "Đăng ký"}
          </button>
        </div>
      )}

      {/* Error */}
      {error && <p style={styles.errorText}>{error}</p>}

      {/* Submit — chỉ enable khi: đã login, hoặc chọn ẩn danh */}
      <button
        style={{
          ...styles.submitBtn,
          ...(submitting || (!user && mode === "public")
            ? styles.btnDisabled
            : {})
        }}
        onClick={handleSubmit}
        disabled={submitting || (!user && mode === "public")}>
        {submitting ? "Đang gửi..." : "🚀 Chia sẻ ngay"}
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "16px 20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    minHeight: "340px",
    background: "#1D1616"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "rgba(238,238,238,0.35)",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "11px",
    cursor: "pointer",
    padding: 0,
    letterSpacing: "0.3px"
  },
  title: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "800",
    fontSize: "15px",
    color: "#EEEEEE",
    letterSpacing: "-0.3px"
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  label: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "10px",
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: "rgba(238,238,238,0.4)"
  },
  levelValue: {
    color: "#D84040",
    fontWeight: "700"
  },
  modeToggle: {
    display: "flex",
    gap: "8px"
  },
  modeBtn: {
    flex: 1,
    padding: "9px",
    background: "rgba(238,238,238,0.04)",
    border: "1px solid rgba(142,22,22,0.3)",
    borderRadius: "8px",
    color: "rgba(238,238,238,0.35)",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "11px",
    cursor: "pointer"
  },
  modeBtnActive: {
    background: "rgba(216,64,64,0.12)",
    border: "1px solid rgba(216,64,64,0.5)",
    color: "#EEEEEE"
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    background: "rgba(238,238,238,0.04)",
    border: "1px solid rgba(142,22,22,0.4)",
    borderRadius: "8px",
    color: "#EEEEEE",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "500",
    fontSize: "12px",
    outline: "none",
    caretColor: "#D84040"
  },
  select: {
    width: "100%",
    padding: "9px 12px",
    background: "#2a1a1a",
    border: "1px solid rgba(142,22,22,0.4)",
    borderRadius: "8px",
    color: "#EEEEEE",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "500",
    fontSize: "12px",
    outline: "none",
    cursor: "pointer"
  },
  levelBtns: {
    display: "flex",
    gap: "6px"
  },
  levelBtn: {
    flex: 1,
    padding: "8px",
    background: "rgba(238,238,238,0.04)",
    border: "1px solid rgba(142,22,22,0.3)",
    borderRadius: "8px",
    color: "rgba(238,238,238,0.35)",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer"
  },
  levelBtnActive: {
    background: "rgba(216,64,64,0.15)",
    border: "1px solid #D84040",
    color: "#EEEEEE"
  },
  authSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "12px",
    background: "rgba(238,238,238,0.03)",
    border: "1px solid rgba(142,22,22,0.2)",
    borderRadius: "10px"
  },
  authNote: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "500",
    fontSize: "11px",
    color: "rgba(238,238,238,0.4)",
    lineHeight: "1.5"
  },
  authToggle: {
    display: "flex",
    gap: "6px"
  },
  authToggleBtn: {
    flex: 1,
    padding: "6px",
    background: "transparent",
    border: "1px solid rgba(142,22,22,0.3)",
    borderRadius: "6px",
    color: "rgba(238,238,238,0.3)",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "10px",
    cursor: "pointer",
    letterSpacing: "0.5px"
  },
  authToggleBtnActive: {
    background: "rgba(216,64,64,0.12)",
    border: "1px solid rgba(216,64,64,0.4)",
    color: "#EEEEEE"
  },
  authBtn: {
    width: "100%",
    padding: "9px",
    background: "rgba(216,64,64,0.15)",
    border: "1px solid rgba(216,64,64,0.4)",
    borderRadius: "8px",
    color: "#EEEEEE",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer"
  },
  errorText: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "11px",
    color: "#D84040"
  },
  submitBtn: {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #D84040 0%, #8E1616 100%)",
    border: "none",
    borderRadius: "10px",
    color: "#EEEEEE",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "800",
    fontSize: "13px",
    letterSpacing: "1px",
    textTransform: "uppercase",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(216,64,64,0.25)",
    marginTop: "auto"
  },
  btnDisabled: {
    opacity: 0.35,
    cursor: "not-allowed",
    boxShadow: "none"
  }
}
