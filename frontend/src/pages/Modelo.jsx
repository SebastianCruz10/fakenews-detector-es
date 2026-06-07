import ModelSelector from '../components/ModelSelector'

/**
 * Página de información del modelo activo con selector y métricas detalladas.
 * Props:
 *   activeModel   - string: ID del modelo activo
 *   onModelChange - function: callback para cambiar el modelo activo
 */

// Datos completos de cada modelo (métricas reales del proyecto)
const INFO_MODELOS = {
  'mrbert-es_E1': {
    nombre: 'MrBERT-es · E1',
    descripcion: 'Modelo principal optimizado con augmentación sintética (+50% clase fake)',
    accuracy: 0.8866,
    f1_macro: 0.8864,
    f1_fake: 0.8817,
    recall_fake: 0.8542,
  },
  'mrbert-es_E0': {
    nombre: 'MrBERT-es · E0',
    descripcion: 'Modelo principal baseline entrenado sin augmentación',
    accuracy: 0.8660,
    f1_macro: 0.8655,
    f1_fake: 0.8571,
    recall_fake: 0.8125,
  },
  mroberta_E0: {
    nombre: 'mRoBERTa · E0',
    descripcion: 'Modelo comparativo multilingüe baseline',
    accuracy: 0.8454,
    f1_macro: 0.8443,
    f1_fake: 0.8315,
    recall_fake: 0.7708,
  },
  mroberta_E1: {
    nombre: 'mRoBERTa · E1',
    descripcion: 'Modelo comparativo multilingüe con augmentación sintética',
    accuracy: 0.8351,
    f1_macro: 0.8336,
    f1_fake: 0.8182,
    recall_fake: 0.7500,
  },
}

// Convierte decimal a porcentaje: 0.8866 → "88.66%"
function pct(val) {
  return (val * 100).toFixed(2) + '%'
}

export default function Modelo({ activeModel, onModelChange }) {
  const info = INFO_MODELOS[activeModel]

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Modelo activo</h1>
      <p className="text-gray-600 mb-8 text-sm">
        Selecciona el modelo a utilizar para las predicciones.
      </p>

      {/* Selector de modelo */}
      <section className="mb-8">
        <ModelSelector activeModel={activeModel} onModelChange={onModelChange} />
      </section>

      {/* Card del modelo activo con métricas */}
      {info && (
        <section className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg font-semibold text-gray-900">{info.nombre}</h2>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5
                             rounded-full font-medium">
              En uso
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-5">{info.descripcion}</p>

          {/* Tabla de métricas del modelo activo */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-center px-4 py-2.5 font-semibold text-gray-700">
                    Accuracy
                  </th>
                  <th className="text-center px-4 py-2.5 font-semibold text-gray-700">
                    F1-Macro
                  </th>
                  <th className="text-center px-4 py-2.5 font-semibold text-gray-700">
                    F1-Fake
                  </th>
                  <th className="text-center px-4 py-2.5 font-semibold text-gray-700">
                    Recall-Fake
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-blue-50">
                  <td className="text-center px-4 py-3 font-mono font-semibold text-blue-700">
                    {pct(info.accuracy)}
                  </td>
                  <td className="text-center px-4 py-3 font-mono font-semibold text-blue-700">
                    {pct(info.f1_macro)}
                  </td>
                  <td className="text-center px-4 py-3 font-mono font-semibold text-blue-700">
                    {pct(info.f1_fake)}
                  </td>
                  <td className="text-center px-4 py-3 font-mono font-semibold text-blue-700">
                    {pct(info.recall_fake)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Nota metodológica */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">Nota metodológica</p>
        <p className="leading-relaxed">
          Los modelos fueron entrenados sobre el corpus FakeDeS (IberLEF 2021) con fine-tuning
          supervisado. MrBERT-es es el modelo principal y mRoBERTa actúa como modelo comparativo
          multilingüe.
        </p>
      </div>
    </main>
  )
}
