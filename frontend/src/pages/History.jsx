import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistory, deleteSimulation } from '../utils/api.js'
import { Clock, MessageSquare, Users, Trash2, ChevronRight, Loader, Inbox } from 'lucide-react'
import styles from './History.module.css'

export default function History() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    getHistory()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this simulation?')) return
    setDeleting(id)
    await deleteSimulation(id).catch(() => {})
    setHistory(h => h.filter(s => s.simulation_id !== id))
    setDeleting(null)
  }

  const fmt = (iso) => {
    try {
      return new Date(iso).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    } catch { return iso }
  }

  if (loading) return (
    <div className={styles.center}>
      <Loader size={28} className={styles.spin} />
      <p style={{ color: 'var(--text-muted)', marginTop: 14 }}>Loading history...</p>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Simulation History</h1>
        <p className={styles.subtitle}>{history.length} past simulation{history.length !== 1 ? 's' : ''} stored locally</p>
      </div>

      {history.length === 0 ? (
        <div className={styles.empty}>
          <Inbox size={40} style={{ color: 'var(--text-dim)' }} />
          <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>No simulations yet.</p>
          <button className={styles.emptyBtn} onClick={() => navigate('/simulate')}>
            Run your first simulation
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {history.map((sim, i) => (
            <div
              key={sim.simulation_id}
              className={styles.row}
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => navigate(`/results/${sim.simulation_id}`)}
            >
              <div className={styles.rowMain}>
                <div className={styles.rowId} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
                  #{sim.simulation_id}
                </div>
                <p className={styles.rowTopic}>{sim.topic}</p>
                <div className={styles.rowMeta}>
                  <span><Clock size={11} /> {fmt(sim.created_at)}</span>
                  <span><Users size={11} /> {sim.num_agents} agents</span>
                  <span><MessageSquare size={11} /> {sim.num_conversations} messages</span>
                </div>
              </div>
              <div className={styles.rowActions}>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDelete(e, sim.simulation_id)}
                  disabled={deleting === sim.simulation_id}
                >
                  {deleting === sim.simulation_id
                    ? <Loader size={14} className={styles.spin} />
                    : <Trash2 size={14} />}
                </button>
                <ChevronRight size={16} style={{ color: 'var(--text-dim)' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
