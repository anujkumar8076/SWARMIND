import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 120000, // 2 min — simulations can take time
  headers: { 'Content-Type': 'application/json' },
})

export const runSimulation = (payload) =>
  api.post('/api/simulate', payload).then(r => r.data)

export const getHistory = () =>
  api.get('/api/history').then(r => r.data)

export const getSimulation = (id) =>
  api.get(`/api/history/${id}`).then(r => r.data)

export const deleteSimulation = (id) =>
  api.delete(`/api/history/${id}`).then(r => r.data)

export default api
