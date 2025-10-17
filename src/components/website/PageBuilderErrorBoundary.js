import React from 'react';

class PageBuilderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('PageBuilder Error Boundary caught an error:', error, errorInfo);

    // Check if this is the componentsList.reduce error
    if (error.message && error.message.includes('componentsList.reduce')) {
      console.warn('Detected componentsList.reduce error in PageBuilder');

      // Attempt to recover by providing a default components list
      if (window.destack && window.destack.theme) {
        window.destack.theme.components = [
          'Text', 'Image', 'Button', 'Container', 'Row', 'Column'
        ];
      }
    }

    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    // Reset error state and attempt to re-render
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          backgroundColor: '#f5f5f5',
          textAlign: 'center',
          margin: '20px'
        }}>
          <h2>Page Builder Error</h2>
          <p>The page builder encountered an unexpected error.</p>

          {this.state.error && this.state.error.message.includes('componentsList.reduce') && (
            <div style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              padding: '10px',
              margin: '10px 0'
            }}>
              <p><strong>Known Issue:</strong> There's a temporary issue with the page builder components. This usually resolves itself after refreshing.</p>
            </div>
          )}

          <div style={{ marginTop: '15px' }}>
            <button
              onClick={this.handleRetry}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary>Error Details (Development Only)</summary>
              <pre style={{
                fontSize: '12px',
                overflow: 'auto',
                backgroundColor: '#f8f9fa',
                padding: '10px',
                borderRadius: '4px'
              }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageBuilderErrorBoundary;