"use client";
import { Button } from "@/components/ui/button";
import { DashboardData } from "@/types/index.types";
import React, { useState } from "react";
import MetricCard from "../components/MetricCard";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "../components/DataRangePicker";
import { StatisticsChart } from "../components/StatisticsChart";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  MoreHorizontal,
  PlusIcon,
} from "lucide-react";
import { AnalyticsChart } from "../components/AnalyticsChart";
import { SpotlightCard } from "../components/SpotlightCard";
import { EarningsDonut } from "../components/EarningsDonut";

type DashboardProps = {
  // data: DashboardData;
  referralsCount: number;
};

const AffiliateDashboard = ({ referralsCount }: DashboardProps) => {
  const [dateRange, setDateRange] = useState("last 7 days");
  const data = null;

  //fallback values if data is not available
  const fallbackData: DashboardData = {
    metrics: {
      clients: { value: "N/A", percentage: 0, trend: "up" },
      clientProfits: { value: "N/A", percentage: 0, trend: "up" },
      affiliateEarnings: { value: "N/A", percentage: 0, trend: "up" },
    },
    statistics: {
      dateRange: "No date range",
      data: [],
    },
    analytics: {
      dateRange: "No date range",
      metrics: {
        deposit: 0,
        withdraw: 0,
      },
      data: [],
      tooltip: { value: 0, date: "No date" },
    },
    card: {
      affiliateCode: "N/A",
      type: "Unknown",
      holder: "Card Holder",
      balance: 0,
    },
    myEarnings: {
      total: 0,
      currentWeek: { value: 0, percentage: 0, trend: "up" },
      lastWeek: { value: 0, percentage: 0, trend: "up" },
    },
  };

  const dashboardData = data || fallbackData;

  return (
    <main className="fixed top-0 left-0 w-full md:max-w-screen-sm mt-16 h-screen md:mt-0 md:ml-64 flex-grow">
      <div className="container mx-auto max-w-screen-lg p-4 space-y-6">
        <h1 className="text-xl font-bold">Overview</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            {dateRange}
          </Button>
        </div>

        {/*Metrics Cards*/}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Clients"
            value={`${referralsCount}`}
            percentage={dashboardData.metrics.clients.percentage}
            trend={`${dashboardData.metrics.clients.trend}`}
          />
          <MetricCard
            title="Client Profits"
            value={`${dashboardData.metrics.clientProfits.value}`}
            percentage={dashboardData.metrics.clientProfits.percentage}
            trend={`${dashboardData.metrics.clientProfits.trend}`}
          />
          <MetricCard
            title="Affiliate Earnings"
            value={`${dashboardData.metrics.clientProfits.value}`}
            percentage={dashboardData.metrics.clientProfits.percentage}
            trend={`${dashboardData.metrics.clientProfits.trend}`}
          />
        </div>

        {/*Charts Section*/}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Statistics</h2>
              <DateRangePicker value={dashboardData.statistics.dateRange} />
            </div>
            <div className="h-[300px]">
              <StatisticsChart data={dashboardData.statistics.data} />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Analytics</h2>
              <DateRangePicker value={dashboardData.analytics.dateRange} />
            </div>
            <div className="flex gap-6 mb-4">
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                <ArrowUpIcon className="h-4 w-4" />
                <span>${dashboardData.analytics.metrics.deposit}</span>
              </div>
              <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full">
                <ArrowDownIcon className="h-4 w-4" />
                <span>${dashboardData.analytics.metrics.withdraw}</span>
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

        {/* Card and Sales Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">My Cards</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SpotlightCard
                balance={dashboardData.card.balance}
                holder={dashboardData.card.holder}
                type={dashboardData.card.type}
                affiliateCode="temp"
              />
              <div className="space-y-4">
                <CardDetail
                  label="Card Type:"
                  value={dashboardData.card.type}
                />
                <CardDetail
                  label="Card Holder:"
                  value={dashboardData.card.holder}
                />
                <CardDetail
                  label="Total Balance:"
                  value={`$${dashboardData.card.balance.toLocaleString()}`}
                />
                <div className="flex gap-4 mt-6">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Pay Debt
                  </Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button variant="outline" className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Add Card
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Sales</h2>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-[200px] w-[200px] mb-6">
                <EarningsDonut total={dashboardData.myEarnings.total} />
              </div>
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-600"></span>
                    <span className="text-sm">Current Week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {dashboardData.myEarnings.currentWeek.value.toLocaleString()}
                    </span>
                    <span
                      className={`text-xs ${
                        dashboardData.myEarnings.currentWeek.trend === "up"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {dashboardData.myEarnings.currentWeek.trend === "up"
                        ? "+"
                        : "-"}
                      {dashboardData.myEarnings.currentWeek.percentage}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-lime-400"></span>
                    <span className="text-sm">Last Week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {dashboardData.myEarnings.lastWeek.value.toLocaleString()}
                    </span>
                    <span
                      className={`text-xs ${
                        dashboardData.myEarnings.lastWeek.trend === "up"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {dashboardData.myEarnings.lastWeek.trend === "up"
                        ? "+"
                        : "-"}
                      {dashboardData.myEarnings.lastWeek.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default AffiliateDashboard;

function CardDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
