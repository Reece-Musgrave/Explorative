import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import About from './components/pages/About.tsx'
import Navbar from './components/pages/Navbar.tsx'
import { ClerkProvider } from '@clerk/react-router'
import { BrowserRouter, Routes, Route } from 'react-router'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Clerk Publishable Key not in ENV')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="./components/pages/About.tsx" element={<About />} />
          <Route path="./components/pages/Navbar.tsx" element={<Navbar />} /> 
        </Routes>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
)
