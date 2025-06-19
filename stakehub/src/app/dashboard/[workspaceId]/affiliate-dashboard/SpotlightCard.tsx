interface SpotlightCardProps {
  balance: number;
  holder: string;
  affiliateCode: string;
  type: string;
}

export function SpotlightCard({
  balance,
  holder,
  affiliateCode,
  type,
}: SpotlightCardProps) {
  return (
    <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-600 text-white p-6 flex flex-col justify-between border border-zinc-600/50 shadow-2xl group hover:shadow-emerald-500/20 transition-all duration-500">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent animate-pulse" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-emerald-500/10 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-radial from-zinc-400/10 to-transparent rounded-full blur-xl" />
      </div>

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-300 tracking-wide">
            Current Balance
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
              ₹{balance.toLocaleString()}
            </p>
            <span className="text-lg font-medium text-zinc-300">.00</span>
          </div>
        </div>

        <div className="text-right">
          {type === "Vip" && (
            <div className="relative">
              <div className="text-xl font-black italic bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
                VIP
              </div>
              <div className="absolute inset-0 text-xl font-black italic text-emerald-400/20 blur-sm">
                VIP
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-auto space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors duration-300">
            {holder}
          </p>
          <div className="w-8 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm font-mono text-zinc-400 tracking-wider group-hover:text-zinc-300 transition-colors duration-300">
            {affiliateCode}
          </p>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
            <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse delay-100" />
            <div className="w-1 h-1 bg-emerald-300 rounded-full animate-pulse delay-200" />
          </div>
        </div>
      </div>

      {/* Subtle border animation */}
      <div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/50 via-transparent to-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -m-px"
        style={{
          background:
            "linear-gradient(45deg, transparent, rgba(16, 185, 129, 0.1), transparent)",
        }}
      />

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-tr-2xl" />
    </div>
  );
}
