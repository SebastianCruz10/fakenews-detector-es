import { useState, useEffect, useCallback } from 'react'

const KEY_HISTORY = 'fnd_history'
const KEY_MODEL   = 'fnd_active_model'

function readJson(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

/**
 * Hook personalizado para manejar el estado de sesión.
 * El historial y el modelo activo se persisten en sessionStorage:
 * sobreviven a un F5 pero se limpian al cerrar la pestaña.
 */
export function useSession() {
  const [history, setHistory] = useState(() => readJson(KEY_HISTORY, []))
  const [activeModel, setActiveModel] = useState(
    () => {
      try { return sessionStorage.getItem(KEY_MODEL) || 'mrbert-es_E1' }
      catch { return 'mrbert-es_E1' }
    }
  )

  // Sincronizar historial con sessionStorage cada vez que cambia
  useEffect(() => {
    try { sessionStorage.setItem(KEY_HISTORY, JSON.stringify(history)) } catch {}
  }, [history])

  // Sincronizar modelo activo con sessionStorage cada vez que cambia
  useEffect(() => {
    try { sessionStorage.setItem(KEY_MODEL, activeModel) } catch {}
  }, [activeModel])

  const addToHistory = useCallback((entry) => {
    const newEntry = {
      id: entry.id ?? Date.now(),
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
  }, [])

  const updateEntryShap = useCallback((entryId, shapTokens) => {
    setHistory(prev =>
      prev.map(entry =>
        entry.id === entryId ? { ...entry, shap_tokens: shapTokens } : entry
      )
    )
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return {
    history,
    activeModel,
    addToHistory,
    clearHistory,
    setActiveModel,
    updateEntryShap,
  }
}
