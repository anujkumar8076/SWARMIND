import { NavLink } from 'react-router-dom'
import { Cpu, History, Zap, Home } from 'lucide-react'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  return (
    <div className={styles.shell}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.logo}>
          <Cpu size={18} className={styles.logoIcon} />
          <span className={styles.logoText}>Swar<span className={styles.accent}>Mind</span></span>
        </NavLink>

        <div className={styles.links}>
          <NavLink to="/" end className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            <Home size={14} /> Home
          </NavLink>
          <NavLink to="/simulate" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            <Zap size={14} /> Simulate
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            <History size={14} /> History
          </NavLink>
        </div>

        <div className={styles.badge}>
          <span className={styles.dot} />
          Live
        </div>
      </nav>

      <main className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <span className="mono" style={{ color: 'var(--text-dim)', fontSize: '12px' }}>
          SwarMind v1.0 — Multi-Agent AI Simulation Engine
        </span>
      </footer>
    </div>
  )
}
