import React from "react";
import { Menu, MessageSquare, CreditCard } from "lucide-react";

const AdminPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Admin Dashboard
          </h1>
          <p className="text-zinc-400 text-lg">
            Manage your platform efficiently with our admin tools
          </p>
        </div>

        {/* Navigation Instructions */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Mobile Instructions */}
          <div className="md:hidden bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-zinc-800/80 rounded-xl flex items-center justify-center mr-4">
                <Menu className="w-6 h-6 text-zinc-300" />
              </div>
              <h3 className="text-xl font-semibold text-white">Get Started</h3>
            </div>
            <p className="text-zinc-400 mb-4">
              Tap the hamburger menu (☰) at the top right to access admin
              features
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-zinc-500">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span>Chat Management</span>
              </div>
              <div className="flex items-center text-sm text-zinc-500">
                <CreditCard className="w-4 h-4 mr-2" />
                <span>User Transactions</span>
              </div>
            </div>
          </div>

          {/* Desktop Instructions */}
          <div className="hidden md:block bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-zinc-800/80 rounded-xl flex items-center justify-center mr-4">
                <MessageSquare className="w-6 h-6 text-zinc-300" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Chat Management
              </h3>
            </div>
            <p className="text-zinc-400 mb-4">
              Monitor and manage user conversations
            </p>
            <button className="w-full bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-zinc-600 hover:border-zinc-500">
              Navigate to Chat
            </button>
          </div>

          <div className="hidden md:block bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-zinc-800/80 rounded-xl flex items-center justify-center mr-4">
                <CreditCard className="w-6 h-6 text-zinc-300" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                User Transactions
              </h3>
            </div>
            <p className="text-zinc-400 mb-4">
              View and analyze user payment history
            </p>
            <button className="w-full bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-zinc-600 hover:border-zinc-500">
              Navigate to Transactions
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">24/7</div>
            <div className="text-zinc-500 text-sm">Monitoring</div>
          </div>
          <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">100%</div>
            <div className="text-zinc-500 text-sm">Secure</div>
          </div>
          <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/30 rounded-xl p-4 text-center md:block hidden">
            <div className="text-2xl font-bold text-white mb-1">∞</div>
            <div className="text-zinc-500 text-sm">Scalable</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
