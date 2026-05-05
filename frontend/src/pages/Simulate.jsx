import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Zap, Users, RotateCcw, Info, Loader } from 'lucide-react'
import { runSimulation } from '../utils/api.js'
import styles from './Simulate.module.css'

const AGENT_ROLES = [
  'Analyst', 'Visionary', 'Critic', 'Pragmatist',
  'Ethicist', 'Economist', 'Technologist', 'Sociologist',
  'Historian', "Devil's Advocate"
]

const AGENT_COLORS = [
  '#6366f1','#06b6d4','#f59e0b','#10b981',
  '#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16'
]

export default function Simulate() {
  const navigate = useNavigate()
  const location = useLocation()

  const [topic, setTopic] = useState(location.state?.topic || '')
  const [context, setContext] = useState('')
  const [numAgents, setNumAgents] = useState(6)
  const [numRounds, setNumRounds] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)

  const LOADING_STEPS = [
    'Spawning agent personas...',
    'Injecting topic context...',
    'Round 1: Initial positions...',
    'Agents debating...',
    'Synthesizing consensus...',
    'Generating prediction report...',
  ]

  useEffect(() => {
    let interval
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(s => (s + 1) % LOADING_STEPS.length)
      }, 2200)
    }
    return () => clearInterval(interval)
  }, [loading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!topic.trim()) return setError('Please enter a topic.')
    setError('')
    setLoading(true)
    setLoadingStep(0)

    try {
      const result = await runSimulation({
        topic: topic.trim(),
        context: context.trim() || null,
        num_agents: numAgents,
        num_rounds: numRounds,
      })
      navigate(`/results/${result.simulation_id}`, { state: { result } })
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Simulation failed. Is the backend running?')
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Configure Simulation</h1>
        <p className={styles.subtitle}>Define your topic and agent swarm parameters</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Topic */}
        <div className={styles.field}>
          <label className={styles.label}>
            Topic or Question <span className={styles.req}>*</span>
          </label>
          <textarea
            className={styles.textarea}
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. Will AI replace software engineers by 2030?"
            rows={3}
            disabled={loading}
            maxLength={500}
          />
          <div className={styles.charCount}>{topic.length}/500</div>
        </div>

        {/* Context */}
        <div className={styles.field}>
          <label className={styles.label}>
            Additional Context <span className={styles.optional}>(optional)</span>
          </label>
          <textarea
            className={styles.textarea}
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="Paste an article, data, or background info to ground the simulation..."
            rows={4}
            disabled={loading}
            maxLength={2000}
          />
        </div>

        {/* Sliders */}
        <div className={styles.sliders}>
          <div className={styles.sliderField}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>
                <Users size={13} /> Agents
              </label>
              <span className={styles.sliderVal}>{numAgents}</span>
            </div>
            <input
              type="range" min={3} max={10} value={numAgents}
              onChange={e => setNumAgents(Number(e.target.value))}
              className={styles.slider}
              disabled={loading}
            />
            <div className={styles.agentPreviews}>
              {AGENT_ROLES.slice(0, numAgents).map((role, i) => (
                <div key={role} className={styles.agentPill} style={{ background: AGENT_COLORS[i] + '22', borderColor: AGENT_COLORS[i] + '55', color: AGENT_COLORS[i] }}>
                  {role}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sliderField}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>
                <RotateCcw size={13} /> Rounds
              </label>
              <span className={styles.sliderVal}>{numRounds}</span>
            </div>
            <input
              type="range" min={2} max={8} value={numRounds}
              onChange={e => setNumRounds(Number(e.target.value))}
              className={styles.slider}
              disabled={loading}
            />
            <p className={styles.sliderHint}>
              Each round: all agents respond. More rounds = deeper debate. ~{numAgents * numRounds} total messages.
            </p>
          </div>
        </div>

        {/* Info */}
        <div className={styles.infoBox}>
          <Info size={13} />
          <span>Estimated time: {Math.ceil(numAgents * numRounds * 0.8)}–{Math.ceil(numAgents * numRounds * 1.5)} seconds. API costs ~$0.001–0.01 per simulation.</span>
        </div>

        {/* Error */}
        {error && <div className={styles.errorBox}>{error}</div>}

        {/* Submit */}
        <button type="submit" className={styles.submit} disabled={loading || !topic.trim()}>
          {loading ? (
            <>
              <Loader size={16} className={styles.spin} />
              {LOADING_STEPS[loadingStep]}
            </>
          ) : (
            <>
              <Zap size={16} /> Launch Simulation
            </>
          )}
        </button>
      </form>
    </div>
  )
}
