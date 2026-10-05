import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-gray-600">An unexpected error occurred. Please try again.</p>
        <button
          onClick={() => window.location.assign('/')}
          className="rounded-md bg-blue-600 px-5 py-2.5 font-semibold text-white"
        >
          Go to home
        </button>
      </div>
    );
  }
}