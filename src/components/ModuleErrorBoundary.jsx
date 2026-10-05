import React from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'
import './RouteLoadingFallback.css'

export default class ModuleErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Module load error caught by boundary:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="route-error-container" role="alert">
          <div className="route-error-card">
            <div className="route-error-icon-box">
              <AlertTriangle size={24} className="route-error-icon" />
            </div>
            <h3 className="route-error-title">Module Loading Error</h3>
            <p className="route-error-text">
              We encountered a network issue or outdated chunk while loading this section of the application.
            </p>
            <button
              type="button"
              className="route-error-retry-btn"
              onClick={this.handleRetry}
            >
              <RotateCw size={14} />
              <span>Retry / Reload Module</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
