"use client";

import { $Enums } from "@/generated/prisma";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Coins,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Transaction = {
  id: string;
  userId: string;
  transactionMadeFor: $Enums.TransactionType;
  transactionAmount: string;
  transactionMadeOn: Date;
};

const transactionConfig = {
  DEPOSIT: {
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: TrendingUp,
    label: "Deposit",
  },
  WITHDRAWL: {
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: TrendingDown,
    label: "Withdrawal",
  },
  POCKETMONEY: {
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    icon: Coins,
    label: "Pocket Money",
  },
  AFFILIATE: {
    color: "bg-lime-500/10 text-lime-600 border-lime-500/20",
    icon: Users,
    label: "Affiliate",
  },
};

type Props = {
  totalProfit: number;
};

export default function UserTransactions({ totalProfit }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = nextCursor !== null;
  console.log("this is profit", totalProfit);

  const fetchPage = async (cursorParam?: string, isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("take", "10");
      if (cursorParam) {
        params.set("cursor", cursorParam);
      }

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Error fetching: ${res.statusText}`);
      }

      const data: { transactions: Transaction[]; nextCursor: string | null } =
        await res.json();

      if (isRefresh) {
        // Refresh: replace all transactions
        setTransactions(data.transactions);
        setNextCursor(data.nextCursor);
      } else if (cursorParam) {
        // Load more: append to existing
        setTransactions((prev) => [...prev, ...data.transactions]);
        setNextCursor(data.nextCursor);
      } else {
        // First load
        setTransactions(data.transactions);
        setNextCursor(data.nextCursor);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchPage(undefined, true);
  };

  // On mount: fetch first page
  useEffect(() => {
    fetchPage(undefined);
  }, []);

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const formatDate = (date: Date, mobile = false) => {
    if (mobile) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(new Date(date));
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 md:p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Transactions
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your financial activities
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="self-start sm:self-auto"
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="flex-shrink-0 p-4 md:p-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Profit
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl md:text-3xl font-bold">
              <span
                className={cn(
                  totalProfit >= 0 ? "text-green-600" : "text-red-600"
                )}
              >
                ₹{totalProfit.toString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {transactions.length} transaction
              {transactions.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex-shrink-0 mx-4 md:mx-6 mb-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive">Error: {error}</p>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="flex-1 overflow-hidden px-4 md:px-6">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0 pb-3">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="h-full overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="sm:hidden">Date</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Date & Time
                    </TableHead>
                    <TableHead className="hidden md:table-cell w-[100px]">
                      ID
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => {
                    const config = transactionConfig[tx.transactionMadeFor];
                    const Icon = config.icon;
                    const amount = parseFloat(tx.transactionAmount);
                    const isPositive = [
                      "DEPOSIT",
                      "AFFILIATE",
                      "POCKETMONEY",
                    ].includes(tx.transactionMadeFor);

                    return (
                      <TableRow key={tx.id} className="hover:bg-muted/50">
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "p-1.5 rounded-full sm:block",
                                config.color
                              )}
                            >
                              <Icon className="h-3 w-3 sm:block hidden" />
                            </div>
                            <div className="flex flex-col sm:block">
                              <Badge
                                variant="outline"
                                className={cn("text-xs w-fit", config.color)}
                              >
                                {config.label}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <div className="font-medium">
                            <span
                              className={cn(
                                isPositive ? "text-green-600" : "text-red-600"
                              )}
                            >
                              {formatAmount(Math.abs(amount).toString())}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="sm:hidden py-3 text-muted-foreground text-sm">
                          {formatDate(tx.transactionMadeOn, true)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell py-3 text-muted-foreground text-sm">
                          {formatDate(tx.transactionMadeOn)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-3 text-muted-foreground text-xs font-mono">
                          {tx.id.slice(-8)}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {transactions.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading and Load More */}
      <div className="flex-shrink-0 p-4 md:p-6 pt-4">
        {isLoading && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading transactions...
            </div>
          </div>
        )}

        {!isLoading && hasMore && (
          <div className="text-center">
            <Button
              onClick={() => fetchPage(nextCursor!)}
              disabled={isLoading}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <ChevronDown className="h-4 w-4 mr-2" />
              Load More Transactions
            </Button>
          </div>
        )}

        {!isLoading && !hasMore && transactions.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            No more transactions to load
          </div>
        )}
      </div>
    </div>
  );
}
