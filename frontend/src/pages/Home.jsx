import { useNavigate } from 'react-router-dom'
import { Zap, Brain, Network, FileText, ChevronRight } from 'lucide-react'
import styles from './Home.module.css'

const FEATURES = [
  { icon: Brain, title: 'Multi-Agent AI', desc: 'Up to 10 distinct AI personas with unique personalities, roles, and communication styles debate your topic.' },
  { icon: Network, title: 'Swarm Intelligence', desc: 'Agents read each other\'s messages and evolve their positions across multiple rounds of discussion.' },
  { icon: FileText, title: 'Prediction Reports', desc: 'Get a structured report with insights, consensus, disagreements, and a final prediction with confidence score.' },
  { icon: Zap, title: 'Instant Results', desc: 'Parallel agent execution means full simulations complete in seconds, not minutes.' },
]

const EXAMPLE_TOPICS = [
  'Will AI replace software engineers by 2030?',
  'Should governments regulate social media algorithms?',
  'Is remote work better than office work long-term?',
  'Will electric vehicles fully replace combustion engines by 2035?',
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.pill} style={{ animationDelay: '0s' }}>
          <span className={styles.pillDot} />
          <span className="mono">Multi-Agent Simulation Engine</span>
        </div>

        <h1 className={styles.headline} style={{ animationDelay: '0.1s' }}>
          Predict Anything With<br />
          <span className={styles.gradText}>AI Swarm Intelligence</span>
        </h1>

        <p className={styles.sub} style={{ animationDelay: '0.2s' }}>
          Deploy a swarm of AI agents with distinct personalities to simulate debates,
          predict outcomes, and surface insights on any topic.
        </p>

        <div className={styles.actions} style={{ animationDelay: '0.3s' }}>
          <button className={styles.btnPrimary} onClick={() => navigate('/simulate')}>
            <Zap size={16} /> Start Simulation
          </button>
          <button className={styles.btnSecondary} onClick={() => navigate('/history')}>
            View Past Runs <ChevronRight size={14} />
          </button>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
          <div
            key={title}
            className={styles.card}
            style={{ animationDelay: `${0.4 + i * 0.08}s` }}
          >
            <div className={styles.cardIcon}>
              <Icon size={20} />
            </div>
            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.cardDesc}>{desc}</p>
          </div>
        ))}
      </section>

      {/* Example topics */}
      <section className={styles.examples}>
        <h2 className={styles.sectionTitle}>Try these topics</h2>
        <div className={styles.topicGrid}>
          {EXAMPLE_TOPICS.map((topic) => (
            <button
              key={topic}
              className={styles.topicChip}
              onClick={() => navigate('/simulate', { state: { topic } })}
            >
              <span>{topic}</span>
              <ChevronRight size={13} className={styles.chipArrow} />
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <div className={styles.steps}>
          {['Enter a topic or question', 'Configure agents & rounds', 'Agents debate in parallel', 'Get your prediction report'].map((step, i) => (
            <div key={step} className={styles.step}>
              <div className={styles.stepNum} style={{ background: `hsl(${240 + i * 30}, 70%, 65%)` }}>
                {i + 1}
              </div>
              <span className={styles.stepText}>{step}</span>
              {i < 3 && <ChevronRight size={14} className={styles.stepArrow} />}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
