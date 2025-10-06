"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle, Copy, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: string | null
}

export class AriaErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: error.stack || null }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[AriaErrorBoundary]", error, errorInfo)
  }

  async copyDiagnostics() {
    try {
      const diag = await fetch("/api/aria/diag").then((r) => r.json())
      const text = JSON.stringify(
        {
          error: this.state.error?.message,
          stack: this.state.errorInfo,
          diagnostics: diag,
        },
        null,
        2,
      )
      await navigator.clipboard.writeText(text)
      alert("Diagnostics copied to clipboard")
    } catch (e) {
      console.error("Failed to copy diagnostics", e)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-card rounded-2xl shadow-xl border border-border p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground mb-2">We couldn't render ARIA</h1>
                <p className="text-muted-foreground">
                  Something went wrong while loading the page. Try refreshing, clearing filters, or checking your
                  network connection.
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <p className="text-sm font-mono text-foreground">{this.state.error.message}</p>
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </button>
              <button
                onClick={() => this.copyDiagnostics()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
              >
                <Copy className="w-4 h-4" />
                Copy Diagnostics
              </button>
              <button
                onClick={() => (window.location.href = "/aria")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
