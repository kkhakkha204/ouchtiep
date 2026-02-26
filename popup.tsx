import React, { useState } from "react"

import "./styles/global.css"

import { AuthProvider } from "~context/AuthContext"
import Account from "./tabs/Account"
import Confession from "./tabs/Confession"
import Stats from "./tabs/Stats"

type Tab = "confession" | "stats" | "account"

export default function Popup() {
  const [activeTab, setActiveTab] = useState<Tab>("confession")

  const tabs: { key: Tab; label: string }[] = [
    { key: "confession", label: "Confession" },
    { key: "stats", label: "Thống kê" },
    { key: "account", label: "Tài khoản" }
  ]

  return (
    <AuthProvider>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.noise} />
          <span style={styles.logo}>Ouch!</span>
        </div>

        {/* Tabs */}
        <div style={styles.tabBar}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                ...styles.tabBtn,
                ...(activeTab === tab.key ? styles.tabBtnActive : {})
              }}>
              {tab.label}
              {activeTab === tab.key && <span style={styles.tabUnderline} />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={styles.content}>
          {activeTab === "confession" && <Confession />}
          {activeTab === "stats" && <Stats />}
          {activeTab === "account" && <Account />}
        </div>
      </div>
    </AuthProvider>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "380px",
    minHeight: "500px",
    background: "#1D1616",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Montserrat', sans-serif",
    overflow: "hidden"
  },
  header: {
    position: "relative",
    background:
      "linear-gradient(135deg, #D84040 0%, #8E1616 50%, #1D1616 100%)",
    padding: "32px 24px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  noise: {
    position: "absolute",
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
    opacity: 0.15,
    pointerEvents: "none"
  },
  logo: {
    position: "relative",
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "52px",
    fontWeight: "900",
    color: "#EEEEEE",
    letterSpacing: "-2px",
    textShadow: "0 2px 24px rgba(0,0,0,0.4), 0 0 60px rgba(216,64,64,0.3)",
    userSelect: "none"
  },
  tabBar: {
    display: "flex",
    borderBottom: "1px solid rgba(142,22,22,0.3)",
    background: "#1D1616",
    padding: "0 4px"
  },
  tabBtn: {
    flex: 1,
    position: "relative",
    background: "none",
    border: "none",
    color: "rgba(238,238,238,0.4)",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: "600",
    fontSize: "11px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    padding: "12px 8px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px"
  },
  tabBtnActive: {
    color: "#EEEEEE"
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    right: "20%",
    height: "2px",
    background: "linear-gradient(90deg, #D84040, #8E1616)",
    borderRadius: "2px 2px 0 0"
  },
  content: {
    flex: 1,
    overflowY: "auto"
  }
}
