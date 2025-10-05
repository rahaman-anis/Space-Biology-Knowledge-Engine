"use client"
import React from "react"

type Props = { children: React.ReactNode; fallback?: React.ReactNode }
type State = { hasError: boolean }

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: unknown) {
    console.error("UI ErrorBoundary", error)
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-lg border-2 border-danger-600 bg-white p-4 text-body text-danger-600">
            Something went wrong. Please try again.
          </div>
        )
      )
    }
    return this.props.children
  }
}
