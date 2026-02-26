import React, { useState } from "react"

import { useAuth } from "~context/AuthContext"

type AuthMode = "login" | "register"

export default function Account() {
  const { user, loading, signIn, signUp, signOut } = useAuth()

  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    setSuccessMsg(null)

    if (!email.trim() || !password.trim()) {
      setError("Vui lòng điền đầy đủ thông tin.")
      return
    }
    if (password.length < 6) {
      setError("Mật khẩu tối thiểu 6 ký tự.")
      return
    }

    setSubmitting(true)

    if (mode === "login") {
      const { error } = await signIn(email, password)
      if (error) setError(mapError(error))
    } else {
      const { error } = await signUp(email, password)
      if (error) setError(mapError(error))
      else setSuccessMsg("Đăng ký thành công! Kiểm tra email để xác nhận.")
    }

    setSubmitting(false)
  }

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
      </div>
    )
  }

  // ── Đã đăng nhập ─────────────────────────────────────────
  if (user) {
    const avatarLetter = (user.email ?? "?")[0].toUpperCase()

    return (
      <div style={styles.loggedInContainer}>
        {/* Avatar */}
        <div style={styles.avatarRing}>
          <div style={styles.avatar}>{avatarLetter}</div>
        </div>

        {/* Info */}
        <div style={styles.userInfo}>
          <p style={styles.userName}>
            {user.user_metadata?.full_name ?? "Chiến binh ẩn danh"}
          </p>
          <p style={styles.userEmail}>{user.email}</p>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Sign out */}
        <button style={styles.signOutBtn} onClick={signOut}>
          <span>↩</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    )
  }

  // ── Chưa đăng nhập ────────────────────────────────────────
  return (
    <div style={styles.authContainer}>
      {/* Mode toggle */}
      <div style={styles.modeToggle}>
        <button
          style={{
            ...styles.modeBtn,
            ...(mode === "login" ? styles.modeBtnActive : {})
          }}
          onClick={() => {
            setMode("login")
            setError(null)
            setSuccessMsg(null)
          }}>
          Đăng nhập
        </button>
        <button
          style={{
            ...styles.modeBtn,
            ...(mode === "register" ? styles.modeBtnActive : {})
          }}
          onClick={() => {
            setMode("register")
            setError(null)
            setSuccessMsg(null)
          }}>
          Đăng ký
        </button>
      </div>

      {/* Form */}
      <div style={styles.form}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={styles.input}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={styles.input}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div style={styles.successBox}>
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Submit */}
        <button
          style={{
            ...styles.submitBtn,
            ...(submitting ? styles.submitBtnDisabled : {})
          }}
          onClick={handleSubmit}
          disabled={submitting}>
          {submitting
            ? "Đang xử lý..."
            : mode === "login"
              ? "Đăng nhập"
              : "Tạo tài khoản"}
        </button>
      </div>
    </div>
  )
}

// ── Error mapping ─────────────────────────────────────────
function mapError(msg: string): string {
  if (msg.includes("Invalid login credentials"))
    return "Email hoặc mật khẩu không đúng."
  if (msg.includes("Email not confirmed"))
    return "Email chưa được xác nhận. Kiểm tra hộp thư."
  if (msg.includes("User already registered"))
    return "Email này đã được đăng ký."
  if (msg.includes("Password should be")) return "Mật khẩu tối thiểu 6 ký tự."
  return msg
}

// ── Styles ────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "280px"
  },

  spinner: {
    width: "24px",
    height: "24px",
    border: "2px solid rgba(216,64,64,0.2)",
    borderTop: "2px solid #D84040",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  },

  // --- Logged in ---
  loggedInContainer: {
    padding: "28px 20px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    minHeight: "280px"
  },

  avatarRing: {
    padding: "3px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #D84040, #8E1616)",
    marginBottom: "4px"
  },

  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#1D1616",
    border: "2px solid #1D1616",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "800",
    fontSize: "22px",
    color: "#EEEEEE"
  },

  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px"
  },

  userName: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "700",
    fontSize: "15px",
    color: "#EEEEEE",
    letterSpacing: "-0.3px"
  },

  userEmail: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "500",
    fontSize: "11px",
    color: "rgba(238,238,238,0.35)",
    letterSpacing: "0.2px"
  },

  divider: {
    width: "100%",
    height: "1px",
    background: "rgba(142,22,22,0.25)",
    margin: "4px 0"
  },

  signOutBtn: {
    width: "100%",
    padding: "11px 16px",
    background: "transparent",
    border: "1px solid rgba(142,22,22,0.4)",
    borderRadius: "10px",
    color: "rgba(238,238,238,0.5)",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "12px",
    letterSpacing: "0.5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "border-color 0.2s, color 0.2s"
  },

  // --- Auth form ---
  authContainer: {
    padding: "20px 20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    minHeight: "280px"
  },

  modeToggle: {
    display: "flex",
    background: "rgba(238,238,238,0.04)",
    borderRadius: "8px",
    padding: "3px",
    gap: "3px"
  },

  modeBtn: {
    flex: 1,
    padding: "8px",
    background: "transparent",
    border: "none",
    borderRadius: "6px",
    color: "rgba(238,238,238,0.35)",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "11px",
    letterSpacing: "0.5px",
    cursor: "pointer",
    transition: "all 0.2s"
  },

  modeBtnActive: {
    background: "rgba(216,64,64,0.15)",
    color: "#EEEEEE",
    borderRadius: "6px"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },

  label: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "10px",
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: "rgba(238,238,238,0.4)"
  },

  input: {
    width: "100%",
    padding: "10px 14px",
    background: "rgba(238,238,238,0.04)",
    border: "1px solid rgba(142,22,22,0.4)",
    borderRadius: "8px",
    color: "#EEEEEE",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "500",
    fontSize: "13px",
    outline: "none",
    caretColor: "#D84040"
  },

  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "10px 12px",
    background: "rgba(216,64,64,0.08)",
    border: "1px solid rgba(216,64,64,0.25)",
    borderRadius: "8px",
    color: "#D84040",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "11px",
    lineHeight: "1.5"
  },

  errorIcon: {
    fontSize: "12px",
    flexShrink: 0,
    marginTop: "1px"
  },

  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    background: "rgba(34,197,94,0.06)",
    border: "1px solid rgba(34,197,94,0.2)",
    borderRadius: "8px",
    color: "rgba(134,239,172,0.9)",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "11px"
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
    marginTop: "4px"
  },

  submitBtnDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
    boxShadow: "none"
  }
}
