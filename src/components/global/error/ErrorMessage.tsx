"use client";

import React from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface ErrorMessageProps {
  icon?: React.ReactNode;
  errorHeader?: string;
  errorBody?: string;
  buttonText?: string;
  redirectLink?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  icon = <AlertTriangle className="w-14 h-14 md:w-16 md:h-16 text-red-500" />,
  errorHeader = "Something went wrong",
  errorBody = "We encountered an unexpected error while processing your request. Please try again or contact our support team for assistance.",
  buttonText = "Go to Homepage",
  redirectLink = "/",
}) => {
  const handleRedirect = () => {
    if (redirectLink.startsWith("http")) {
      window.location.href = redirectLink;
    } else {
      // For relative paths, you might want to use your router's navigation
      window.location.href = redirectLink;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Main Error Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-orange-50/30 opacity-50"></div>

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-red-50 rounded-full">{icon}</div>
            </div>

            {/* Error Header */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {errorHeader}
            </h1>

            {/* Error Body */}
            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">
              {errorBody}
            </p>

            {/* Action Button */}
            <button
              onClick={handleRedirect}
              className="w-full bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-700 hover:to-zinc-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-zinc-200 active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Support Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
            <span className="font-medium">Need help?</span> If this problem
            persists, please{" "}
            <a
              href="mailto:support@company.com"
              className="text-zinc-600 hover:text-zinc-700 underline decoration-1 underline-offset-2 transition-colors"
            >
              contact our support team
            </a>{" "}
            for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
