import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Centered loading spinner with an optional label. Accessible via
 * `role="status"` so screen readers announce the loading state.
 */
const LoadingSpinner = ({
  label = 'Loading...',
  size = 32,
  className = '',
  fullHeight = false,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-2 ${
        fullHeight ? 'py-20' : 'py-12'
      } ${className}`}
    >
      <Loader2
        className="animate-spin text-purple-600"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
