"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowLeft, Check, BanknoteArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface WithdrawFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (amount: number) => Promise<void> | void;
  chatId?: string;
}

const WithdrawForm: React.FC<WithdrawFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [depositAmount, setDepositAmount] = useState("");
  const [verifyAmount, setVerifyAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({
    depositAmount: "",
    verifyAmount: "",
  });

  // Reset form when opened/closed
  useEffect(() => {
    if (isOpen) {
      setDepositAmount("");
      setVerifyAmount("");
      setErrors({ depositAmount: "", verifyAmount: "" });
      setShowSuccess(false);
      setIsSubmitting(false);
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
    const newErrors = { depositAmount: "", verifyAmount: "" };
    let isValid = true;

    // Validate deposit amount
    const depositNum = parseFloat(depositAmount);
    if (!depositAmount.trim()) {
      newErrors.depositAmount = "Deposit amount is required";
      isValid = false;
    } else if (isNaN(depositNum) || depositNum <= 0) {
      newErrors.depositAmount = "Please enter a valid amount greater than 0";
      isValid = false;
    } else if (depositNum > 1000000) {
      newErrors.depositAmount = "Amount cannot exceed $1,000,000";
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

    try {
      // Call the onSubmit prop if provided
      if (onSubmit) {
        await onSubmit(parseFloat(depositAmount));
      }

      // Show success state
      setShowSuccess(true);

      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error processing deposit:", error);
      setIsSubmitting(false);
      // You can add error handling here
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
  };

  const handleVerifyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setVerifyAmount(formatted);

    // Clear errors when user starts typing
    if (errors.verifyAmount) {
      setErrors((prev) => ({ ...prev, verifyAmount: "" }));
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
              Deposit Successful!
            </h3>
            <p className="text-zinc-400 mb-6">
              ${parseFloat(depositAmount).toLocaleString()} has been processed
              successfully.
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

              {/* Amount Match Indicator */}
              {depositAmount && verifyAmount && (
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      parseFloat(depositAmount) === parseFloat(verifyAmount) &&
                        !isNaN(parseFloat(depositAmount)) &&
                        !isNaN(parseFloat(verifyAmount))
                        ? "bg-green-500"
                        : "bg-red-500"
                    )}
                  />
                  <span className="text-xs text-zinc-400">
                    {parseFloat(depositAmount) === parseFloat(verifyAmount) &&
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
                    <span>Update Deposit</span>
                  </>
                )}
              </button>

              {/* Helper Text */}
              <p className="text-xs text-zinc-500 text-center">
                Both amounts must match to proceed with the deposit
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default WithdrawForm;
