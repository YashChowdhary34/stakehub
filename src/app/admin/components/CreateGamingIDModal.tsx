"use client";

import {
  ArrowLeft,
  Check,
  UserRoundPlus,
  X,
  IdCardLanyard,
  CircleX,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserGamingId } from "@/actions/user";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  chatId?: string;
};

const CreateGamingIDModal = ({ isOpen, onClose, chatId }: Props) => {
  const [platformName, setPlatformName] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [platformPassword, setPlatformPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(""); // dropdown menu
  const [displayMessageOnSubmit, setDisplayMessageOnSubmit] =
    useState("Try Again!");

  //dropdown menu options
  const options = [
    "laser247",
    "99exch",
    "11xplay",
    "play247",
    "lcplay247",
    "skyexch",
    "tigerexch",
    "dimondexch",
  ];

  // Reset form when opened/closed
  useEffect(() => {
    if (isOpen) {
      setPlatformName("");
      setPlatformId("");
      setPlatformPassword("");
      setShowSuccess(false);
      setIsSubmitting(false);
      setSelectedPlatform("");
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      if (!chatId) return;
      const createId = await createUserGamingId(
        chatId,
        platformName,
        platformId,
        platformPassword
      );

      const displayMessage = createId?.message || "";
      setDisplayMessageOnSubmit(displayMessage);
      if (createId && createId.status === 200) {
        setShowSuccess(true);
      }
      setIsSubmitting(false);
    } catch (error) {
      const displayMessage = String(error);
      setDisplayMessageOnSubmit(displayMessage);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !showSuccess) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/*Backdrop*/}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/*Modal Content*/}
      <div className="relative w-full max-w-md mx-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border-2 border-green-500/20">
              {displayMessageOnSubmit === "Platform created successfully" ? (
                <Check className="h-10 w-10 text-green-500" />
              ) : (
                <CircleX className="h-10 w-10 text-red-500" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">
              Account created Successfully!
            </h3>
            <p className="text-zinc-400 mb-6">
              User account created at ${platformName}.
            </p>
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors text-zinc-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-white/20">
                  <IdCardLanyard className="h-5 w-5 text-white-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">
                    Create Gaming ID
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Add gaming ID to user account
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* choose platform */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">
                  Choose Platform
                </label>
                <Select
                  value={selectedPlatform}
                  onValueChange={(value) => {
                    setSelectedPlatform(value);
                    setPlatformName(value);
                  }}
                >
                  <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700 focus:ring-2 focus:ring-zinc-600 focus:border-transparent">
                    <SelectValue placeholder="Select gaming platform" />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-zinc-800 border-zinc-700 z-[150] max-h-60 overflow-auto"
                    position="popper"
                    sideOffset={4}
                    align="start"
                    avoidCollisions={true}
                  >
                    {options.map((option) => (
                      <SelectItem
                        key={option}
                        value={option}
                        className="text-zinc-100 hover:bg-zinc-700 focus:bg-zinc-700 cursor-pointer capitalize"
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Platform ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">
                  Platform ID
                </label>
                <input
                  type="text"
                  value={platformId}
                  onChange={(e) => setPlatformId(e.target.value)}
                  placeholder="Enter platform ID"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
                />
              </div>

              {/* Platform Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">
                  Platform Password
                </label>
                <input
                  type="password"
                  value={platformPassword}
                  onChange={(e) => setPlatformPassword(e.target.value)}
                  placeholder="Enter platform password"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={
                    !selectedPlatform ||
                    !platformId ||
                    !platformPassword ||
                    isSubmitting
                  }
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserRoundPlus className="h-4 w-4" />
                      <span>Create Gaming ID</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateGamingIDModal;
