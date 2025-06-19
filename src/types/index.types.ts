export type DashboardData = {
  metrics: {
    clients: {
      value: string;
      percentage: number;
      trend: "up" | "down";
    };
    clientProfits: {
      value: string;
      percentage: number;
      trend: "up" | "down";
    };
    affiliateEarnings: {
      value: string;
      percentage: number;
      trend: "up" | "down";
    };
  };
  statistics: {
    dateRange: string;
    data: Array<{
      day: string;
      clients: number;
      profits: number;
      earnings: number;
    }>;
  };
  analytics: {
    dateRange: string;
    metrics: {
      deposit: number;
      withdraw: number;
    };
    data: Array<{
      day: string;
      deposit: number;
      withdraw: number;
    }>;
    tooltip: {
      value: number;
      date: string;
    };
  };
  card: {
    affiliateCode: string;
    type: string;
    holder: string;
    balance: number;
  };
  myEarnings: {
    total: number;
    currentWeek: {
      value: number;
      percentage: number;
      trend: "up" | "down";
    };
    lastWeek: {
      value: number;
      percentage: number;
      trend: "up" | "down";
    };
  };
};
