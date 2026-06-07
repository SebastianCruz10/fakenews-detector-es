import { useState } from 'react'
import { useSession } from './hooks/useSession'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Analizar from './pages/Analizar'
import Comparativa from './pages/Comparativa'
import Historial from './pages/Historial'
import Modelo from './pages/Modelo'

/**
 * Componente raíz de FakeDetector ES.
 * Gestiona el tab activo y el estado global de sesión mediante useSession.
 * La navegación es por estado (sin react-router-dom).
 *
 * El estado de la página Analizar se eleva aquí para que persista
 * cuando el usuario cambia de pestaña y regresa.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('analizar')

  const {
    history,
    activeModel,
    addToHistory,
    clearHistory,
    setActiveModel,
  } = useSession()

  // ── Estado elevado de Analizar (persiste entre cambios de pestaña) ──
  const [analizarInputText,  setAnalizarInputText]  = useState('')
  const [analizarInputMode,  setAnalizarInputMode]  = useState('texto')
  const [analizarResultado,  setAnalizarResultado]  = useState(null)
  const [analizarShapTokens, setAnalizarShapTokens] = useState(null)
  const [analizarError,      setAnalizarError]      = useState(null)

  // Renderiza la página correspondiente al tab activo
  function renderPage() {
    switch (activeTab) {
      case 'analizar':
        return (
          <Analizar
            activeModel={activeModel}
            onAddToHistory={addToHistory}
            inputText={analizarInputText}
            setInputText={setAnalizarInputText}
            inputMode={analizarInputMode}
            setInputMode={setAnalizarInputMode}
            resultado={analizarResultado}
            setResultado={setAnalizarResultado}
            shapTokens={analizarShapTokens}
            setShapTokens={setAnalizarShapTokens}
            error={analizarError}
            setError={setAnalizarError}
          />
        )
      case 'comparativa':
        return <Comparativa />
      case 'historial':
        return (
          <Historial
            history={history}
            onClearHistory={clearHistory}
          />
        )
      case 'modelo':
        return (
          <Modelo
            activeModel={activeModel}
            onModelChange={setActiveModel}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeModel={activeModel}
      />
      <div className="flex-1">
        {renderPage()}
      </div>
      <Footer />
    </div>
  )
}
