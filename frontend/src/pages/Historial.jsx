/**
 * Página de historial de predicciones de la sesión actual.
 * Props:
 *   history          - array: lista de predicciones realizadas en la sesión
 *   onClearHistory   - function: callback para limpiar el historial
 *   onSelectEntry    - function: callback que recibe una entrada al hacer clic en su fila
 */
export default function Historial({ history, onClearHistory, onSelectEntry }) {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">

      {/* Encabezado con botón de limpiar */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">Historial de sesión</h1>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-sm bg-red-50 text-red-600 border border-red-200
                       px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors"
          >
            Limpiar historial
          </button>
        )}
      </div>
      <p className="text-gray-600 mb-8 text-sm">
        Predicciones realizadas durante esta sesión. El historial persiste si recargás la página,
        pero se borra al cerrar la pestaña. Haz clic en una fila para volver a verla en el Analizador.
      </p>

      {/* Estado vacío */}
      {history.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg
            className="w-10 h-10 mx-auto mb-3 opacity-40"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2
                 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-sm">No hay predicciones en esta sesión.</p>
        </div>
      ) : (
        /* Tabla de historial */
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">
                  Hora
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Texto</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Etiqueta</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">
                  Confianza
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Modelo</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Ver</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entrada, idx) => (
                <tr
                  key={entrada.id}
                  onClick={() => onSelectEntry(entrada)}
                  className={`border-b border-gray-100 cursor-pointer transition-colors
                    hover:bg-blue-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  {/* Hora */}
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                    {entrada.timestamp}
                  </td>

                  {/* Extracto de texto */}
                  <td className="px-4 py-3 text-gray-700 max-w-xs">
                    <span title={entrada.text}>
                      {entrada.text.length > 60
                        ? entrada.text.slice(0, 60) + '…'
                        : entrada.text}
                    </span>
                  </td>

                  {/* Etiqueta REAL / FALSA */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        entrada.label === 'REAL'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {entrada.label}
                    </span>
                  </td>

                  {/* Confianza */}
                  <td className="px-4 py-3 text-center font-mono text-gray-700">
                    {(entrada.confidence * 100).toFixed(1)}%
                  </td>

                  {/* ID del modelo */}
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {entrada.model_id}
                  </td>

                  {/* Columna Ver: ícono de ojo */}
                  <td className="px-4 py-3 text-center">
                    <svg
                      className="w-4 h-4 mx-auto text-blue-400 hover:text-blue-600 transition-colors"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943
                           9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
