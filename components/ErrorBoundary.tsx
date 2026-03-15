'use client'
import { Component, ReactNode } from 'react'

interface Props { children: ReactNode; name: string }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#fee2e2', border: '2px solid #dc2626', padding: '1rem', margin: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.75rem' }}>
          <strong style={{ color: '#991b1b' }}>ERRO em: {this.props.name}</strong>
          <pre style={{ marginTop: '0.5rem', color: '#7f1d1d', whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
