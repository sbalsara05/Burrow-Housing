// Simple error boundary with inline styles to ensure it always displays
import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

class AppErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('AppErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f0f2f5',
                    padding: '20px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        maxWidth: '600px'
                    }}>
                        <h1 style={{ color: '#dc2626', marginBottom: '16px', fontSize: '24px' }}>
                            Application Error
                        </h1>
                        <p style={{ color: '#4b5563', marginBottom: '24px' }}>
                            Something went wrong while loading the application.
                        </p>
                        {this.state.error && (
                            <div style={{
                                marginTop: '20px',
                                padding: '16px',
                                backgroundColor: '#f9fafb',
                                borderRadius: '4px',
                                textAlign: 'left'
                            }}>
                                <div style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: '#dc2626' }}>Error:</strong>
                                    <div style={{ color: '#6b7280', marginTop: '4px', fontFamily: 'monospace', fontSize: '14px' }}>
                                        {this.state.error.message}
                                    </div>
                                </div>
                                {this.state.error.stack && (
                                    <details style={{ marginTop: '12px' }}>
                                        <summary style={{ cursor: 'pointer', color: '#6b7280', fontSize: '14px' }}>
                                            Show Stack Trace
                                        </summary>
                                        <pre style={{
                                            marginTop: '8px',
                                            padding: '12px',
                                            backgroundColor: '#1f2937',
                                            color: '#f3f4f6',
                                            borderRadius: '4px',
                                            overflow: 'auto',
                                            fontSize: '12px',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {this.state.error.stack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                marginTop: '24px',
                                padding: '12px 24px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '500'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default AppErrorBoundary;


