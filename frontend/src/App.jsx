import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Simulate from './pages/Simulate.jsx'
import Results from './pages/Results.jsx'
import History from './pages/History.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simulate" element={<Simulate />} />
        <Route path="/results/:id" element={<Results />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Layout>
  )
}
