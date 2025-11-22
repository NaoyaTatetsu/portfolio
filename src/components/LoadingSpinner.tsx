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
    <div
      className={`loading-spinner-container ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-live="polite"
    >
      <div className="loading-spinner">
        <span className="sr-only">読み込み中...</span>
      </div>
    </div>
  );
}

