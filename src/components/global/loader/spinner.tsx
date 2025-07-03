import React from "react";

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
  logo?: React.ReactNode;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 50,
  color = "white",
  className = "",
  logo,
}) => {
  return (
    <div
      className={`${className} relative inline-flex items-center justify-center`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin"
        style={{ animationDuration: "2s" }}
      >
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.1" />
            <stop offset="50%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Outer ring */}
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="url(#ringGradient)"
          strokeWidth="3"
          fill="none"
        />

        {/* Moving arc */}
        <path
          d="M60 10 A50 50 0 0 1 110 60"
          stroke="url(#arcGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Non-rotating logo container */}
      {logo && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            width: size,
            height: size,
          }}
        >
          <div className="flex items-center justify-center">{logo}</div>
        </div>
      )}
    </div>
  );
};

export default Spinner;
