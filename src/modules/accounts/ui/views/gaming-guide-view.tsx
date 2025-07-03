import React from "react";
import { Shield, Copy, LogIn, Play, AlertTriangle } from "lucide-react";

export default function GamingGuideView() {
  const steps = [
    {
      icon: <Copy className="w-5 h-5" />,
      title: "Copy Your Credentials",
      description:
        "Click the copy button next to your ID or password. Passwords are hidden by default—use the eye icon to toggle visibility.",
    },
    {
      icon: <LogIn className="w-5 h-5" />,
      title: "Login to Your Platform",
      description:
        "Navigate to your gaming platform's login page and paste your credentials securely.",
    },
    {
      icon: <Play className="w-5 h-5" />,
      title: "Start Gaming",
      description:
        "Once logged in, enjoy your games! Remember to log out when finished, especially on shared devices.",
    },
  ];

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          How to Use Your Gaming IDs
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Follow these simple steps to securely access your gaming accounts
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className="group bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg flex items-center justify-center font-semibold text-sm shadow-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-blue-600 flex-shrink-0">{step.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {step.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Warning */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 md:p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-blue-900">
                Security Guidelines
              </h3>
            </div>
            <p className="text-blue-800 text-sm leading-relaxed">
              Never share your gaming credentials with anyone. If you suspect
              your account has been compromised, contact support immediately
              using the &quot;Get Help&quot; button on your gaming cards.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
