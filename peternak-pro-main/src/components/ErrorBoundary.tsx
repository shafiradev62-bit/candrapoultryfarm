import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card rounded-lg border p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
              <p className="text-muted-foreground mb-4">
                We're sorry, but an error occurred while loading the application.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="text-left bg-muted p-3 rounded text-sm font-mono text-red-500">
                  <p className="font-bold mb-2">Error Details:</p>
                  <p>{this.state.error.message}</p>
                  <pre className="mt-2 text-xs overflow-auto max-h-32">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;