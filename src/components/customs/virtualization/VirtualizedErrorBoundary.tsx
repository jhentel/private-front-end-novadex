import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class VirtualizedErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: false }; // Don't show error UI, just reset
  }

  componentDidCatch(error: Error) {
    // Log error but continue rendering
    console.warn('VirtualizedErrorBoundary caught an error:', error);
    // Reset error state in next tick
    setTimeout(() => {
      this.setState({ hasError: false });
    }, 0);
  }

  render() {
    // Always render children - we're using this boundary just for error catching
    return this.props.children;
  }
}