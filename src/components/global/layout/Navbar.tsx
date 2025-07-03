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
    { name: "Panel", href: "/panel" },
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
            ? "bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-lg shadow-slate-900/30"
            : "bg-slate-900/90 backdrop-blur-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center space-x-2 group transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg p-1"
              aria-label="Navigate to homepage"
            >
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="transition-transform duration-200 group-hover:rotate-3 sm:w-10 sm:h-10"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
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
                    "hover:bg-slate-800/60 hover:text-white",
                    "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900",
                    "group",
                    pathname === item.href
                      ? "text-white bg-slate-800/70 shadow-sm"
                      : "text-slate-300"
                  )}
                >
                  {item.name}
                  {pathname === item.href && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" />
                  )}
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
                          "w-8 h-8 ring-2 ring-slate-600 hover:ring-blue-500 transition-all duration-200",
                      },
                    }}
                  />
                </div>
              ) : (
                <button
                  onClick={handleAuthClick}
                  className={cn(
                    "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                    "border border-blue-500/20 hover:border-blue-400/30",
                    "shadow-lg hover:shadow-xl transition-all duration-200",
                    "text-white font-medium px-6 py-2.5 rounded-lg",
                    "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900",
                    "transform hover:scale-105 active:scale-95"
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
                        "w-8 h-8 ring-2 ring-slate-600 hover:ring-blue-500 transition-all duration-200",
                    },
                  }}
                />
              ) : (
                <button
                  onClick={handleAuthClick}
                  className={cn(
                    "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                    "border border-blue-500/20 hover:border-blue-400/30",
                    "text-white font-medium px-4 py-2 rounded-lg text-sm",
                    "shadow-md hover:shadow-lg transition-all duration-200",
                    "transform hover:scale-105 active:scale-95"
                  )}
                >
                  Sign Up
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  "hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-400",
                  "text-slate-300 hover:text-white",
                  "transform hover:scale-105 active:scale-95"
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
          <div className="px-4 pb-4 pt-2">
            <div className="bg-slate-800/80 backdrop-blur-lg border border-slate-700/60 rounded-xl p-4 shadow-xl">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleNavItemClick}
                    className={cn(
                      "px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                      "hover:bg-slate-700/60 hover:text-white",
                      "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800",
                      "flex items-center justify-center group",
                      pathname === item.href
                        ? "text-white bg-slate-700/70 shadow-sm"
                        : "text-slate-300"
                    )}
                  >
                    <span>{item.name}</span>
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-200",
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
