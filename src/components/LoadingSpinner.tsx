"use client";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export default function LoadingSpinner({
  size = 80,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <output
      className={`loading-spinner-container ${className}`}
      style={{ width: size, height: size }}
      aria-live="polite"
    >
      <div className="loading-spinner">
        <span className="sr-only">loading...</span>
      </div>
    </output>
  );
}
