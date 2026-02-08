import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    // Send to error tracking service if available (e.g. Sentry injected on window)
    try {
      const anyWin = window as any;
      if (anyWin.Sentry && typeof anyWin.Sentry.captureException === 'function') {
        anyWin.Sentry.captureException(error, { extra: errorInfo });
      }
    } catch (e) {
      // swallow reporting errors
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                We apologize for the inconvenience. The error has been logged.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-left bg-destructive/5 p-4 rounded-lg border border-destructive/20 max-w-full overflow-hidden">
                <p className="font-mono text-sm text-destructive mb-2 break-words">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs overflow-auto max-h-32 text-muted-foreground">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReset} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
