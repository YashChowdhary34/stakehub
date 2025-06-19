import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { Toaster } from "sonner";
import CardContentSection from "./CardContentSection";
import ErrorMessage from "@/components/global/error/ErrorMessage";
import { getAffiliateCode } from "@/actions/user";
import { BarChart3, Award, TrendingUp, Users } from "lucide-react";

const Affiliate = async () => {
  const userAffiliateCode = await getAffiliateCode();

  if (!userAffiliateCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
        <ErrorMessage errorHead="Can't get your affiliate code at the moment" />
      </div>
    );
  }

  const userAffiliateLink = `${
    process.env.NEXT_PUBLIC_SITE_URL || ""
  }/affiliates/${userAffiliateCode}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-800/30 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-zinc-700/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-grid-zinc-800/[0.05] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"></div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-zinc-800/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-700/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Toaster */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(24, 24, 27, 0.95)",
            border: "1px solid rgba(63, 63, 70, 0.6)",
            color: "rgb(244, 244, 245)",
            backdropFilter: "blur(12px)",
            borderRadius: "12px",
          },
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="group inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-zinc-800/60 to-zinc-900/60 border border-zinc-700/60 mb-6 backdrop-blur-sm">
            <div className="p-1 bg-zinc-700/50 rounded-full">
              <Award className="h-4 w-4 text-zinc-300" />
            </div>
            <span className="text-sm font-medium text-zinc-300 tracking-wide">
              Affiliate Program
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-300 mb-6 tracking-tight leading-tight">
            Share & Earn
            <span className="block text-3xl sm:text-4xl lg:text-5xl text-zinc-400 font-normal mt-2">
              Unlimited Rewards
            </span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            Transform your network into a revenue stream. Every referral counts,
            every connection matters.
          </p>
        </div>

        {/* Stats Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 sm:mb-16 max-w-4xl mx-auto">
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-600/20 to-zinc-500/20 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-zinc-900/60 backdrop-blur-sm rounded-lg p-4 border border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800/50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Commission Rate</p>
                  <p className="text-lg font-bold text-zinc-200">Up to 30%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-600/20 to-zinc-500/20 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-zinc-900/60 backdrop-blur-sm rounded-lg p-4 border border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800/50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Lifetime Value</p>
                  <p className="text-lg font-bold text-zinc-200">Recurring</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-600/20 to-zinc-500/20 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-zinc-900/60 backdrop-blur-sm rounded-lg p-4 border border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800/50 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Tracking</p>
                  <p className="text-lg font-bold text-zinc-200">Real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="flex justify-center mb-12 sm:mb-16">
          <div className="w-full max-w-4xl">
            <div className="group relative">
              {/* Animated outer glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-zinc-600/20 via-zinc-400/30 to-zinc-600/20 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-500 animate-pulse"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-zinc-500/30 via-zinc-300/40 to-zinc-500/30 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-300"></div>

              <Card className="relative bg-zinc-900/95 backdrop-blur-md border-zinc-800/60 shadow-2xl rounded-2xl overflow-hidden">
                {/* Card header gradient */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-600/60 to-transparent"></div>

                <CardHeader className="pb-8 pt-8 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="space-y-2">
                      <CardTitle className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-300 tracking-tight">
                        Your Affiliate Link
                      </CardTitle>
                      <CardDescription className="text-zinc-400 text-lg">
                        Your gateway to unlimited earning potential
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-800/20 to-emerald-900/20 border border-emerald-700/30 self-center sm:self-start">
                      <div className="relative">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                      </div>
                      <span className="text-sm font-medium text-emerald-300">
                        Active & Ready
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-8 px-8">
                  <CardContentSection userAffiliateLink={userAffiliateLink} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Dashboard Button */}
        {/* <div className="flex justify-center mb-12 sm:mb-8">
          <Link
            href="/affiliate-dashboard"
            className="group relative inline-block"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-zinc-600/40 via-zinc-500/50 to-zinc-600/40 rounded-xl blur-lg opacity-30 group-hover:opacity-60 transition-all duration-300"></div>
            <div className="relative bg-gradient-to-r from-zinc-900/90 to-zinc-800/90 backdrop-blur-md rounded-xl px-8 py-5 border border-zinc-700/60 hover:border-zinc-600/70 transition-all duration-300 shadow-xl hover:shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 rounded-xl border border-zinc-700/50">
                  <BarChart3 className="h-6 w-6 text-zinc-300" />
                </div>
                <div>
                  <span className="text-zinc-100 font-semibold text-lg">
                    View Dashboard
                  </span>
                  <p className="text-sm text-zinc-400">
                    Monitor your earnings & referrals
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div> */}

        {/* Bottom Section */}
        <div className="mt-16 sm:mt-20 text-center">
          <div className="relative inline-flex items-center gap-4 px-6 py-3 rounded-full bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-zinc-600/60 to-zinc-600/60"></div>
            <span className="text-zinc-400 font-medium">
              Ready to unlock your earning potential?
            </span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent via-zinc-600/60 to-zinc-600/60"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Affiliate;
