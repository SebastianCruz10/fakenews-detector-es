/**
 * Selector de modelo en formato cards.
 * Props:
 *   activeModel   - string: ID del modelo actualmente seleccionado
 *   onModelChange - function: callback que recibe el nuevo model_id
 */

const MODELOS = [
  {
    id: 'mrbert-es_E1',
    nombre: 'MrBERT-es · E1',
    descripcion: 'Optimizado (+50% fake sintético)',
    f1_label: '0.88',
  },
  {
    id: 'mrbert-es_E0',
    nombre: 'MrBERT-es · E0',
    descripcion: 'Baseline original',
    f1_label: '0.86',
  },
  {
    id: 'mroberta_E0',
    nombre: 'mRoBERTa · E0',
    descripcion: 'Comparativo multilingüe baseline',
    f1_label: '0.83',
  },
  {
    id: 'mroberta_E1',
    nombre: 'mRoBERTa · E1',
    descripcion: 'Comparativo multilingüe aumentado',
    f1_label: '0.82',
  },
]

export default function ModelSelector({ activeModel, onModelChange }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {MODELOS.map(modelo => {
        const esActivo = activeModel === modelo.id
        return (
          <button
            key={modelo.id}
            onClick={() => onModelChange(modelo.id)}
            className={`rounded-lg border p-3 text-left transition-all cursor-pointer ${
              esActivo
                ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <p className={`font-semibold text-sm ${esActivo ? 'text-blue-700' : 'text-gray-800'}`}>
              {modelo.nombre}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">
              {modelo.descripcion}
            </p>
            <p className={`text-xs font-mono mt-1.5 ${esActivo ? 'text-blue-600' : 'text-gray-400'}`}>
              F1: {modelo.f1_label}
            </p>
          </button>
        )
      })}
    </div>
  )
}
