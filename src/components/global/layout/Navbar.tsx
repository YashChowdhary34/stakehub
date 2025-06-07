"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const navItems = [
    { name: "Features", href: "/features" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "About Us", href: "/about" },
    { name: "FAQs", href: "/faqs" },
  ];

  return (
    <section className="w-full sticky top-0 z-50 bg-zinc-950 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href={"/"}
            className="text-2xl font-bold transform transition-transform hover:scale-105 "
            onClick={() => setIsMenuOpen(false)}
          >
            <Image src={"/logo.png"} alt="Logo" width={50} height={50} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-gray-300 hover:text-white transition-colors duration-200 relative group",
                  pathname === item.href && "text-white"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Button or User Profile */}
          <div className="hidden md:block">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <Button onClick={() => router.push("/auth/sign-up")}>
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center md:hidden ">
            {/* Auth Button on Mobile */}
            {isSignedIn ? (
              <span className="mr-4 mt-1">
                <UserButton afterSignOutUrl="/" />
              </span>
            ) : (
              <Button
                onClick={() => router.push("/auth/sign-up")}
                className="mr-4"
              >
                Get Started
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isMenuOpen ? "max-h-64 opacity-100 mt-4" : "max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-col items-center space-y-4 py-4 border-gray-600 border-2 rounded-xl backdrop-blur-lg">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "text-gray-300 hover:text-white transition-colors duration-200 relative group",
                pathname === item.href && "text-white"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Navbar;
