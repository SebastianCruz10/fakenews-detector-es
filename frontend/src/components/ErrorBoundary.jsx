import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-64 p-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Algo salió mal
            </h2>
            <p className="text-sm text-red-700 mb-4">
              Ocurrió un error inesperado en esta sección. Puedes intentar recuperarte
              sin recargar la página.
            </p>
            {this.state.error && (
              <pre className="text-xs text-left text-red-600 bg-red-100 rounded p-2 mb-4 overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
