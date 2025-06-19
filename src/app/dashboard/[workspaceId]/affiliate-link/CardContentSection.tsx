"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share2, ExternalLink, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
  userAffiliateLink: string;
};

const CardContentSection = ({ userAffiliateLink }: Props) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(userAffiliateLink);
      setIsCopied(true);
      toast.success("Link copied to clipboard!", {
        description: "Ready to share with your network",
        duration: 3000,
      });

      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link", {
        description: "Please try again or copy manually",
        duration: 3000,
      });
      console.error(error);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join with my affiliate link",
          text: "Sign up using my link and get started today!",
          url: userAffiliateLink,
        });
        toast.success("Share dialog opened");
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="space-y-8">
      {/* Link Input Section */}
      <div className="group relative">
        {/* Animated border gradient */}
        <div className="absolute -inset-1 bg-gradient-to-r from-zinc-600/40 via-zinc-400/60 to-zinc-600/40 rounded-xl blur-sm opacity-30 group-hover:opacity-60 transition-all duration-500 animate-pulse"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-zinc-300/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

        <div className="relative flex items-center bg-zinc-950/95 rounded-xl border border-zinc-700/60 backdrop-blur-md shadow-2xl overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-800/10 via-transparent to-zinc-800/10"></div>

          <Input
            value={userAffiliateLink}
            readOnly
            className="relative bg-transparent border-0 text-zinc-100 font-mono text-sm pr-16 py-4 px-6 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-500 selection:bg-zinc-600"
            placeholder="Loading your affiliate link..."
          />

          <div className="absolute right-2 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all duration-300 hover:scale-110 rounded-lg"
              onClick={copyToClipboard}
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isCopied ? "Copied" : "Copy link"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={copyToClipboard}
          className="group relative flex-1 bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 text-zinc-100 border border-zinc-600/50 hover:border-zinc-500/70 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-zinc-800/25 py-6 rounded-xl font-medium overflow-hidden"
          disabled={isCopied}
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          {isCopied ? (
            <>
              <Check className="mr-2 h-5 w-5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span>Copy Link</span>
            </>
          )}
        </Button>

        <Button
          onClick={shareLink}
          variant="outline"
          className="group relative flex-1 border-zinc-600/60 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100 hover:border-zinc-500/70 transition-all duration-300 py-6 rounded-xl font-medium overflow-hidden backdrop-blur-sm"
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          <Share2 className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
          <span>Share</span>
        </Button>
      </div>

      {/* Description */}
      <div className="relative group">
        {/* Decorative line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-zinc-600/60 to-transparent"></div>

        <div className="relative mt-6 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 rounded-2xl p-6 border border-zinc-800/60 backdrop-blur-sm shadow-xl overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          </div>

          {/* Content */}
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="p-2 bg-zinc-800/60 rounded-lg border border-zinc-700/50">
                  <Sparkles className="h-5 w-5 text-zinc-400" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
                  How It Works
                </h3>
                <p className="text-zinc-300 leading-relaxed">
                  Share this link with your network. When someone signs up using
                  your link, they'll be automatically added as your client and
                  you'll start earning commissions.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <p className="text-sm text-zinc-500">
                    Track your referrals and earnings in real-time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardContentSection;
