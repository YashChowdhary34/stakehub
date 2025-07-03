"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Gamepad2,
  Shield,
  Zap,
  Star,
  Trophy,
  Target,
  Compass,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import Image from "next/image";

type TradingCard = {
  platformImage?: string;
  platformName: string;
  tradingID: string;
  accessCode: string;
};

type Props = {
  cards?: TradingCard[];
};

const GamingCarouselView = ({ cards = [] }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Navigation functions
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  }, [cards.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  }, [cards.length]);

  // Copy to clipboard function
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied!`, {
        description: `${type} has been copied to your clipboard`,
      });
    } catch (err) {
      console.log(err);
      toast.error(`Failed to copy ${type.toLowerCase()}`);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (index: number) => {
    setShowPassword((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Platform icons for empty state
  const platformIcons = [
    { icon: Gamepad2, name: "Steam" },
    { icon: Shield, name: "Epic Games" },
    { icon: Zap, name: "Origin" },
    { icon: Star, name: "Ubisoft" },
    { icon: Trophy, name: "PlayStation" },
    { icon: Target, name: "Xbox" },
    { icon: Compass, name: "Battle.net" },
    { icon: Rocket, name: "GOG" },
  ];

  // Empty state
  if (cards.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            Create Your First Trading ID
          </h2>
          <p className="text-slate-600 text-sm md:text-base">
            Get started with our supported platforms
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {platformIcons.map((platform, index) => {
            const IconComponent = platform.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-2">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-slate-700">
                  {platform.name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="w-5 h-5 mr-2" />
            Create New Trading ID
          </Button>
        </div>

        <Toaster />
      </div>
    );
  }

  // Single card component
  const TradingCard = ({
    card,
    index,
  }: {
    card: TradingCard;
    index: number;
  }) => (
    <Card className="w-full max-w-sm mx-auto bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50 opacity-60" />

      <CardHeader className="text-center pb-4 pt-6 relative z-10">
        <CardTitle className="flex justify-center mb-4">
          {card.platformImage ? (
            <div className="relative w-16 h-16 md:w-20 md:h-20 p-3 bg-white rounded-2xl shadow-md border border-slate-100">
              <Image
                src={card.platformImage}
                alt={card.platformName}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-md border border-slate-100">
              <span className="text-2xl font-bold text-blue-600">
                {card.platformName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </CardTitle>
        <div className="text-center">
          <span className="text-slate-600 text-sm">Trading ID for </span>
          <span className="font-bold text-slate-800 bg-blue-100 px-3 py-1 rounded-full text-sm">
            {card.platformName}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-6 pb-6 relative z-10">
        {/* Trading ID Field */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Trading ID
          </Label>
          <div className="relative group">
            <Input
              type="text"
              value={card.tradingID}
              readOnly
              className="pr-12 bg-slate-50 border-slate-200 text-slate-800 font-mono text-sm rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 hover:bg-slate-100"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-blue-100 rounded-lg opacity-60 group-hover:opacity-100 transition-all duration-200"
              onClick={() => copyToClipboard(card.tradingID, "Trading ID")}
            >
              <Copy className="h-4 w-4 text-blue-600" />
            </Button>
          </div>
        </div>

        {/* Access Code Field */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Access Code
          </Label>
          <div className="relative group">
            <Input
              type={showPassword[index] ? "text" : "password"}
              value={card.accessCode}
              readOnly
              className="pr-20 bg-slate-50 border-slate-200 text-slate-800 font-mono text-sm rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 hover:bg-slate-100"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-60 group-hover:opacity-100 transition-all duration-200">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-100 rounded-lg"
                onClick={() => togglePasswordVisibility(index)}
              >
                {showPassword[index] ? (
                  <EyeOff className="h-4 w-4 text-blue-600" />
                ) : (
                  <Eye className="h-4 w-4 text-blue-600" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-100 rounded-lg"
                onClick={() => copyToClipboard(card.accessCode, "Access Code")}
              >
                <Copy className="h-4 w-4 text-blue-600" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Desktop view - show multiple cards
  if (!isMobile && cards.length > 1) {
    const cardsPerView = Math.min(3, cards.length);
    const maxIndex = Math.max(0, cards.length - cardsPerView);

    return (
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            Your Trading IDs
          </h2>
          <p className="text-slate-600">
            Access all your trading credentials in one place
          </p>
        </div>

        <div className="relative group">
          {/* Navigation arrows */}
          {cards.length > cardsPerView && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white border-slate-200 hover:border-blue-300 backdrop-blur-sm shadow-lg rounded-full w-12 h-12"
                onClick={prevSlide}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-5 w-5 text-slate-700" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white border-slate-200 hover:border-blue-300 backdrop-blur-sm shadow-lg rounded-full w-12 h-12"
                onClick={nextSlide}
                disabled={currentIndex >= maxIndex}
              >
                <ChevronRight className="h-5 w-5 text-slate-700" />
              </Button>
            </>
          )}

          {/* Cards container */}
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 to-white p-8">
            <div
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / cardsPerView)
                }%)`,
              }}
            >
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="flex-shrink-0"
                  style={{ width: `${100 / cardsPerView}%` }}
                >
                  <TradingCard card={card} index={index} />
                </div>
              ))}
            </div>
          </div>

          {/* Dots indicator */}
          {cards.length > cardsPerView && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({
                length: Math.ceil(cards.length / cardsPerView),
              }).map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    Math.floor(currentIndex / cardsPerView) === index
                      ? "bg-blue-600 scale-125"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                  onClick={() => setCurrentIndex(index * cardsPerView)}
                />
              ))}
            </div>
          )}
        </div>

        <Toaster />
      </div>
    );
  }

  // Mobile view - single card carousel
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
          Trading IDs
        </h2>
        <p className="text-slate-600 text-sm">
          {cards.length > 1
            ? `${currentIndex + 1} of ${cards.length}`
            : "Your trading credentials"}
        </p>
      </div>

      <div className="relative">
        {/* Navigation arrows */}
        {cards.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white border-slate-200 hover:border-blue-300 backdrop-blur-sm shadow-lg rounded-full w-10 h-10"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4 text-slate-700" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white border-slate-200 hover:border-blue-300 backdrop-blur-sm shadow-lg rounded-full w-10 h-10"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4 text-slate-700" />
            </Button>
          </>
        )}

        {/* Single card container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {cards.map((card, index) => (
              <div key={index} className="flex-shrink-0 w-full">
                <TradingCard card={card} index={index} />
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicator */}
        {cards.length > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {cards.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? "bg-blue-600 scale-125"
                    : "bg-slate-300"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      <Toaster />
    </div>
  );
};

export default GamingCarouselView;
