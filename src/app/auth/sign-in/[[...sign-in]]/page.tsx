import React from "react";
import { SignIn } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-inter">
      <div className="w-full max-w-md">
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-zinc-400 to-zinc-600 rounded-xl flex items-center justify-center mb-4">
              <Image src={"/logo.png"} alt="Logo" height={50} width={50} />
            </div>
            <CardTitle className="text-2xl font-semibold text-zinc-100">
              Welcome back to StakeHub
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none border-0 p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 transition-colors font-medium",
                  socialButtonsBlockButtonText: "text-zinc-200 font-medium",
                  dividerLine: "bg-zinc-700",
                  dividerText: "text-zinc-400",
                  formFieldLabel: "text-zinc-300 font-medium",
                  formFieldInput:
                    "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-zinc-500",
                  formButtonPrimary:
                    "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold transition-colors",
                  footerActionLink: "text-zinc-400 hover:text-zinc-300",
                  footerActionText: "text-zinc-400",
                  identityPreviewText: "text-zinc-300",
                  identityPreviewEditButton:
                    "text-zinc-400 hover:text-zinc-300",
                  formResendCodeLink: "text-zinc-400 hover:text-zinc-300",
                  otpCodeFieldInput:
                    "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-zinc-500",
                  alertText: "text-zinc-300",
                  formFieldErrorText: "text-red-400",
                  identityPreview: "bg-zinc-800 border-zinc-700",
                  alternativeMethods: "bg-zinc-800 border-zinc-700",
                  alternativeMethodsBlockButton:
                    "text-zinc-300 hover:text-zinc-200 border-zinc-700 hover:bg-zinc-800",
                },
                layout: {
                  socialButtonsPlacement: "top",
                  showOptionalFields: true,
                },
              }}
              redirectUrl="/dashboard"
            />
          </CardContent>
        </Card>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Don&apos;t have an account?{" "}
          <a
            href="/sign-up"
            className="text-zinc-400 hover:text-zinc-300 font-medium transition-colors"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
