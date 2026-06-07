import { useState } from 'react'

/**
 * Hook personalizado para manejar el estado de sesión.
 * El historial vive solo en memoria (useState) y se pierde al cerrar el navegador.
 */
export function useSession() {
  const [history, setHistory] = useState([])
  const [activeModel, setActiveModel] = useState('mrbert-es_E1')

  /**
   * Agrega una predicción al inicio del historial.
   * Estructura de entry: { text, label, confidence, probabilities, model_id, shap_tokens }
   */
  function addToHistory(entry) {
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      text: entry.text,
      label: entry.label,
      confidence: entry.confidence,
      probabilities: entry.probabilities,
      model_id: entry.model_id,
      shap_tokens: entry.shap_tokens || [],
    }
    setHistory(prev => [newEntry, ...prev])
  }

  /**
   * Actualiza los shap_tokens de la entrada más reciente del historial.
   * Las entradas se prependen, por lo que history[0] es siempre la más reciente.
   */
  function updateLastEntryShap(shapTokens) {
    setHistory(prev => {
      if (prev.length === 0) return prev
      const [first, ...rest] = prev
      return [{ ...first, shap_tokens: shapTokens }, ...rest]
    })
  }

  /**
   * Elimina todas las entradas del historial de sesión.
   */
  function clearHistory() {
    setHistory([])
  }

  return {
    history,
    activeModel,
    addToHistory,
    clearHistory,
    setActiveModel,
    updateLastEntryShap,
  }
}
