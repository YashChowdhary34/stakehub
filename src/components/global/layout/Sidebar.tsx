"use client";

import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  IdCard,
  LogOut,
  Menu,
  MessageSquare,
  PiggyBank,
  Settings,
  SquareArrowUpRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const mainNavItems: NavItem[] = [
  {
    title: "Manage ID",
    href: "manage-accounts",
    icon: IdCard,
  },
  {
    title: "Chat With Us",
    href: "chat",
    icon: MessageSquare,
  },
  {
    title: "Affiliate Link",
    href: "affiliate",
    icon: SquareArrowUpRight,
  },
  {
    title: "Pocket Money",
    href: "pocket-money",
    icon: PiggyBank,
  },
  {
    title: "Self Deposit",
    href: "self-deposit",
    icon: BanknoteArrowUp,
  },
  {
    title: "Self Withdraw",
    href: "self-withdraw",
    icon: BanknoteArrowDown,
  },
];

const teamNavItems: NavItem[] = [
  {
    title: "My Transactions",
    href: "payments/transactions",
    icon: () => (
      <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
    ),
  },
  {
    title: "Affiliate Dashboard",
    href: "affiliate/dashboard",
    icon: () => (
      <span className="mr-2 h-2 w-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
    ),
  },
];

const utilityNavItems: NavItem[] = [
  {
    title: "Settings",
    href: "settings",
    icon: Settings,
  },
  {
    title: "Log Out",
    href: "logout",
    icon: LogOut,
  },
];

type Props = {
  workspaceId: string;
};

const Sidebar = ({ workspaceId }: Props) => {
  const pathname = usePathname();
  console.log("pathname:", pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const handleNavigation = (href: string) => {
    router.replace(`/dashboard/${workspaceId}/${href}`);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="fixed top-0 left-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-800/50 bg-zinc-900/95 backdrop-blur-sm px-4 md:hidden shadow-sm">
        <div className="flex items-center">
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("");
            }}
            className="flex items-center group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/50 ring-1 ring-zinc-700/50 transition-all duration-200 group-hover:bg-zinc-700/50 group-hover:ring-zinc-600/50">
              <UserButton />
            </div>
            <span className="ml-3 text-lg font-semibold tracking-tight text-zinc-100 group-hover:text-white transition-colors duration-200">
              {user?.firstName}
            </span>
          </Link>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2.5 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 transition-all duration-200 ring-1 ring-transparent hover:ring-zinc-700/50"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 left-0 z-30 w-3/5 transform bg-zinc-900 backdrop-blur-md transition-transform duration-300 ease-out md:hidden border-r border-zinc-800/50",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mt-16 h-[calc(100vh-4rem)] overflow-y-auto pb-20">
          <div className="px-3 py-6">
            <nav className="space-y-8">
              <div>
                <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Main Menu
                </p>
                <div className="space-y-1">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(item.href);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        pathname === `/dashboard/${workspaceId}/${item.href}`
                          ? "bg-zinc-100 text-zinc-900 shadow-sm"
                          : "text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-4 w-4 transition-colors duration-200",
                          pathname === `/dashboard/${workspaceId}/${item.href}`
                            ? "text-zinc-700"
                            : "text-zinc-400 group-hover:text-zinc-200"
                        )}
                      />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Finances
                </p>
                <div className="space-y-1">
                  {teamNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(item.href);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        pathname === `/dashboard/${workspaceId}/${item.href}`
                          ? "bg-zinc-100 text-zinc-900 shadow-sm"
                          : "text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
                      )}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                {utilityNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      pathname === `/dashboard/${workspaceId}/${item.href}`
                        ? "bg-zinc-100 text-zinc-900 shadow-sm"
                        : "text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-4 w-4 transition-colors duration-200",
                        pathname === `/dashboard/${workspaceId}/${item.href}`
                          ? "text-zinc-700"
                          : "text-zinc-400 group-hover:text-zinc-200"
                      )}
                    />
                    {item.title}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden h-screen w-64 flex-shrink-0 border-r border-zinc-800/50 bg-zinc-900/95 backdrop-blur-sm md:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-zinc-800/50 px-6">
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("");
              }}
              className="flex items-center group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800/50 ring-1 ring-zinc-700/50 transition-all duration-200 group-hover:bg-zinc-700/50 group-hover:ring-zinc-600/50 group-hover:scale-105">
                <UserButton />
              </div>
              <span className="ml-3 text-lg font-semibold tracking-tight text-zinc-100 group-hover:text-white transition-colors duration-200">
                {user?.firstName}
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-8 px-4 py-6">
              <div>
                <p className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Main Menu
                </p>
                <div className="space-y-1">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(item.href);
                      }}
                      className={cn(
                        "group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 relative",
                        pathname === `/dashboard/${workspaceId}/${item.href}`
                          ? "bg-zinc-100 text-zinc-900 shadow-lg shadow-zinc-900/20"
                          : "text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 hover:translate-x-1"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-4 w-4 transition-all duration-200",
                          pathname === `/dashboard/${workspaceId}/${item.href}`
                            ? "text-zinc-700"
                            : "text-zinc-400 group-hover:text-zinc-200 group-hover:scale-110"
                        )}
                      />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Finances
                </p>
                <div className="space-y-1">
                  {teamNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(item.href);
                      }}
                      className={cn(
                        "group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 relative",
                        pathname === `/dashboard/${workspaceId}/${item.href}`
                          ? "bg-zinc-100 text-zinc-900 shadow-lg shadow-zinc-900/20"
                          : "text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 hover:translate-x-1"
                      )}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.title}
                      {pathname ===
                        `/dashboard/${workspaceId}/${item.href}` && (
                        <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-zinc-600" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            {/* Bottom Utility Links */}
            <div className="border-t border-zinc-800/50 px-4 py-4 bg-zinc-950/20">
              <div className="space-y-1">
                {utilityNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(item.href);
                    }}
                    className={cn(
                      "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                      pathname === `/dashboard/${workspaceId}/${item.href}`
                        ? "bg-zinc-100 text-zinc-900 shadow-lg shadow-zinc-900/20"
                        : "text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 hover:translate-x-1"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-4 w-4 transition-all duration-200",
                        pathname === `/dashboard/${workspaceId}/${item.href}`
                          ? "text-zinc-700"
                          : "text-zinc-400 group-hover:text-zinc-200 group-hover:scale-110"
                      )}
                    />
                    {item.title}
                    {pathname === `/dashboard/${workspaceId}/${item.href}` && (
                      <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-zinc-600" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
