"use client";

import { cn } from "@/lib/utils";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const navItems = [
    { name: "Features", href: "/features" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "About Us", href: "/about" },
    { name: "FAQs", href: "/faqs" },
  ] as const;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogoClick = () => {
    setIsMenuOpen(false);
  };

  const handleNavItemClick = () => {
    setIsMenuOpen(false);
  };

  const handleAuthClick = () => {
    router.push("/auth/sign-up");
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <header className="w-full sticky top-0 z-50">
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          isScrolled
            ? "bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/50 shadow-lg shadow-zinc-900/20"
            : "bg-zinc-950/90 backdrop-blur-sm"
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center space-x-2 group transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded-lg p-1"
              aria-label="Navigate to homepage"
            >
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="transition-transform duration-200 group-hover:rotate-3"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-400/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    "hover:bg-zinc-800/50 hover:text-white",
                    "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950",
                    "group",
                    pathname === item.href
                      ? "text-white bg-zinc-800/60"
                      : "text-zinc-300"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center">
              {isSignedIn ? (
                <div className="flex items-center space-x-3">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox:
                          "w-8 h-8 ring-2 ring-zinc-700 hover:ring-zinc-600 transition-all duration-200",
                      },
                    }}
                  />
                </div>
              ) : (
                <button
                  onClick={handleAuthClick}
                  className={cn(
                    "bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700",
                    "border border-zinc-600 hover:border-zinc-500",
                    "shadow-lg hover:shadow-xl transition-all duration-200",
                    "text-white font-medium px-6 py-2",
                    "focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  )}
                >
                  Get Started
                </button>
              )}
            </div>

            {/* Mobile Auth & Menu */}
            <div className="flex items-center space-x-3 md:hidden">
              {isSignedIn ? (
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox:
                        "w-8 h-8 ring-2 ring-zinc-700 hover:ring-zinc-600 transition-all duration-200",
                    },
                  }}
                />
              ) : (
                <button
                  onClick={handleAuthClick}
                  className={cn(
                    "bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700",
                    "border border-zinc-600 hover:border-zinc-500",
                    "text-xs font-medium px-3 py-1.5",
                    "text-white font-medium px-6 py-2",
                    "shadow-md hover:shadow-lg transition-all duration-200"
                  )}
                >
                  Get Started
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  "hover:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-400",
                  "text-zinc-300 hover:text-white"
                )}
              >
                <div className="relative w-6 h-6">
                  <Menu
                    className={cn(
                      "absolute inset-0 transition-all duration-200",
                      isMenuOpen
                        ? "opacity-0 rotate-90"
                        : "opacity-100 rotate-0"
                    )}
                  />
                  <X
                    className={cn(
                      "absolute inset-0 transition-all duration-200",
                      isMenuOpen
                        ? "opacity-100 rotate-0"
                        : "opacity-0 rotate-90"
                    )}
                  />
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-out",
            isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-4 pb-4">
            <div className="bg-zinc-900/80 backdrop-blur-lg border border-zinc-800/60 rounded-xl p-4 shadow-xl">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleNavItemClick}
                    className={cn(
                      "px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                      "hover:bg-zinc-800/60 hover:text-white",
                      "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-900",
                      "flex items-center justify-between group",
                      pathname === item.href
                        ? "text-white bg-zinc-800/60"
                        : "text-zinc-300"
                    )}
                  >
                    <span>{item.name}</span>
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full bg-gradient-to-r from-zinc-400 to-zinc-500 transition-all duration-200",
                        pathname === item.href
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-0 group-hover:opacity-60 group-hover:scale-100"
                      )}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
