import { useState, useEffect, useRef } from 'react'
import { healthCheck } from '../api/client'

const POLL_INTERVAL_MS  = 5_000   // reintentar cada 5 s mientras el backend no responde
const REQUEST_TIMEOUT_MS = 4_000  // tiempo máximo de espera por request de health

/**
 * Monitorea la disponibilidad del backend.
 * Estados:
 *   'checking'  — primer intento en curso, aún no sabemos nada
 *   'starting'  — el backend no responde; probablemente en cold start
 *   'ready'     — backend responde y el modelo está cargado
 */
export function useBackendStatus() {
  const [status, setStatus] = useState('checking')
  const timerRef   = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    async function poll() {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

      try {
        const data = await healthCheck(controller.signal)
        clearTimeout(timeout)
        if (!mountedRef.current) return

        if (data?.modelo_activo) {
          setStatus('ready')
          return  // modelo listo → dejar de hacer polling
        }
        setStatus('starting')
      } catch {
        clearTimeout(timeout)
        if (!mountedRef.current) return
        setStatus('starting')
      }

      // Reintentar mientras no esté listo
      timerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
    }

    poll()

    return () => {
      mountedRef.current = false
      clearTimeout(timerRef.current)
    }
  }, [])

  return status
}
