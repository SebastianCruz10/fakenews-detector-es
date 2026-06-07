import { useState } from 'react'
import { predict as apiPredict, explain as apiExplain, extract as apiExtract } from '../api/client'

/**
 * Página principal de análisis de noticias en español.
 *
 * Props elevadas desde App.jsx (persisten entre cambios de pestaña):
 *   inputText    / setInputText   - texto ingresado en modo directo
 *   inputMode    / setInputMode   - 'texto' | 'url'
 *   resultado    / setResultado   - objeto de predicción (o null)
 *   shapTokens   / setShapTokens  - array de tokens SHAP (o null)
 *   error        / setError       - mensaje de error (o null)
 *
 * Props de sesión:
 *   activeModel     - string: modelo activo seleccionado
 *   onAddToHistory  - function: callback para guardar en el historial
 */
export default function Analizar({
  activeModel,
  onAddToHistory,
  onUpdateShapInHistory,
  inputText,    setInputText,
  inputMode,    setInputMode,
  resultado,    setResultado,
  shapTokens,   setShapTokens,
  error,        setError,
}) {
  // Estado local: no necesita persistir entre pestañas
  const [inputUrl,          setInputUrl]          = useState('')
  const [loading,           setLoading]           = useState(false)
  const [warningNoEspanol,  setWarningNoEspanol]  = useState(false)
  const [shapExpanded,      setShapExpanded]      = useState(false)
  const [shapLoading,       setShapLoading]       = useState(false)

  // Validación del campo activo
  const esUrlValida =
    inputUrl.trim().startsWith('http://') || inputUrl.trim().startsWith('https://')
  const canSubmit =
    !loading &&
    (inputMode === 'texto' ? inputText.trim().length >= 50 : esUrlValida)

  // Cambiar de modo limpia alertas y resultado
  function handleModeChange(nuevoModo) {
    setInputMode(nuevoModo)
    setError(null)
    setWarningNoEspanol(false)
    setResultado(null)
    setShapTokens(null)
    setShapExpanded(false)
  }

  // Flujo principal de análisis
  async function handleAnalizar() {
    setLoading(true)
    setError(null)
    setWarningNoEspanol(false)
    setResultado(null)
    setShapTokens(null)
    setShapExpanded(false)

    try {
      let texto = ''

      if (inputMode === 'url') {
        // Extraer texto del artículo
        let extracted
        try {
          extracted = await apiExtract(inputUrl.trim())
        } catch {
          setError(
            'No se pudo extraer el contenido de la URL. Verifica que sea accesible y apunte a un artículo en español.'
          )
          setLoading(false)
          return
        }

        // Verificar que el contenido sea en español
        if (!extracted.is_spanish) {
          setWarningNoEspanol(true)
          setLoading(false)
          return
        }
        texto = extracted.text
      } else {
        texto = inputText.trim()
      }

      // Llamar al endpoint de predicción
      const prediccion = await apiPredict(texto, activeModel)

      // Guardar resultado elevado; se incluye _analyzedText para la llamada SHAP
      setResultado({ ...prediccion, _analyzedText: texto })

      // Registrar en el historial de sesión
      onAddToHistory({
        text: texto,
        label: prediccion.label,
        confidence: prediccion.confidence,
        probabilities: prediccion.probabilities,
        model_id: prediccion.model_id,
        shap_tokens: [],
      })
    } catch (err) {
      setError(err.message || 'Error al analizar el texto. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Cargar y mostrar/ocultar la explicación SHAP
  async function handleVerExplicacion() {
    // Colapsar si ya está expandido
    if (shapExpanded) {
      setShapExpanded(false)
      return
    }
    setShapExpanded(true)

    // No recargar si ya están los datos
    if (shapTokens !== null) return

    setShapLoading(true)
    try {
      const data = await apiExplain(resultado._analyzedText, activeModel)
      const tokens = data.tokens || []
      setShapTokens(tokens)
      // Persistir los tokens SHAP en la entrada del historial correspondiente
      onUpdateShapInHistory(tokens)
    } catch {
      setShapTokens([])
    } finally {
      setShapLoading(false)
    }
  }

  // Valor máximo absoluto de SHAP para normalizar las barras
  const maxShap =
    shapTokens && shapTokens.length > 0
      ? Math.max(...shapTokens.map(t => Math.abs(t.shap_value)), 0.0001)
      : 1

  // Formatea "mrbert-es_E1" → "mrbert-es · E1"
  function formatModel(id) {
    if (!id) return ''
    const parts = id.split('_')
    return parts.length === 2 ? `${parts[0]} · ${parts[1]}` : id
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">

      {/* ── Encabezado ── */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Analizador de Noticias en Español
      </h1>
      <p className="text-gray-600 mb-8 text-sm leading-relaxed">
        Ingrese el texto de la noticia o la URL del artículo para evaluar su veracidad
        mediante nuestro modelo Transformer especializado.
      </p>

      {/* ── Selector de modo ── */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-5 w-fit">
        {[
          { id: 'texto', label: 'Texto Directo' },
          { id: 'url',   label: 'Enlace (URL)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleModeChange(tab.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              inputMode === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Input según modo ── */}
      <div className="mb-5">
        {inputMode === 'texto' ? (
          <>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm
                         text-gray-800 resize-y focus:outline-none focus:ring-2
                         focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              rows={6}
              maxLength={5000}
              placeholder="Ingrese aquí el texto de la noticia..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
            />
            <div className="mt-1 text-right">
              <span
                className={`text-xs ${
                  inputText.length > 0 && inputText.trim().length < 50
                    ? 'text-orange-500'
                    : 'text-gray-400'
                }`}
              >
                {inputText.length > 0 && inputText.trim().length < 50
                  ? `Mínimo 50 caracteres (${inputText.trim().length}/50)`
                  : `${inputText.length} / 5000`}
              </span>
            </div>
          </>
        ) : (
          <input
            type="url"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm
                       text-gray-800 focus:outline-none focus:ring-2
                       focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            placeholder="https://ejemplo.com/noticia"
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
          />
        )}
      </div>

      {/* ── Botón Analizar ── */}
      <button
        onClick={handleAnalizar}
        disabled={!canSubmit}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          canSubmit
            ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Analizando...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            {inputMode === 'texto' ? 'Analizar Texto' : 'Analizar URL'}
          </>
        )}
      </button>

      {/* ── Alerta: contenido no en español ── */}
      {warningNoEspanol && (
        <div className="mt-5 flex items-start gap-3 bg-orange-50 border border-orange-200
                        rounded-lg p-4 text-sm text-orange-700">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2
                 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          El texto no está en español. El sistema acepta únicamente contenido en español.
        </div>
      )}

      {/* ── Alerta: error general ── */}
      {error && (
        <div className="mt-5 flex items-start gap-3 bg-red-50 border border-red-200
                        rounded-lg p-4 text-sm text-red-700">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Resultado de predicción ── */}
      {resultado && (
        <div className="mt-8 space-y-4">
          <div
            className={`rounded-xl border p-6 shadow-sm ${
              resultado.label === 'REAL'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            {/* Etiqueta grande + modelo */}
            <div className="flex items-center gap-3 mb-5">
              <span
                className={`text-4xl font-bold tracking-tight ${
                  resultado.label === 'REAL' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {resultado.label}
              </span>
              <span className="text-xs text-gray-500 font-mono bg-white border
                               border-gray-200 px-2 py-1 rounded-full">
                Modelo: {formatModel(resultado.model_id)}
              </span>
            </div>

            {/* Barra de confianza */}
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600 font-medium">Confianza</span>
                <span
                  className={`font-semibold font-mono ${
                    resultado.label === 'REAL' ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {(resultado.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    resultado.label === 'REAL' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(resultado.confidence * 100).toFixed(1)}%` }}
                />
              </div>
            </div>

            {/* Probabilidades desglosadas */}
            <p className="text-sm text-gray-600">
              Real:{' '}
              <span className="font-mono font-semibold text-green-700">
                {(resultado.probabilities.real * 100).toFixed(1)}%
              </span>
              {' · '}
              Falsa:{' '}
              <span className="font-mono font-semibold text-red-700">
                {(resultado.probabilities.fake * 100).toFixed(1)}%
              </span>
            </p>
          </div>

          {/* ── Sección colapsable SHAP ── */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={handleVerExplicacion}
              className="w-full flex items-center justify-between px-5 py-3 bg-gray-50
                         hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
            >
              <span>Explicación de la predicción (SHAP)</span>
              <div className="flex items-center gap-2">
                {!shapExpanded && (
                  <span className="text-xs text-blue-600 font-medium">Ver explicación</span>
                )}
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    shapExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {shapExpanded && (
              <div className="p-5 bg-white">
                {shapLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Calculando explicación SHAP...
                  </div>
                ) : shapTokens && shapTokens.length > 0 ? (
                  <>
                    <p className="text-xs text-gray-500 mb-4">
                      Tokens más influyentes en la predicción (máx. 20).{' '}
                      <span className="text-red-600 font-medium">Rojo</span>: impulsa hacia FALSA ·{' '}
                      <span className="text-green-600 font-medium">Verde</span>: impulsa hacia REAL
                    </p>
                    <div className="space-y-2">
                      {shapTokens.slice(0, 20).map((token, i) => {
                        const esFake = token.shap_value > 0
                        const barWidth = `${(
                          (Math.abs(token.shap_value) / maxShap) * 100
                        ).toFixed(1)}%`
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className="font-mono text-xs text-gray-600 w-28
                                             truncate text-right flex-shrink-0">
                              {token.token}
                            </span>
                            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  esFake ? 'bg-red-400' : 'bg-green-400'
                                }`}
                                style={{ width: barWidth }}
                              />
                            </div>
                            <span
                              className={`font-mono text-xs w-16 text-right flex-shrink-0 ${
                                esFake ? 'text-red-600' : 'text-green-600'
                              }`}
                            >
                              {token.shap_value > 0 ? '+' : ''}
                              {token.shap_value.toFixed(4)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 py-2">
                    No se pudo obtener la explicación SHAP.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
