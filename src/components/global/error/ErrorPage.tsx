import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ErrorPageProps = {
  icon?: React.ComponentType<{ className?: string }>;
  errorHead?: string;
  errorBody?: string;
};

const ErrorPage = ({
  icon: CustomIcon,
  errorHead = "Something went wrong",
  errorBody = "We're sorry, but something unexpected happened. Please try again later or contact support if the problem persists.",
}: ErrorPageProps) => {
  const IconComponent = CustomIcon || AlertCircle;

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Icon Section */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-slate-800 shadow-lg">
            <IconComponent className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Content Section */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            {errorHead}
          </h1>

          <Alert className="border-slate-200 bg-white shadow-sm">
            <AlertDescription className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {errorBody}
            </AlertDescription>
          </Alert>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 font-medium rounded-lg border border-slate-200 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <Home className="h-4 w-4" />
            Go Home
          </button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-slate-500">
            Error ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
