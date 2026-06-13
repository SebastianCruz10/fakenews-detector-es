import { useReducer, useMemo } from 'react'

export const ANALIZAR_INITIAL = {
  inputText:        '',
  inputMode:        'texto',
  resultado:        null,
  shapTokens:       null,
  error:            null,
  loading:          false,
  shapLoading:      false,
  shapExpanded:     false,
  warningNoEspanol: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_INPUT_TEXT':         return { ...state, inputText:        action.payload }
    case 'SET_INPUT_MODE':         return { ...state, inputMode:        action.payload }
    case 'SET_RESULTADO':          return { ...state, resultado:        action.payload }
    case 'SET_SHAP_TOKENS':        return { ...state, shapTokens:       action.payload }
    case 'SET_ERROR':              return { ...state, error:            action.payload }
    case 'SET_LOADING':            return { ...state, loading:          action.payload }
    case 'SET_SHAP_LOADING':       return { ...state, shapLoading:      action.payload }
    case 'SET_SHAP_EXPANDED':      return { ...state, shapExpanded:     action.payload }
    case 'SET_WARNING_NO_ESPANOL': return { ...state, warningNoEspanol: action.payload }
    // Restauración atómica desde historial: un solo dispatch = un solo re-render
    case 'RESTORE_FROM_HISTORY':
      return {
        ...ANALIZAR_INITIAL,
        inputText:  action.payload.inputText,
        resultado:  action.payload.resultado,
        shapTokens: action.payload.shapTokens,
      }
    default:
      return state
  }
}

/**
 * Maneja el estado completo de la página Analizar.
 * Devuelve [state, set] donde `set` expone un setter por campo más
 * `restoreFromHistory` para restauraciones atómicas desde el historial.
 */
export function useAnalizarState() {
  const [state, dispatch] = useReducer(reducer, ANALIZAR_INITIAL)

  // `dispatch` es estable (garantía de React) → deps vacías son correctas
  const set = useMemo(() => ({
    inputText:        v => dispatch({ type: 'SET_INPUT_TEXT',         payload: v }),
    inputMode:        v => dispatch({ type: 'SET_INPUT_MODE',         payload: v }),
    resultado:        v => dispatch({ type: 'SET_RESULTADO',          payload: v }),
    shapTokens:       v => dispatch({ type: 'SET_SHAP_TOKENS',        payload: v }),
    error:            v => dispatch({ type: 'SET_ERROR',              payload: v }),
    loading:          v => dispatch({ type: 'SET_LOADING',            payload: v }),
    shapLoading:      v => dispatch({ type: 'SET_SHAP_LOADING',       payload: v }),
    shapExpanded:     v => dispatch({ type: 'SET_SHAP_EXPANDED',      payload: v }),
    warningNoEspanol: v => dispatch({ type: 'SET_WARNING_NO_ESPANOL', payload: v }),
    restoreFromHistory: payload => dispatch({ type: 'RESTORE_FROM_HISTORY', payload }),
  }), [])

  return [state, set]
}
