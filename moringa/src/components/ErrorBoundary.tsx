'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-card rounded-3xl border border-border shadow-xl p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-red-500/10 rounded-full">
                  <AlertCircle className="h-12 w-12 text-red-600" strokeWidth={2} />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                Something went wrong
              </h1>
              
              <p className="text-muted-foreground mb-6">
                We encountered an unexpected error. Please try refreshing the page or return to the home page.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-muted/50 rounded-xl text-left">
                  <p className="text-xs font-mono text-red-600 break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 hover:scale-105 transition-all font-medium shadow-lg"
                >
                  <RefreshCcw size={18} />
                  Refresh Page
                </button>
                
                <Link
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-border rounded-2xl text-foreground hover:bg-muted/50 transition-all font-medium hover:scale-105"
                >
                  <Home size={18} />
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
