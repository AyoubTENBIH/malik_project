import React from "react";

export default class Bed3DErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="bed3d-canvas-fallback bed3d-canvas-fallback--error">
          <p>Impossible d’afficher la scène 3D.</p>
          <small>{this.state.error.message}</small>
        </div>
      );
    }
    return this.props.children;
  }
}
