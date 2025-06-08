"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  userAffiliateLink: string;
};

const CardContentSection = ({ userAffiliateLink }: Props) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(userAffiliateLink);
      setIsCopied(true);
      toast.success("Successfully copied!");
    } catch (error) {
      toast.error("Couldn't copy, try again!");
      console.log(error);
    }
  };
  return (
    <>
      <div className="relative group">
        <div className="flex items-center space-x-2">
          <Input
            value={userAffiliateLink}
            readOnly
            className="bg-zinc-700 border-zinc-700 text-zinc-300 pr-28"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 h-full px-3 text-zinc-400 hover:text-white"
            onClick={copyToClipboard}
          >
            <Copy className="h-4 w-4" />
            <span className="text-xs">{isCopied ? "Copied" : "Copy Link"}</span>
          </Button>
        </div>
      </div>

      <p className="text-sm text-zinc-400">
        Copy this link and share it with people, if they sign-up using they will
        automatically get added as your client.
      </p>
    </>
  );
};

export default CardContentSection;
