import React, { Component } from 'react';
import { Alert, Button, Container } from 'react-bootstrap';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
    // Reload the page to reset the application state
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Container className="error-boundary-container">
          <Alert variant="danger" className="error-boundary-alert">
            <Alert.Heading>Oups! Une erreur est survenue</Alert.Heading>
            <p>
              Nous sommes désolés, mais quelque chose s'est mal passé. Veuillez réessayer ou contacter l'assistance si le problème persiste.
            </p>
            {this.state.error && (
              <details className="error-details">
                <summary>Détails techniques</summary>
                <p>{this.state.error.toString()}</p>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
            <div className="d-flex justify-content-end">
              <Button variant="outline-danger" onClick={this.handleReset}>
                Retour à l'accueil
              </Button>
            </div>
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 