"use client";

import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  House,
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
    title: "Home",
    href: "home",
    icon: House,
  },
  {
    title: "Chat",
    href: "chat",
    icon: MessageSquare,
  },
  {
    title: "Affiliate",
    href: "affiliate",
    icon: SquareArrowUpRight,
  },
  {
    title: "Pocket Money",
    href: "pocket-money",
    icon: PiggyBank,
  },
];

const teamNavItems: NavItem[] = [
  {
    title: "Transactions",
    href: "payments/transactions",
    icon: () => <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />,
  },
  {
    title: "Dashboard",
    href: "affiliate/dashboard",
    icon: () => <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />,
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
      <div className="fixed top-0 left-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-700 bg-zinc-800 px-4 md:hidden">
        <div className="flex items-center">
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("");
            }}
            className="flex items-center"
          >
            <div className="flex h-8 w-8 items-center justify-center">
              <UserButton />
            </div>
            <span className="ml-2 text-lg font-extrabold tracking-wide">
              {user?.firstName}
            </span>
          </Link>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-md p-2 text-white hover:bg-zinc-900"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 right-0 z-30 transform bg-zinc-800 transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="mt-16 h-[calc(100vh-4rem)] overflow-y-auto pb-20">
          <div className="px-4 py-6">
            <nav className="space-y-6">
              <div>
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-white">
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
                        "flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                        pathname === `/dashboard/${workspaceId}/${item.href}`
                          ? "bg-gray-200 text-gray-900"
                          : "text-white/70 hover:bg-white hover:text-gray-900"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-white">
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
                        "flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                        pathname === `/dashboard/${workspaceId}/${item.href}`
                          ? "bg-gray-200 text-gray-900"
                          : "text-white/70 hover:bg-white hover:text-gray-900"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
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
                      "flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                      pathname === `/dashboard/${workspaceId}/${item.href}`
                        ? "bg-gray-200 text-gray-900"
                        : "text-white/80 hover:bg-white hover:text-gray-900"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.title}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden h-screen w-64 flex-shrink-0 border-r border-zinc-700 bg-zinc-800 md:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-zinc-700 px-6">
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("");
              }}
              className="flex items-center"
            >
              <div className="flex h-8 w-8 items-center justify-center">
                <UserButton />
              </div>
              <span className="ml-2 text-lg font-extrabold tracking-wide">
                {user?.firstName}
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-8 px-4 py-6">
              <div>
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-white">
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
                        "flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                        pathname === `/dashboard/${workspaceId}/${item.href}`
                          ? "bg-gray-200 text-gray-900"
                          : "text-white/70 hover:bg-white hover:text-gray-900"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-white">
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
                        "flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                        pathname === `/dashboard/${workspaceId}/${item.href}`
                          ? "bg-gray-200 text-gray-900"
                          : "text-white/70 hover:bg-white hover:text-gray-900"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            {/* Bottom Utility Links */}
            <div className="border-t border-zinc-700 px-4 py-4">
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
                      "flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                      pathname === `/dashboard/${workspaceId}/${item.href}`
                        ? "bg-gray-200 text-gray-900"
                        : "text-white/80 hover:bg-white hover:text-gray-900"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.title}
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
