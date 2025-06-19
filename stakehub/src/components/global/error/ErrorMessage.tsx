"use client";

import React from "react";
import { AlertTriangle, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorMessageProps {
  errorHead?: string;
  errorBody?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  errorHead = "Oops! Something went wrong",
  errorBody = "We encountered an unexpected error while processing your request. Please try again later or contact support if the problem persists.",
}) => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card border border-border rounded-lg shadow-lg p-6 sm:p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-destructive/10 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>

          {/* Error Content */}
          <div className="text-center space-y-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              {errorHead}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {errorBody}
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleGoHome}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              <Home className="h-4 w-4" />
              Go to Home
            </button>
          </div>
        </div>

        {/* Additional Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Need help? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
