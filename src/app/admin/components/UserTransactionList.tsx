"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Hash,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Types based on your API structure
type Transaction = {
  id: string;
  userId: string;
  transactionMadeFor: "DEPOSIT" | "WITHDRAWL";
  transactionAmount: string;
  transactionMadeOn: string;
};

type User = {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  transactions: Transaction[];
};

type UserListItem = {
  adminId: string;
  createdAt: string;
  id: string;
  user: User;
  userId: string;
};

type ApiResponse = {
  users: UserListItem[];
};

type Props = {
  clientProfit: number;
};

export default function UserTransactionList({ clientProfit }: Props) {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [showTransactions, setShowTransactions] = useState(false);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/userList");
        const data: ApiResponse = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;

    return users.filter((userItem) => {
      const { user } = userItem;
      const searchLower = searchTerm.toLowerCase();

      return (
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.id.toLowerCase().includes(searchLower) ||
        userItem.id.toLowerCase().includes(searchLower)
      );
    });
  }, [users, searchTerm]);

  // Handle user click with optimistic UI
  const handleUserClick = (userItem: UserListItem) => {
    setSelectedUser(userItem);
    setShowTransactions(true);
  };

  // Go back to user list
  const handleBackClick = () => {
    setShowTransactions(false);
    setSelectedUser(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="w-full">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="h-16 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="h-full px-4 flex items-center justify-between max-w-7xl mx-auto">
          {showTransactions && selectedUser ? (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="hidden sm:block">
                <h2 className="font-semibold text-lg">
                  {selectedUser.user.firstName} {selectedUser.user.lastName}
                </h2>
              </div>
            </div>
          ) : (
            <h1 className="text-xl font-bold">User Management</h1>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-6 pb-8 px-4 max-w-7xl mx-auto">
        {!showTransactions ? (
          // User List View
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="w-full max-w-md mx-auto sm:max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search users by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </div>

            {/* User List */}
            <div className="w-full max-w-4xl mx-auto">
              {loading ? (
                <LoadingSkeleton />
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "No users found matching your search."
                      : "No users available."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6">
                  {filteredUsers.map((userItem) => {
                    const transactionCount = userItem.user.transactions.length;

                    return (
                      <Card
                        key={userItem.id}
                        className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                        onClick={() => handleUserClick(userItem)}
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {/* User Info */}
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-600 flex items-center justify-center text-white font-semibold">
                                {userItem.user.firstName?.[0]}
                                {userItem.user.lastName?.[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg">
                                  {userItem.user.firstName}{" "}
                                  {userItem.user.lastName}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {userItem.user.email}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  ID: {userItem.user.id.slice(0, 8)}...
                                </p>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-col sm:items-end gap-2">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    clientProfit >= 0
                                      ? "default"
                                      : "destructive"
                                  }
                                  className="font-mono"
                                >
                                  {clientProfit >= 0 ? "+" : ""}
                                  {clientProfit.toLocaleString()}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {transactionCount} transaction
                                {transactionCount !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Transaction Table View
          selectedUser && (
            <div className="space-y-6">
              {/* User Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedUser.user.firstName}{" "}
                        {selectedUser.user.lastName}
                      </h2>
                      <p className="text-muted-foreground font-normal">
                        {selectedUser.user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        <Badge className="text-lg px-3 py-1 font-mono">
                          {clientProfit}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Client Profit
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Transactions Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedUser.user.transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No transactions found.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      {/* Mobile View */}
                      <div className="sm:hidden space-y-4">
                        {selectedUser.user.transactions.map((transaction) => {
                          const { date, time } = formatDate(
                            transaction.transactionMadeOn
                          );
                          const isDeposit =
                            transaction.transactionMadeFor === "DEPOSIT";

                          return (
                            <Card key={transaction.id} className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {isDeposit ? (
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                  )}
                                  <Badge
                                    variant={
                                      isDeposit ? "default" : "destructive"
                                    }
                                  >
                                    {transaction.transactionMadeFor}
                                  </Badge>
                                </div>
                                <span
                                  className={`font-semibold font-mono ${
                                    isDeposit
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {transaction.transactionAmount}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {date} • {time}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Hash className="h-3 w-3" />
                                  {transaction.id.slice(0, 8)}...
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>

                      {/* Desktop Table */}
                      <div className="hidden sm:block">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium">
                                Type
                              </th>
                              <th className="text-left py-3 px-4 font-medium">
                                Amount
                              </th>
                              <th className="text-left py-3 px-4 font-medium">
                                Date & Time
                              </th>
                              <th className="text-left py-3 px-4 font-medium">
                                Transaction ID
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUser.user.transactions.map(
                              (transaction) => {
                                const { date, time } = formatDate(
                                  transaction.transactionMadeOn
                                );
                                const isDeposit =
                                  transaction.transactionMadeFor === "DEPOSIT";

                                return (
                                  <tr
                                    key={transaction.id}
                                    className="border-b hover:bg-muted/50"
                                  >
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2">
                                        {isDeposit ? (
                                          <TrendingUp className="h-4 w-4 text-green-600" />
                                        ) : (
                                          <TrendingDown className="h-4 w-4 text-red-600" />
                                        )}
                                        <Badge
                                          variant={
                                            isDeposit
                                              ? "default"
                                              : "destructive"
                                          }
                                        >
                                          {transaction.transactionMadeFor}
                                        </Badge>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <span
                                        className={`font-semibold font-mono ${
                                          isDeposit
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {transaction.transactionAmount}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4">
                                      <div>
                                        <div className="font-medium">
                                          {date}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {time}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <code className="text-sm bg-muted px-2 py-1 rounded">
                                        {transaction.id}
                                      </code>
                                    </td>
                                  </tr>
                                );
                              }
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        )}
      </main>
    </div>
  );
}
