import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ExamsProvider } from './context/ExamsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* AuthProvider y ExamsProvider envuelven <App/> una sola vez, por eso
          el usuario logueado y la lista de exámenes sobreviven a la
          navegación entre rutas (no se reinician al cambiar de página). */}
      <AuthProvider>
        <ExamsProvider>
          <App />
        </ExamsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
