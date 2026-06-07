/**
 * Footer de la aplicación con información del proyecto y aviso legal.
 */
export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto py-6 px-4">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-2 text-sm text-gray-500">
        <p>© 2026 FakeDetector ES v1.0.0 · Proyecto de investigación académica</p>

        <div className="flex gap-4">
          <a
            href="#"
            className="hover:text-blue-600 underline transition-colors"
          >
            Documentación
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 underline transition-colors"
          >
            GitHub Repository
          </a>
        </div>

        <p className="text-xs text-gray-400 text-center max-w-lg">
          Los resultados son indicativos y no constituyen verificación factual definitiva.
        </p>
      </div>
    </footer>
  )
}
