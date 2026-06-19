import { useState } from 'react'
import { MODELOS_LIST } from '../data/modelos'
import { predict as apiPredict, extract as apiExtract } from '../api/client'

const METRICAS = MODELOS_LIST

// Orden fijo del grid: MrBERT E0, MrBERT E1, mRoBERTa E0, mRoBERTa E1
const GRID_MODELOS = ['mrbert-es_E0', 'mrbert-es_E1', 'mroberta_E0', 'mroberta_E1']

// Convierte un decimal a porcentaje con 2 decimales: 0.8866 → "88.66%"
function pct(val) {
  return (val * 100).toFixed(2) + '%'
}

export default function Comparativa() {
  const [modo, setModo]           = useState('texto')
  const [texto, setTexto]         = useState('')
  const [inputUrl, setInputUrl]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [resultados, setResultados] = useState(null)
  const [error, setError]         = useState(null)
  const [warningNoEspanol, setWarningNoEspanol] = useState(false)

  const wordCount  = texto.trim() ? texto.trim().split(/\s+/).length : 0
  const esUrlValida = inputUrl.trim().startsWith('http://') || inputUrl.trim().startsWith('https://')
  const canCompare = !loading && (modo === 'texto' ? texto.trim().length >= 50 : esUrlValida)

  function handleModoChange(nuevoModo) {
    setModo(nuevoModo)
    setError(null)
    setWarningNoEspanol(false)
    setResultados(null)
  }

  async function handleComparar() {
    setLoading(true)
    setError(null)
    setWarningNoEspanol(false)
    setResultados(null)
    try {
      let textoFinal = texto

      if (modo === 'url') {
        let extracted
        try {
          extracted = await apiExtract(inputUrl.trim())
        } catch (e) {
          setError('No se pudo extraer el contenido de la URL. Verifica que sea accesible y apunte a un artículo en español.')
          return
        }
        if (!extracted.is_spanish) {
          setWarningNoEspanol(true)
          return
        }
        textoFinal = extracted.text
      }

      const predicciones = await Promise.all(
        GRID_MODELOS.map(modelId => apiPredict(textoFinal, modelId))
      )
      const map = {}
      GRID_MODELOS.forEach((id, i) => { map[id] = predicciones[i] })
      setResultados(map)
    } catch (err) {
      setError(err.message || 'Error al comparar los modelos. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Comparativa de modelos E0 vs. E1
      </h1>
      <p className="text-gray-600 mb-8 text-sm">
        Análisis de rendimiento comparando escenarios baseline (E0) y aumentado (E1)
      </p>

      {/* ── Tabla de métricas (sin cambios) ── */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 font-semibold text-gray-700">
                Modelo / Experimento
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Accuracy</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">F1-Macro</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">F1-Fake</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Recall-Fake</th>
            </tr>
          </thead>
          <tbody>
            {METRICAS.map((m, idx) => (
              <tr
                key={m.id}
                className={`border-b border-gray-100 ${
                  m.mejor
                    ? 'bg-blue-50'
                    : idx % 2 === 0
                    ? 'bg-white'
                    : 'bg-gray-50'
                }`}
              >
                <td className="px-5 py-3">
                  <span className={`font-medium ${m.mejor ? 'text-blue-700' : 'text-gray-800'}`}>
                    {m.nombre}
                  </span>
                  {m.mejor && (
                    <span className="ml-2 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                      Mejor
                    </span>
                  )}
                </td>
                {[m.accuracy, m.f1_macro, m.f1_fake, m.recall_fake].map((val, i) => (
                  <td
                    key={i}
                    className={`text-center px-4 py-3 font-mono ${
                      m.mejor ? 'text-blue-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {pct(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-500 text-center">
        E0: Corpus original FakeDeS sin augmentación &nbsp;|&nbsp;
        E1: Augmentación sintética +48.6% clase fake
      </p>

      {/* ── Panel de predicción comparativa ── */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Predicción en tiempo real — todos los modelos
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Ingresa un texto y compara la predicción de los 4 modelos simultáneamente.
        </p>

        {/* Selector de modo */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4 w-fit">
          {[
            { id: 'texto', label: 'Texto Directo' },
            { id: 'url',   label: 'Enlace (URL)'  },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleModoChange(tab.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                modo === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Input según modo */}
        {modo === 'texto' ? (
          <>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm
                         text-gray-800 resize-y focus:outline-none focus:ring-2
                         focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              rows={5}
              placeholder="Pega aquí el texto de la noticia a analizar..."
              value={texto}
              onChange={e => setTexto(e.target.value)}
            />
            <div className="flex justify-between items-center mt-1 mb-4">
              <span className={`text-xs ${wordCount > 0 && wordCount < 80 ? 'text-orange-500' : 'text-gray-400'}`}>
                {wordCount > 0 && wordCount < 80
                  ? `Para mejores resultados, ingresa al menos 80 palabras (${wordCount} actuales).`
                  : wordCount > 0 ? `${wordCount} palabras` : ''}
              </span>
              <span className={`text-xs ${texto.length > 0 && texto.trim().length < 50 ? 'text-orange-500' : 'text-gray-400'}`}>
                {texto.length > 0 && texto.trim().length < 50
                  ? `Mínimo 50 caracteres (${texto.trim().length}/50)`
                  : `${texto.length} caracteres`}
              </span>
            </div>
          </>
        ) : (
          <div className="mb-4">
            <input
              type="url"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm
                         text-gray-800 focus:outline-none focus:ring-2
                         focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              placeholder="https://ejemplo.com/noticia"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
            />
          </div>
        )}

        <button
          onClick={handleComparar}
          disabled={!canCompare}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            canCompare
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Comparando modelos...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Comparar los 4 modelos
            </>
          )}
        </button>

        {/* Alerta: contenido no en español */}
        {warningNoEspanol && (
          <div className="mt-4 flex items-start gap-3 bg-orange-50 border border-orange-200
                          rounded-lg p-4 text-sm text-orange-700">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            El texto no está en español. El sistema acepta únicamente contenido en español.
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200
                          rounded-lg p-4 text-sm text-red-700">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Grid de resultados 2x2 */}
        {resultados && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GRID_MODELOS.map(modelId => {
              const r = resultados[modelId]
              const info = METRICAS.find(m => m.id === modelId)
              const esFalsa = r.label === 'FALSA'
              return (
                <div
                  key={modelId}
                  className={`rounded-xl border p-5 shadow-sm ${
                    esFalsa ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                  }`}
                >
                  {/* Nombre del modelo */}
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    {info?.nombre ?? modelId}
                  </p>

                  {/* Etiqueta */}
                  <p className={`text-3xl font-bold mb-3 ${esFalsa ? 'text-red-600' : 'text-green-600'}`}>
                    {r.label}
                  </p>

                  {/* Barra de confianza */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Confianza</span>
                      <span className={`font-semibold font-mono ${esFalsa ? 'text-red-700' : 'text-green-700'}`}>
                        {(r.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${esFalsa ? 'bg-red-400' : 'bg-green-400'}`}
                        style={{ width: `${(r.confidence * 100).toFixed(1)}%` }}
                      />
                    </div>
                  </div>

                  {/* Probabilidades */}
                  <p className="text-xs text-gray-500">
                    Real:{' '}
                    <span className="font-mono font-semibold text-green-700">
                      {(r.probabilities.real * 100).toFixed(1)}%
                    </span>
                    {' · '}
                    Falsa:{' '}
                    <span className="font-mono font-semibold text-red-700">
                      {(r.probabilities.fake * 100).toFixed(1)}%
                    </span>
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
