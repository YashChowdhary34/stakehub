import React from "react";

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 50,
  color = "white",
  className = "",
}) => {
  return (
    <div className={className}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin"
      >
        {/* Outer ring */}
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke={color}
          strokeWidth="6"
          strokeOpacity="0.2"
          fill="none"
        />

        {/* Moving arc */}
        <path
          d="M60 10
             A50 50 0 0 1 110 60"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Center logo elements */}
        <g transform="translate(38, 38) scale(0.35)">
          <polygon
            points="60,20 100,60 60,100 20,60"
            fill={color}
            opacity="0.9"
          />
          <circle
            cx="60"
            cy="60"
            r="15"
            fill="none"
            stroke={color}
            strokeWidth="6"
          />
        </g>
      </svg>
    </div>
  );
};

export default Spinner;
