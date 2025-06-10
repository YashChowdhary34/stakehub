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
    { name: "Chat", href: "/admin/panel/chat" },
    { name: "Dashboard", href: "admin/panel/chat" },
    { name: "About Us", href: "admin/panel/chat" },
    { name: "FAQs", href: "admin/panel/chat" },
  ];

  return (
    <section className="w-full sticky top-0 z-50 bg-zinc-950 backdrop-blur-sm border-b-2 max-h-16">
      <div className="container mx-auto px-4 py-2">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href={"/"}
            className="text-2xl font-bold transform transition-transform"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex">
              <Image src={"/logo.png"} alt="Logo" width={50} height={50} />
              <span className="absolute mt-3 ml-14 text-zinc-500 text-lg font-extrabold">
                Admin
              </span>
            </div>
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
