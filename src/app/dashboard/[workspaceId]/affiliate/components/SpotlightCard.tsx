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
    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-r from-zinc-800 to-zinc-600 text-white p-6 flex flex-col justify-between border border-zinc-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-80">Current Balance</p>
          <p className="text-2xl font-bold mt-1">
            ₹{balance.toLocaleString()}.00
          </p>
        </div>
        <div className="text-right">
          {type === "Vip" && (
            <div className="text-xl font-bold italic text-emerald-400">VIP</div>
          )}
        </div>
      </div>
      <div className="mt-auto">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm opacity-80">{holder}</p>
        </div>
        <p className="text-sm opacity-80 font-mono">{affiliateCode}</p>
      </div>
    </div>
  );
}
