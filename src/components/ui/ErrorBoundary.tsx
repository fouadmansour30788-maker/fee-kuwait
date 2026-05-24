'use client'

import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen flex items-center justify-center bg-cream p-8">
          <div className="max-w-lg text-center">
            <div className="text-5xl mb-4">🌿</div>
            <h2 className="text-2xl font-bold text-forest mb-2">Something went wrong</h2>
            <p className="text-gray mb-6 text-sm font-mono bg-greengray p-3 rounded-lg text-left overflow-auto">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="btn-primary"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
