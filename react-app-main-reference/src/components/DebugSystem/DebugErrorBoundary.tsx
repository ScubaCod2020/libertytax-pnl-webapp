// DebugErrorBoundary.tsx - Error boundary to prevent debug system from crashing main app
import React from 'react'

interface DebugErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface DebugErrorBoundaryProps {
  children: React.ReactNode
  onClose: () => void
}

export default class DebugErrorBoundary extends React.Component<DebugErrorBoundaryProps, DebugErrorBoundaryState> {
  constructor(props: DebugErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): DebugErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Debug System Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 350,
          height: '100vh',
          background: '#dc2626',
          color: 'white',
          padding: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '14px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🚨</div>
          <div style={{ fontWeight: 'bold', marginBottom: '12px', textAlign: 'center' }}>
            Debug System Error
          </div>
          <div style={{ fontSize: '12px', marginBottom: '20px', textAlign: 'center', opacity: 0.9 }}>
            The debug panel encountered an error and has been safely contained.
          </div>
          <button 
            onClick={() => {
              this.setState({ hasError: false })
              this.props.onClose()
            }}
            style={{ 
              background: 'white', 
              color: '#dc2626', 
              padding: '8px 16px', 
              border: 'none', 
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Close Debug Panel
          </button>
          <div style={{ fontSize: '10px', marginTop: '12px', opacity: 0.7, textAlign: 'center' }}>
            The main app is unaffected and continues to work normally.
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
