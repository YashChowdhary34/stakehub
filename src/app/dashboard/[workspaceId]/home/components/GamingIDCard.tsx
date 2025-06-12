"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import React, { useState } from "react";
import Image from "next/image";
import { BadgeHelp, Copy, Eye, EyeOff } from "lucide-react";
import { Toaster } from "react-hot-toast";

type Props = {
  platformImage?: string;
  platformName: string;
  platformId: string;
  platformPassword: string;
};

const GamingIDCard = ({
  platformImage,
  platformName,
  platformId,
  platformPassword,
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard!`);
    } catch (err) {
      toast.error(`Failed to copy ${type.toLowerCase()}`);
      console.log(err);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <Toaster position="bottom-right" reverseOrder={false} />
      <Card className="w-full h-full bg-card border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex justify-center mb-3">
            {platformImage ? (
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <Image
                  src={platformImage}
                  alt={platformName}
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 768px) 64px, 80px"
                />
              </div>
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground">
                  {platformName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-center text-sm md:text-base">
            Copy your{" "}
            <span className="font-semibold text-foreground">
              {platformName}
            </span>{" "}
            credentials from below
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Platform ID Field */}
          <div className="space-y-2">
            <Label
              htmlFor={`platform-id-${platformName}`}
              className="text-sm font-medium"
            >
              Platform ID
            </Label>
            <div className="relative">
              <Input
                id={`platform-id-${platformName}`}
                type="text"
                value={platformId}
                readOnly
                className="pr-12 bg-muted/50 text-sm"
                placeholder="No ID provided"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                onClick={() => copyToClipboard(platformId, "ID")}
                disabled={!platformId}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Platform Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor={`platform-password-${platformName}`}
              className="text-sm font-medium"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id={`platform-password-${platformName}`}
                type={showPassword ? "text" : "password"}
                value={platformPassword}
                readOnly
                className="pr-20 bg-muted/50 text-sm"
                placeholder="No password provided"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={!platformPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted"
                  onClick={() => copyToClipboard(platformPassword, "Password")}
                  disabled={!platformPassword}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full text-sm hover:bg-muted"
          >
            <BadgeHelp className="h-4 w-4 mr-2" />
            Get Help
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GamingIDCard;
