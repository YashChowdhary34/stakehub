"use client";
import { Button } from "@/components/ui/button";
import { DashboardData } from "@/types/index.types";
import React, { useState, useEffect } from "react";
import MetricCard from "../components/MetricCard";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "../components/DataRangePicker";
import { StatisticsChart } from "../components/StatisticsChart";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  MoreHorizontal,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { AnalyticsChart } from "../components/AnalyticsChart";
import { SpotlightCard } from "../components/SpotlightCard";
import { EarningsDonut } from "../components/EarningsDonut";
import toast from "react-hot-toast";

interface ApiResponse {
  userData: {
    firstName: string;
    lastName: string;
    affiliateCode: string;
    referralsMade: Array<{
      referred: {
        id: string;
        profit: number;
        transactions: Array<{
          transactionAmount: string;
          transactionMadeFor: "DEPOSIT" | "WITHDRAWL";
        }>;
      };
    }>;
  };
  cntReferredUsers: number;
  referredUsers: Array<{
    id: string;
    profit: number;
    transactions: Array<{
      transactionAmount: string;
      transactionMadeFor: "DEPOSIT" | "WITHDRAWL";
    }>;
  }>;
  combinedProfit: number;
  combinedDeposit: number;
  combinedWithdrawal: number;
}

const AffiliateDashboard = () => {
  const [dateRange, setDateRange] = useState("Last 7 days");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setRefreshing(true);
      else setLoading(true);

      const response = await fetch("/api/affiliate/dashboard-data");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const result = await response.json();
      setData(result);
      setDateRange("Last 7 days");
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate affiliate earnings (assume 10% commission on profits)
  const affiliateEarnings = data ? Math.floor(data.combinedProfit * 0.1) : 0;

  // Generate mock chart data based on real data
  const generateChartData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({
      day,
      clients: Math.floor(Math.random() * (data?.cntReferredUsers || 0) + 1),
      profits: Math.floor(Math.random() * (data?.combinedProfit || 0)),
      earnings: Math.floor(Math.random() * affiliateEarnings),
      deposit: Math.floor(Math.random() * (data?.combinedDeposit || 0)),
      withdraw: Math.floor(Math.random() * (data?.combinedWithdrawal || 0)),
    }));
  };

  const dashboardData: DashboardData = data
    ? {
        metrics: {
          clients: {
            value: data.cntReferredUsers.toString(),
            percentage: 12.5,
            trend: "up" as const,
          },
          clientProfits: {
            value: `₹${data.combinedProfit.toLocaleString()}`,
            percentage: 8.2,
            trend: "up" as const,
          },
          affiliateEarnings: {
            value: `₹${affiliateEarnings.toLocaleString()}`,
            percentage: 15.3,
            trend: "up" as const,
          },
        },
        statistics: {
          dateRange: dateRange,
          data: generateChartData(),
        },
        analytics: {
          dateRange: dateRange,
          metrics: {
            deposit: data.combinedDeposit,
            withdraw: data.combinedWithdrawal,
          },
          data: generateChartData(),
          tooltip: {
            value: data.combinedProfit,
            date: new Date().toLocaleDateString(),
          },
        },
        card: {
          affiliateCode: data.userData.affiliateCode,
          type: data.cntReferredUsers > 10 ? "VIP" : "Standard",
          holder: `${data.userData.firstName} ${data.userData.lastName}`,
          balance: affiliateEarnings,
        },
        myEarnings: {
          total: affiliateEarnings,
          currentWeek: {
            value: Math.floor(affiliateEarnings * 0.6),
            percentage: 12.3,
            trend: "up" as const,
          },
          lastWeek: {
            value: Math.floor(affiliateEarnings * 0.4),
            percentage: 8.7,
            trend: "up" as const,
          },
        },
      }
    : {
        metrics: {
          clients: { value: "0", percentage: 0, trend: "up" as const },
          clientProfits: { value: "₹0", percentage: 0, trend: "up" as const },
          affiliateEarnings: {
            value: "₹0",
            percentage: 0,
            trend: "up" as const,
          },
        },
        statistics: {
          dateRange: "No data available",
          data: [],
        },
        analytics: {
          dateRange: "No data available",
          metrics: { deposit: 0, withdraw: 0 },
          data: [],
          tooltip: { value: 0, date: "No date" },
        },
        card: {
          affiliateCode: "N/A",
          type: "Standard",
          holder: "Loading...",
          balance: 0,
        },
        myEarnings: {
          total: 0,
          currentWeek: { value: 0, percentage: 0, trend: "up" as const },
          lastWeek: { value: 0, percentage: 0, trend: "up" as const },
        },
      };

  if (loading) {
    return (
      <main className="h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
        <div className="h-full flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="text-lg text-zinc-400">Loading dashboard...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="container mx-auto max-w-screen-xl p-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                Affiliate Overview
              </h1>
              <p className="text-zinc-400 mt-1">
                Welcome back, {data?.userData.firstName}! Here&apos;s your
                performance summary.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300"
                disabled={refreshing}
                onClick={() => fetchDashboardData(true)}
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                variant="outline"
                className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300"
              >
                {dateRange}
              </Button>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Clients"
              value={dashboardData.metrics.clients.value}
              percentage={dashboardData.metrics.clients.percentage}
              trend={dashboardData.metrics.clients.trend}
            />
            <MetricCard
              title="Client Profits"
              value={dashboardData.metrics.clientProfits.value}
              percentage={dashboardData.metrics.clientProfits.percentage}
              trend={dashboardData.metrics.clientProfits.trend}
            />
            <MetricCard
              title="Your Earnings"
              value={dashboardData.metrics.affiliateEarnings.value}
              percentage={dashboardData.metrics.affiliateEarnings.percentage}
              trend={dashboardData.metrics.affiliateEarnings.trend}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-zinc-100">
                  Performance Statistics
                </h2>
                <DateRangePicker value={dashboardData.statistics.dateRange} />
              </div>
              <div className="h-[320px]">
                <StatisticsChart data={dashboardData.statistics.data} />
              </div>
            </Card>

            <Card className="p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-zinc-100">
                  Analytics Overview
                </h2>
                <DateRangePicker value={dashboardData.analytics.dateRange} />
              </div>
              <div className="flex gap-4 mb-6">
                <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20">
                  <ArrowUpIcon className="h-4 w-4" />
                  <span className="font-medium">
                    ${dashboardData.analytics.metrics.deposit.toLocaleString()}
                  </span>
                  <span className="text-xs opacity-70">Deposits</span>
                </div>
                <div className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full border border-red-500/20">
                  <ArrowDownIcon className="h-4 w-4" />
                  <span className="font-medium">
                    ${dashboardData.analytics.metrics.withdraw.toLocaleString()}
                  </span>
                  <span className="text-xs opacity-70">Withdrawals</span>
                </div>
              </div>
              <div className="h-[240px]">
                <AnalyticsChart
                  data={dashboardData.analytics.data}
                  tooltip={dashboardData.analytics.tooltip}
                />
              </div>
            </Card>
          </div>

          {/* Card and Earnings Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-zinc-100">
                  Affiliate Card
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SpotlightCard
                  balance={dashboardData.card.balance}
                  holder={dashboardData.card.holder}
                  type={dashboardData.card.type}
                  affiliateCode={dashboardData.card.affiliateCode}
                />
                <div className="space-y-6">
                  <CardDetail
                    label="Card Type:"
                    value={dashboardData.card.type}
                  />
                  <CardDetail
                    label="Card Holder:"
                    value={dashboardData.card.holder}
                  />
                  <CardDetail
                    label="Affiliate Code:"
                    value={dashboardData.card.affiliateCode}
                  />
                  <CardDetail
                    label="Total Earnings:"
                    value={`$${dashboardData.card.balance.toLocaleString()}`}
                  />
                  <div className="flex gap-3 mt-8">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1">
                      Withdraw Earnings
                    </Button>
                    <Button
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-zinc-100">
                  Earnings Breakdown
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:text-zinc-100"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-[200px] w-[200px] mb-8">
                  <EarningsDonut total={dashboardData.myEarnings.total} />
                </div>
                <div className="w-full space-y-6">
                  <div className="flex justify-between items-center p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                      <span className="text-sm font-medium text-zinc-300">
                        Current Week
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-100">
                        ₹
                        {dashboardData.myEarnings.currentWeek.value.toLocaleString()}
                      </span>
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                        +{dashboardData.myEarnings.currentWeek.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-lime-400"></span>
                      <span className="text-sm font-medium text-zinc-300">
                        Last Week
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-100">
                        ₹
                        {dashboardData.myEarnings.lastWeek.value.toLocaleString()}
                      </span>
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                        +{dashboardData.myEarnings.lastWeek.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AffiliateDashboard;

function CardDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-zinc-400 font-medium">{label}</span>
      <span className="text-sm font-semibold text-zinc-100">{value}</span>
    </div>
  );
}
