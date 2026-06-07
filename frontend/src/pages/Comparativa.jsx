/**
 * Página de comparativa de rendimiento entre modelos E0 y E1.
 * Métricas hardcodeadas con los resultados reales del proyecto.
 */

const METRICAS = [
  {
    id: 'mrbert-es_E1',
    nombre: 'MrBERT-es · E1',
    accuracy: 0.8866,
    f1_macro: 0.8864,
    f1_fake: 0.8817,
    recall_fake: 0.8542,
    mejor: true,
  },
  {
    id: 'mrbert-es_E0',
    nombre: 'MrBERT-es · E0',
    accuracy: 0.8660,
    f1_macro: 0.8655,
    f1_fake: 0.8571,
    recall_fake: 0.8125,
    mejor: false,
  },
  {
    id: 'mroberta_E0',
    nombre: 'mRoBERTa · E0',
    accuracy: 0.8454,
    f1_macro: 0.8443,
    f1_fake: 0.8315,
    recall_fake: 0.7708,
    mejor: false,
  },
  {
    id: 'mroberta_E1',
    nombre: 'mRoBERTa · E1',
    accuracy: 0.8351,
    f1_macro: 0.8336,
    f1_fake: 0.8182,
    recall_fake: 0.7500,
    mejor: false,
  },
]

// Convierte un decimal a porcentaje con 2 decimales: 0.8866 → "88.66%"
function pct(val) {
  return (val * 100).toFixed(2) + '%'
}

export default function Comparativa() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Comparativa de modelos E0 vs. E1
      </h1>
      <p className="text-gray-600 mb-8 text-sm">
        Análisis de rendimiento comparando escenarios baseline (E0) y aumentado (E1)
      </p>

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
                {/* Nombre del modelo */}
                <td className="px-5 py-3">
                  <span
                    className={`font-medium ${
                      m.mejor ? 'text-blue-700' : 'text-gray-800'
                    }`}
                  >
                    {m.nombre}
                  </span>
                  {m.mejor && (
                    <span className="ml-2 text-xs bg-blue-600 text-white
                                     px-1.5 py-0.5 rounded-full">
                      Mejor
                    </span>
                  )}
                </td>

                {/* Métricas */}
                {[m.accuracy, m.f1_macro, m.f1_fake, m.recall_fake].map((val, i) => (
                  <td
                    key={i}
                    className={`text-center px-4 py-3 font-mono ${
                      m.mejor
                        ? 'text-blue-700 font-semibold'
                        : 'text-gray-700'
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

      {/* Nota al pie */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        E0: Corpus original FakeDeS sin augmentación &nbsp;|&nbsp;
        E1: Augmentación sintética +48.6% clase fake
      </p>
    </main>
  )
}
