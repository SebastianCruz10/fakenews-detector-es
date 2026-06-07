/**
 * Barra de navegación principal fija en la parte superior.
 * Props:
 *   activeTab    - string: tab actualmente activo
 *   onTabChange  - function: callback para cambiar de tab
 *   activeModel  - string: ID del modelo activo (ej: "mrbert-es_E1")
 */

// Formatea el ID del modelo para mostrarlo como badge legible
// ej: "mrbert-es_E1" → "mrbert-es · E1"
function formatModelBadge(modelId) {
  if (!modelId) return ''
  const parts = modelId.split('_')
  return parts.length === 2 ? `${parts[0]} · ${parts[1]}` : modelId
}

const TABS = [
  { id: 'analizar',    label: 'Analizar' },
  { id: 'comparativa', label: 'Comparativa' },
  { id: 'historial',   label: 'Historial' },
  { id: 'modelo',      label: 'Modelo' },
]

export default function Navbar({ activeTab, onTabChange, activeModel }) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Logo: ícono de escudo + nombre */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955
                   11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824
                   10.29 9 11.622 5.176-1.332 9-6.03 9-11.622
                   0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="font-semibold text-blue-600 text-lg">FakeDetector ES</span>
          </div>

          {/* Tabs de navegación */}
          <div className="flex items-center gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-1 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Badge del modelo activo + botón de información */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-mono">
              {formatModelBadge(activeModel)}
            </span>
            <button
              className="text-gray-400 hover:text-blue-600 transition-colors"
              title="Información del modelo activo"
              onClick={() => onTabChange('modelo')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </nav>
  )
}
