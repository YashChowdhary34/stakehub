"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowLeft, Check, BanknoteArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addDepositToPlatform } from "@/actions/transactions";

interface DepositFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId?: string;
}

const DepositFormModal: React.FC<DepositFormModalProps> = ({
  isOpen,
  onClose,
  chatId,
}) => {
  // Dropdown menu options
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

  const [platformName, setPlatformName] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [verifyAmount, setVerifyAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasSubmissionError, setHasSubmissionError] = useState(false);
  const [errors, setErrors] = useState({
    platformName: "",
    platformId: "",
    depositAmount: "",
    verifyAmount: "",
  });
  const [displayMessageOnSubmit, setDisplayMessageOnSubmit] =
    useState("Try Again!");

  console.log(displayMessageOnSubmit);

  // Reset form when opened/closed
  useEffect(() => {
    if (isOpen) {
      setPlatformName("");
      setPlatformId("");
      setDepositAmount("");
      setVerifyAmount("");
      setErrors({
        platformName: "",
        platformId: "",
        depositAmount: "",
        verifyAmount: "",
      });
      setShowSuccess(false);
      setIsSubmitting(false);
      setHasSubmissionError(false);
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

  const validateForm = () => {
    const newErrors = {
      platformName: "",
      platformId: "",
      depositAmount: "",
      verifyAmount: "",
    };
    let isValid = true;

    // Validate platform name
    if (!platformName.trim()) {
      newErrors.platformName = "Please select a platform";
      isValid = false;
    }

    // Validate platform ID
    if (!platformId.trim()) {
      newErrors.platformId = "Platform ID is required";
      isValid = false;
    } else if (platformId.trim().length < 3) {
      newErrors.platformId = "Platform ID must be at least 3 characters";
      isValid = false;
    }

    // Validate deposit amount
    const depositNum = parseFloat(depositAmount);
    if (!depositAmount.trim()) {
      newErrors.depositAmount = "Deposit amount is required";
      isValid = false;
    } else if (isNaN(depositNum) || depositNum <= 0) {
      newErrors.depositAmount = "Please enter a valid amount greater than 0";
      isValid = false;
    } else if (depositNum > 1000000) {
      newErrors.depositAmount = "Amount cannot exceed ₹1,000,000";
      isValid = false;
    }

    // Validate verify amount
    const verifyNum = parseFloat(verifyAmount);
    if (!verifyAmount.trim()) {
      newErrors.verifyAmount = "Please verify the deposit amount";
      isValid = false;
    } else if (isNaN(verifyNum)) {
      newErrors.verifyAmount = "Please enter a valid amount";
      isValid = false;
    } else if (depositNum !== verifyNum) {
      newErrors.verifyAmount = "Amounts do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setHasSubmissionError(false);
    try {
      if (!chatId) return;
      const addDeposit = await addDepositToPlatform(
        platformName,
        platformId,
        Number(depositAmount),
        chatId
      );

      const displayMessage = addDeposit.message || "";
      setDisplayMessageOnSubmit(displayMessage);
      if (addDeposit && addDeposit.status === 200) {
        setShowSuccess(true);
      } else {
        setHasSubmissionError(true);
      }
      setIsSubmitting(false);
    } catch (error) {
      const displayMessage = String(error);
      setDisplayMessageOnSubmit(displayMessage);
      setHasSubmissionError(true);
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

  const formatCurrency = (value: string) => {
    // Remove any non-digit characters except decimal point
    const cleaned = value.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }

    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + "." + parts[1].slice(0, 2);
    }

    return cleaned;
  };

  const handleDepositAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const formatted = formatCurrency(e.target.value);
    setDepositAmount(formatted);

    // Clear errors when user starts typing
    if (errors.depositAmount) {
      setErrors((prev) => ({ ...prev, depositAmount: "" }));
    }
    // Clear submission error when user modifies input
    if (hasSubmissionError) {
      setHasSubmissionError(false);
    }
  };

  const handleVerifyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setVerifyAmount(formatted);

    // Clear errors when user starts typing
    if (errors.verifyAmount) {
      setErrors((prev) => ({ ...prev, verifyAmount: "" }));
    }
    // Clear submission error when user modifies input
    if (hasSubmissionError) {
      setHasSubmissionError(false);
    }
  };

  const handlePlatformIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlatformId(e.target.value);

    // Clear errors when user starts typing
    if (errors.platformId) {
      setErrors((prev) => ({ ...prev, platformId: "" }));
    }
    // Clear submission error when user modifies input
    if (hasSubmissionError) {
      setHasSubmissionError(false);
    }
  };

  const handlePlatformNameChange = (value: string) => {
    setPlatformName(value);

    // Clear errors when user selects
    if (errors.platformName) {
      setErrors((prev) => ({ ...prev, platformName: "" }));
    }
    // Clear submission error when user modifies input
    if (hasSubmissionError) {
      setHasSubmissionError(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md mx-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
        {showSuccess ? (
          // Success State
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border-2 border-green-500/20">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">
              {displayMessageOnSubmit}
            </h3>
            <p className="text-zinc-400 mb-2">
              ₹{parseFloat(depositAmount).toLocaleString()} has been processed
              successfully.
            </p>
            <p className="text-zinc-500 text-sm mb-6">
              Platform: {platformName} (ID: {platformId})
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
          // Form State
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                  <BanknoteArrowDown className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">
                    Process Deposit
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Add funds to user account
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
              {/* Platform Name Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">
                  Platform Name
                </label>
                <Select
                  value={platformName}
                  onValueChange={handlePlatformNameChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full bg-zinc-800 border rounded-lg text-zinc-100 focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                      errors.platformName
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500/50"
                        : "border-zinc-700"
                    )}
                  >
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {options.map((option) => (
                      <SelectItem
                        key={option}
                        value={option}
                        className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100"
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.platformName && (
                  <p className="text-xs text-red-400">{errors.platformName}</p>
                )}
              </div>

              {/* Platform ID Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">
                  Platform ID
                </label>
                <input
                  type="text"
                  value={platformId}
                  onChange={handlePlatformIdChange}
                  placeholder="Enter platform ID"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full px-4 py-3 bg-zinc-800 border rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                    errors.platformId
                      ? "border-red-500 focus:ring-red-500/20 focus:border-red-500/50"
                      : "border-zinc-700"
                  )}
                />
                {errors.platformId && (
                  <p className="text-xs text-red-400">{errors.platformId}</p>
                )}
              </div>

              {/* Deposit Amount Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">
                  Deposit Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={depositAmount}
                    onChange={handleDepositAmountChange}
                    placeholder="0.00"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full pl-8 pr-4 py-3 bg-zinc-800 border rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                      errors.depositAmount
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500/50"
                        : "border-zinc-700"
                    )}
                  />
                </div>
                {errors.depositAmount && (
                  <p className="text-xs text-red-400">{errors.depositAmount}</p>
                )}
              </div>

              {/* Verify Deposit Amount Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">
                  Verify Deposit Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={verifyAmount}
                    onChange={handleVerifyAmountChange}
                    placeholder="0.00"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full pl-8 pr-4 py-3 bg-zinc-800 border rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                      errors.verifyAmount
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500/50"
                        : "border-zinc-700"
                    )}
                  />
                </div>
                {errors.verifyAmount && (
                  <p className="text-xs text-red-400">{errors.verifyAmount}</p>
                )}
              </div>

              {/* Amount Match Indicator or Error Message */}
              {depositAmount && verifyAmount && (
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      hasSubmissionError
                        ? "bg-red-500"
                        : parseFloat(depositAmount) ===
                            parseFloat(verifyAmount) &&
                          !isNaN(parseFloat(depositAmount)) &&
                          !isNaN(parseFloat(verifyAmount))
                        ? "bg-green-500"
                        : "bg-red-500"
                    )}
                  />
                  <span className="text-xs text-zinc-400">
                    {hasSubmissionError
                      ? displayMessageOnSubmit
                      : parseFloat(depositAmount) ===
                          parseFloat(verifyAmount) &&
                        !isNaN(parseFloat(depositAmount)) &&
                        !isNaN(parseFloat(verifyAmount))
                      ? "Amounts match"
                      : "Amounts do not match"}
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !platformName.trim() ||
                  !platformId.trim() ||
                  !depositAmount.trim() ||
                  !verifyAmount.trim() ||
                  parseFloat(depositAmount) !== parseFloat(verifyAmount) ||
                  isNaN(parseFloat(depositAmount)) ||
                  isNaN(parseFloat(verifyAmount)) ||
                  parseFloat(depositAmount) <= 0
                }
                className={cn(
                  "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "enabled:bg-green-600 enabled:hover:bg-green-700 enabled:text-white enabled:shadow-lg enabled:hover:shadow-xl enabled:active:scale-[0.98]",
                  "disabled:bg-zinc-800 disabled:text-zinc-500 disabled:border disabled:border-zinc-700"
                )}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <BanknoteArrowDown className="h-4 w-4" />
                    <span>Process Deposit</span>
                  </>
                )}
              </button>

              {/* Helper Text */}
              <p className="text-xs text-zinc-500 text-center">
                All fields are required and Both amounts must match to proceed.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default DepositFormModal;
