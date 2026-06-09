import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
          <p className="text-gray-700 text-lg font-medium">Something went wrong.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-indigo-600 underline text-sm"
          >
            Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
