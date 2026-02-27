import React, { useState } from "react"

import { useAuth } from "~/context/AuthContext"
import { supabase } from "~/lib/supabase"

interface SaveFormProps {
  content: string
  imageUrls: string[]
  onSuccess: () => void
  onBack: () => void
}

export const SaveForm: React.FC<SaveFormProps> = ({
  content,
  imageUrls,
  onSuccess,
  onBack
}) => {
  const { user, signIn, signUp } = useAuth()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  const handleAuth = async () => {
    setAuthError(null)
    if (!email.trim() || !password.trim()) {
      setAuthError("Vui lòng điền đầy đủ.")
      return
    }
    if (authMode === "register" && !displayName.trim()) {
      setAuthError("Vui lòng nhập tên hiển thị.")
      return
    }
    setAuthLoading(true)
    if (authMode === "login") {
      const { error } = await signIn(email, password)
      if (error) setAuthError(error)
    } else {
      const { error } = await signUp(email, password, displayName)
      if (error) setAuthError(error)
    }
    setAuthLoading(false)
  }

  const handleSave = async () => {
    setError(null)
    setSubmitting(true)

    const { error: insertError } = await supabase.from("confessions").insert({
      user_id: user?.id,
      content,
      is_public: false,
      is_anonymous: false,
      image_urls: imageUrls
    })

    if (insertError) {
      setError("Có lỗi xảy ra. Thử lại nhé.")
      setSubmitting(false)
      return
    }

    onSuccess()
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>
          ← Quay lại
        </button>
        <p style={styles.title}>Cất giữ confession</p>
      </div>

      <div style={styles.infoBox}>
        <span style={styles.infoIcon}>📦</span>
        <p style={styles.infoText}>
          Confession sẽ được lưu vào kho riêng tư của bạn. Chỉ bạn mới xem được.
        </p>
      </div>

      {!user && (
        <div style={styles.authSection}>
          <p style={styles.authNote}>
            Bạn cần đăng nhập để lưu confession vào kho.
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

          {authMode === "register" && (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tên hiển thị"
              style={styles.input}
            />
          )}
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

      {user && (
        <div style={styles.readyBox}>
          <span style={styles.readyIcon}>✓</span>
          <p style={styles.readyText}>
            Đã đăng nhập với{" "}
            <strong>{user.user_metadata?.full_name ?? user.email}</strong>
          </p>
        </div>
      )}

      {error && <p style={styles.errorText}>{error}</p>}

      <button
        style={{
          ...styles.submitBtn,
          ...(!user || submitting ? styles.btnDisabled : {})
        }}
        onClick={handleSave}
        disabled={!user || submitting}>
        {submitting ? "Đang lưu..." : "📦 Lưu vào kho"}
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
  header: { display: "flex", alignItems: "center", gap: "12px" },
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
  infoBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "12px",
    background: "rgba(238,238,238,0.03)",
    border: "1px solid rgba(142,22,22,0.2)",
    borderRadius: "10px"
  },
  infoIcon: { fontSize: "18px", flexShrink: 0 },
  infoText: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "500",
    fontSize: "11px",
    color: "rgba(238,238,238,0.4)",
    lineHeight: "1.6"
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
  authToggle: { display: "flex", gap: "6px" },
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
  readyBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    background: "rgba(34,197,94,0.06)",
    border: "1px solid rgba(34,197,94,0.2)",
    borderRadius: "8px"
  },
  readyIcon: { fontSize: "14px", color: "rgba(134,239,172,0.9)" },
  readyText: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "500",
    fontSize: "11px",
    color: "rgba(134,239,172,0.9)"
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
  btnDisabled: { opacity: 0.35, cursor: "not-allowed", boxShadow: "none" }
}
