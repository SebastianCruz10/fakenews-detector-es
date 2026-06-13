import { useState, useCallback } from 'react'
import { useSession } from './hooks/useSession'
import { useAnalizarState } from './hooks/useAnalizarState'
import { useBackendStatus } from './hooks/useBackendStatus'
import { ErrorBoundary } from './components/ErrorBoundary'
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
  const backendStatus = useBackendStatus()

  const {
    history,
    activeModel,
    addToHistory,
    clearHistory,
    setActiveModel,
    updateEntryShap,
  } = useSession()

  // ── Estado elevado de Analizar (persiste entre cambios de pestaña) ──
  const [analizarState, setAnalizar] = useAnalizarState()

  // Estable gracias a useCallback en useSession; deps vacías porque updateEntryShap no cambia
  const handleUpdateShapInHistory = useCallback((entryId, shapTokens) => {
    updateEntryShap(entryId, shapTokens)
  }, [updateEntryShap])

  // Restauración atómica: un solo dispatch → un solo re-render
  const handleSelectEntry = useCallback((entry) => {
    setAnalizar.restoreFromHistory({
      inputText: entry.text,
      resultado: {
        label:         entry.label,
        confidence:    entry.confidence,
        probabilities: entry.probabilities,
        model_id:      entry.model_id,
        _analyzedText: entry.text,
        _entryId:      entry.id,
      },
      shapTokens: entry.shap_tokens?.length > 0 ? entry.shap_tokens : null,
    })
    setActiveTab('analizar')
  }, [setAnalizar])

  // Renderiza la página correspondiente al tab activo
  function renderPage() {
    switch (activeTab) {
      case 'analizar':
        return (
          <Analizar
            activeModel={activeModel}
            onAddToHistory={addToHistory}
            onUpdateShapInHistory={handleUpdateShapInHistory}
            state={analizarState}
            set={setAnalizar}
          />
        )
      case 'comparativa':
        return <Comparativa />
      case 'historial':
        return (
          <Historial
            history={history}
            onClearHistory={clearHistory}
            onSelectEntry={handleSelectEntry}
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

      {/* Banner de cold start — visible hasta que el backend confirme modelo cargado */}
      {backendStatus !== 'ready' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
          <div className="max-w-5xl mx-auto flex items-center gap-3 text-sm text-amber-800">
            <svg className="w-4 h-4 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>
              {backendStatus === 'checking'
                ? 'Verificando disponibilidad del servidor…'
                : 'El servidor está iniciando. En el primer acceso puede tardar entre 3 y 8 minutos. La página se actualizará automáticamente cuando esté listo.'}
            </span>
          </div>
        </div>
      )}

      <div className="flex-1">
        <ErrorBoundary key={activeTab}>
          {renderPage()}
        </ErrorBoundary>
      </div>
      <Footer />
    </div>
  )
}
