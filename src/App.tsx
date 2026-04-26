import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Games from './pages/Games'
import GameDetail from './pages/GameDetail'
import Narratives from './pages/Narratives'
import Studio from './pages/Studio'
import Analysts from './pages/Analysts'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/games" element={<Games />} />
      <Route path="/games/:id" element={<GameDetail />} />
      <Route path="/narratives" element={<Narratives />} />
      <Route path="/studio" element={<Studio />} />
      <Route path="/analysts" element={<Analysts />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
