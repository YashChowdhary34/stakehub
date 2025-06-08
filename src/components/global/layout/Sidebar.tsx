"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  House,
  LogOut,
  Menu,
  MessageSquare,
  PiggyBank,
  Settings,
  SquareArrowUpRight,
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

const SidebarContent = ({
  workspaceId,
  onItemClick,
}: {
  workspaceId: string;
  onItemClick?: () => void;
}) => {
  const pathname = usePathname();
  const { user } = useUser();
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.replace(`/dashboard/${workspaceId}/${href}`);
    onItemClick?.();
  };

  return (
    <div className="flex h-full flex-col">
      {/* User Profile */}
      <div className="flex h-16 items-center border-b px-6">
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
          <span className="ml-2 text-lg font-semibold">{user?.firstName}</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-4 py-4">
          {/* Main Menu */}
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Main Menu
            </h2>
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <Button
                  key={item.href}
                  variant={
                    pathname === `/dashboard/${workspaceId}/${item.href}`
                      ? "secondary"
                      : "ghost"
                  }
                  className="w-full justify-start"
                  onClick={() => handleNavigation(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Finances */}
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Finances
            </h2>
            <div className="space-y-1">
              {teamNavItems.map((item) => (
                <Button
                  key={item.href}
                  variant={
                    pathname === `/dashboard/${workspaceId}/${item.href}`
                      ? "secondary"
                      : "ghost"
                  }
                  className="w-full justify-start"
                  onClick={() => handleNavigation(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Bottom Utility Links */}
      <div className="border-t p-4">
        <div className="space-y-1">
          {utilityNavItems.map((item) => (
            <Button
              key={item.href}
              variant={
                pathname === `/dashboard/${workspaceId}/${item.href}`
                  ? "secondary"
                  : "ghost"
              }
              className="w-full justify-start"
              onClick={() => handleNavigation(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ workspaceId }: Props) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();

  return (
    <>
      {/* Mobile Header */}
      <div className="flex h-16 items-center justify-between border-b px-4 md:hidden">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center">
            <UserButton />
          </div>
          <span className="ml-2 text-lg font-semibold">{user?.firstName}</span>
        </div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent
              workspaceId={workspaceId}
              onItemClick={() => setIsMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden w-64 border-r bg-card md:block">
        <SidebarContent workspaceId={workspaceId} />
      </div>
    </>
  );
};

export default Sidebar;
