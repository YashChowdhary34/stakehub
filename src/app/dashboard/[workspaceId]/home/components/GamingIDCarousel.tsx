"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GamingIDCard from "./GamingIDCard";

type Platform = {
  id: string | null;
  platformName: string | null;
  platformId: string | null;
  platformPassword: string | null;
};

type Props = {
  platforms: Platform[];
};

const GamingIDCarousel = ({ platforms }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
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

  // Auto-scroll functionality for mobile
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % platforms.length);
  }, [platforms.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + platforms.length) % platforms.length);
  }, [platforms.length]);

  // Auto-play effect for mobile
  useEffect(() => {
    if (!isMobile || !isAutoPlaying || platforms.length <= 1) return;

    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [isMobile, isAutoPlaying, nextSlide, platforms.length]);

  // Pause auto-play on hover/touch
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  if (platforms.length === 0) return null;

  // Desktop view - show multiple cards in a row with horizontal scroll
  if (!isMobile) {
    return (
      <div className="w-full">
        <div className="relative group">
          {/* Navigation arrows for desktop */}
          {platforms.length > 3 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 backdrop-blur-sm"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 backdrop-blur-sm"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Cards container for desktop */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out gap-4 md:gap-6"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / Math.min(platforms.length, 3))
                }%)`,
              }}
            >
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4"
                >
                  <GamingIDCard
                    platformImage={`/platforms/${platform.platformName}.png`}
                    platformName={platform.platformName || "Platform"}
                    platformId={platform.platformId || ""}
                    platformPassword={platform.platformPassword || ""}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots indicator for desktop when cards exceed viewport */}
        {platforms.length > 3 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: Math.ceil(platforms.length / 3) }).map(
              (_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    Math.floor(currentIndex / 3) === index
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                  onClick={() => setCurrentIndex(index * 3)}
                />
              )
            )}
          </div>
        )}
      </div>
    );
  }

  // Mobile view - single card with auto-scroll
  return (
    <div
      className="w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
    >
      <div className="relative">
        {/* Navigation arrows for mobile */}
        {platforms.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Single card container for mobile */}
        <div className="overflow-hidden px-4">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="flex-shrink-0 w-full flex justify-center"
              >
                <GamingIDCard
                  platformImage={`/platforms/${platform.platformName}.png`}
                  platformName={platform.platformName || "Platform"}
                  platformId={platform.platformId || ""}
                  platformPassword={platform.platformPassword || ""}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicator for mobile */}
        {platforms.length > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {platforms.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  currentIndex === index
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}

        {/* Auto-play indicator for mobile */}
        {platforms.length > 1 && (
          <div className="flex justify-center mt-2">
            <span className="text-xs text-muted-foreground">
              {isAutoPlaying ? "Auto-scrolling every 3s" : "Auto-scroll paused"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamingIDCarousel;
