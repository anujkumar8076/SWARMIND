import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { getSimulation } from '../utils/api.js'
import { Loader, MessageSquare, BarChart3, ChevronDown, ChevronUp, ArrowLeft, Share2 } from 'lucide-react'
import styles from './Results.module.css'

export default function Results() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [data, setData] = useState(location.state?.result || null)
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState('')
  const [activeRound, setActiveRound] = useState(1)
  const [expandedReport, setExpandedReport] = useState(true)

  useEffect(() => {
    if (!data) {
      getSimulation(id)
        .then(setData)
        .catch(() => setError('Simulation not found.'))
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) return (
    <div className={styles.center}>
      <Loader size={32} className={styles.spin} />
      <p style={{ color: 'var(--text-muted)', marginTop: 16 }}>Loading simulation...</p>
    </div>
  )

  if (error) return (
    <div className={styles.center}>
      <p style={{ color: 'var(--danger)' }}>{error}</p>
      <button className={styles.backBtn} onClick={() => navigate('/history')}>View History</button>
    </div>
  )

  if (!data) return null

  const { topic, agents, conversations, report } = data
  const maxRound = Math.max(...conversations.map(c => c.round))
  const rounds = Array.from({ length: maxRound }, (_, i) => i + 1)

  const roundConvos = conversations.filter(c => c.round === activeRound)

  const confidence = report?.confidence_score ?? 50

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backLink} onClick={() => navigate('/simulate')}>
          <ArrowLeft size={14} /> New Simulation
        </button>

        <div className={styles.topicBar}>
          <span className={styles.topicLabel}>TOPIC</span>
          <h1 className={styles.topic}>{topic}</h1>
        </div>

        <div className={styles.meta}>
          <span className={styles.metaChip}><MessageSquare size={12} /> {conversations.length} messages</span>
          <span className={styles.metaChip}>{agents.length} agents</span>
          <span className={styles.metaChip}>{maxRound} rounds</span>
          <span className={styles.metaChip} style={{ color: 'var(--success)', borderColor: 'rgba(16,185,129,0.3)' }}>✓ Completed</span>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left: Conversation */}
        <section className={styles.convoSection}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}><MessageSquare size={15} /> Agent Debate</h2>
            <div className={styles.roundTabs}>
              {rounds.map(r => (
                <button
                  key={r}
                  className={`${styles.roundTab} ${activeRound === r ? styles.roundTabActive : ''}`}
                  onClick={() => setActiveRound(r)}
                >
                  R{r}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.messages}>
            {roundConvos.map((msg, i) => (
              <div
                key={msg.id}
                className={styles.message}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div
                  className={styles.avatar}
                  style={{ background: msg.agent_color + '22', color: msg.agent_color, borderColor: msg.agent_color + '44' }}
                >
                  {msg.agent_avatar}
                </div>
                <div className={styles.bubble}>
                  <div className={styles.agentMeta}>
                    <span className={styles.agentName} style={{ color: msg.agent_color }}>
                      {msg.agent_name}
                    </span>
                    <span className={styles.agentRoundLabel}>Round {msg.round}</span>
                  </div>
                  <p className={styles.msgText}>{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Report + Agents */}
        <aside className={styles.sidebar}>
          {/* Agent roster */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Agent Swarm</h3>
            <div className={styles.agentList}>
              {agents.map(agent => (
                <div key={agent.id} className={styles.agentRow}>
                  <div
                    className={styles.agentAvatar}
                    style={{ background: agent.color + '22', color: agent.color, borderColor: agent.color + '44' }}
                  >
                    {agent.avatar}
                  </div>
                  <div>
                    <div className={styles.agentRowName}>{agent.name}</div>
                    <div className={styles.agentRowTrait}>{agent.trait}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report */}
          {report && (
            <div className={styles.card}>
              <div className={styles.reportHeader} onClick={() => setExpandedReport(e => !e)}>
                <h3 className={styles.cardTitle}><BarChart3 size={14} /> Prediction Report</h3>
                {expandedReport ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>

              {expandedReport && (
                <div className={styles.reportBody}>
                  {/* Confidence */}
                  <div className={styles.confidenceBlock}>
                    <div className={styles.confidenceLabel}>Confidence Score</div>
                    <div className={styles.confidenceBar}>
                      <div
                        className={styles.confidenceFill}
                        style={{
                          width: `${confidence}%`,
                          background: confidence > 70 ? 'var(--success)' : confidence > 40 ? 'var(--warning)' : 'var(--danger)'
                        }}
                      />
                    </div>
                    <div className={styles.confidenceNum}>{confidence}%</div>
                  </div>

                  {/* Prediction */}
                  {report.prediction && (
                    <div className={styles.reportSection}>
                      <div className={styles.reportSectionLabel}>Prediction</div>
                      <p className={styles.reportSectionText}>{report.prediction}</p>
                    </div>
                  )}

                  {/* Summary */}
                  {report.summary && (
                    <div className={styles.reportSection}>
                      <div className={styles.reportSectionLabel}>Summary</div>
                      <p className={styles.reportSectionText}>{report.summary}</p>
                    </div>
                  )}

                  {/* Key insights */}
                  {report.key_insights?.length > 0 && (
                    <div className={styles.reportSection}>
                      <div className={styles.reportSectionLabel}>Key Insights</div>
                      <ul className={styles.list}>
                        {report.key_insights.map((item, i) => (
                          <li key={i} className={styles.listItem}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Consensus */}
                  {report.consensus_points?.length > 0 && (
                    <div className={styles.reportSection}>
                      <div className={styles.reportSectionLabel} style={{ color: 'var(--success)' }}>Consensus</div>
                      <ul className={styles.list}>
                        {report.consensus_points.map((item, i) => (
                          <li key={i} className={styles.listItem} style={{ borderColor: 'rgba(16,185,129,0.3)' }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Disagreements */}
                  {report.disagreements?.length > 0 && (
                    <div className={styles.reportSection}>
                      <div className={styles.reportSectionLabel} style={{ color: 'var(--warning)' }}>Disagreements</div>
                      <ul className={styles.list}>
                        {report.disagreements.map((item, i) => (
                          <li key={i} className={styles.listItem} style={{ borderColor: 'rgba(245,158,11,0.3)' }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  {report.recommended_actions?.length > 0 && (
                    <div className={styles.reportSection}>
                      <div className={styles.reportSectionLabel}>Recommended Actions</div>
                      <ul className={styles.list}>
                        {report.recommended_actions.map((item, i) => (
                          <li key={i} className={styles.listItem}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
