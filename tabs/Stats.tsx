import React, { useEffect, useState } from "react"
import { useAuth } from "~/context/AuthContext"
import { supabase } from "~/lib/supabase"

interface Confession {
  id: string
  content: string
  created_at: string
  is_public: boolean
  is_anonymous: boolean
}

export default function Stats() {
  const { user, loading: authLoading } = useAuth()
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    fetchStats()
  }, [user])

  const fetchStats = async () => {
    setLoading(true)
    setError(null)

    const { data, error, count } = await supabase
      .from("confessions")
      .select("id, content, created_at, is_public, is_anonymous", { count: "exact" })
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (error) {
      setError("Không tải được dữ liệu.")
    } else {
      setConfessions(data ?? [])
      setTotal(count ?? 0)
    }

    setLoading(false)
  }

  // Loading auth
  if (authLoading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
      </div>
    )
  }

  // Chưa đăng nhập
  if (!user) {
    return (
      <div style={styles.centered}>
        <span style={styles.lockIcon}>🔒</span>
        <p style={styles.emptyTitle}>Cần đăng nhập</p>
        <p style={styles.emptyDesc}>
          Đăng nhập để xem thống kê confession của bạn.
        </p>
      </div>
    )
  }

  // Loading data
  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Tổng số */}
      <div style={styles.statCard}>
        <p style={styles.statNumber}>{total}</p>
        <p style={styles.statLabel}>Confession đã viết</p>
      </div>

      {/* Confession gần đây */}
      <div style={styles.section}>
        <p style={styles.sectionLabel}>Gần đây</p>

        {error && <p style={styles.errorText}>{error}</p>}

        {!error && confessions.length === 0 && (
          <div style={styles.emptyBox}>
            <p style={styles.emptyTitle}>Chưa có confession nào</p>
            <p style={styles.emptyDesc}>Hãy viết confession đầu tiên của bạn.</p>
          </div>
        )}

        {confessions.map((c) => (
          <div key={c.id} style={styles.confessionCard}>
            <div style={styles.cardMeta}>
              <span style={styles.cardBadge}>
                {c.is_public ? "🌐 Công khai" : "📦 Riêng tư"}
              </span>
              <span style={styles.cardDate}>
                {formatDate(c.created_at)}
              </span>
            </div>
            <p style={styles.cardContent}>
              {c.content.length > 120
                ? c.content.slice(0, 120) + "..."
                : c.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  })
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    minHeight: "340px",
    background: "#1D1616"
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    minHeight: "280px",
    padding: "24px"
  },
  spinner: {
    width: "24px",
    height: "24px",
    border: "2px solid rgba(216,64,64,0.2)",
    borderTop: "2px solid #D84040",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  },
  lockIcon: {
    fontSize: "32px",
    marginBottom: "4px"
  },
  statCard: {
    padding: "20px",
    background: "rgba(216,64,64,0.07)",
    border: "1px solid rgba(216,64,64,0.2)",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px"
  },
  statNumber: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "900",
    fontSize: "42px",
    color: "#D84040",
    letterSpacing: "-2px",
    lineHeight: 1
  },
  statLabel: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "10px",
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: "rgba(238,238,238,0.35)"
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  sectionLabel: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "10px",
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: "rgba(238,238,238,0.4)"
  },
  confessionCard: {
    padding: "12px 14px",
    background: "rgba(238,238,238,0.03)",
    border: "1px solid rgba(142,22,22,0.25)",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardBadge: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "9px",
    letterSpacing: "0.5px",
    color: "rgba(238,238,238,0.3)"
  },
  cardDate: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "500",
    fontSize: "9px",
    color: "rgba(238,238,238,0.2)"
  },
  cardContent: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "500",
    fontSize: "12px",
    color: "rgba(238,238,238,0.65)",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word"
  },
  emptyBox: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px"
  },
  emptyTitle: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "700",
    fontSize: "13px",
    color: "rgba(238,238,238,0.4)"
  },
  emptyDesc: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "500",
    fontSize: "11px",
    color: "rgba(238,238,238,0.2)",
    textAlign: "center",
    lineHeight: "1.5"
  },
  errorText: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "11px",
    color: "#D84040"
  }
}