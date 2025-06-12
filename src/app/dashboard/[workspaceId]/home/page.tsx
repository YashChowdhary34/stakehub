import React from "react";
import GamingIDCarousel from "./components/GamingIDCarousel";
import { getPlatform } from "@/actions/user";
import CenteredErrorMessage from "@/components/global/bad-request/centeredErrorMessage";

const Page = async () => {
  const platforms = await getPlatform();
  if (!platforms || platforms.status !== 200) {
    return (
      <CenteredErrorMessage message="Couldn't get your platform, try again after some time." />
    );
  }

  return (
    <main className="fixed top-16 md:top-0 left-0 w-full h-screen md:ml-64 md:w-[calc(100%-16rem)] bg-background overflow-y-auto">
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        {/* Gaming ID Cards Section */}
        <div className="w-full">
          {platforms.platforms?.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No platforms available
            </div>
          ) : (
            <GamingIDCarousel platforms={platforms.platforms || []} />
          )}
        </div>

        {/* Instructions Section */}
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              How to Use Your Gaming IDs
            </h2>
            <p className="text-muted-foreground">
              Follow these simple steps to access your gaming accounts
            </p>
          </div>

          <div className="grid gap-4 md:gap-6">
            <div className="bg-card border rounded-lg p-4 md:p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Copy Your Credentials
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Click the copy button next to your ID or password to copy
                    them to your clipboard. The password is hidden by default
                    for security.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4 md:p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Login to Your Platform
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Navigate to your gaming platform&apos;s login page and paste
                    your credentials. Make sure to keep your login details
                    secure and don&apos;t share them with others.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4 md:p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Start Gaming
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Once logged in, you can start enjoying your games. Remember
                    to log out when you&apos;re done, especially on shared
                    devices.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4 md:p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                  !
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Security Tips
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Never share your gaming credentials with anyone. If you
                    suspect your account has been compromised, contact support
                    immediately using the &quot;Get Help&quot; button on your
                    gaming cards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
