import { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="error-boundary" style={{
                    padding: '2rem',
                    margin: '1rem',
                    border: '2px solid #ff6b6b',
                    borderRadius: '8px',
                    backgroundColor: '#ffe0e0',
                    textAlign: 'center'
                }}>
                    <h2 style={{ color: '#d63031', marginBottom: '1rem' }}>
                        Something went wrong
                    </h2>
                    <p style={{ marginBottom: '1rem' }}>
                        The application encountered an unexpected error. Please try refreshing the page.
                    </p>
                    <button 
                        onClick={this.handleRetry}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#d63031',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Try Again
                    </button>
                    {import.meta.env.DEV && this.state.error && (
                        <details style={{ 
                            marginTop: '1rem', 
                            textAlign: 'left',
                            backgroundColor: '#f8f9fa',
                            padding: '1rem',
                            borderRadius: '4px',
                            border: '1px solid #dee2e6'
                        }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                                Error Details (Development Only)
                            </summary>
                            <pre style={{ 
                                fontSize: '0.875rem', 
                                overflow: 'auto',
                                maxHeight: '200px',
                                marginTop: '0.5rem'
                            }}>
                                {this.state.error.toString()}
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
