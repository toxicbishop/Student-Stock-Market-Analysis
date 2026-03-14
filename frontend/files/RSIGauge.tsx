interface Props { rsi: number | null }

export function RSIGauge({ rsi }: Props) {
  if (rsi === null) return null

  const pct   = Math.min(100, Math.max(0, rsi))
  const color = rsi > 70 ? '#E24B4A' : rsi > 50 ? '#F0A500' : '#1DB87A'
  const label = rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="label-xs">RSI</span>
        <span className="font-mono text-sm font-medium" style={{ color }}>
          {rsi.toFixed(1)} — {label}
        </span>
      </div>
      <div className="relative h-1.5 rounded-full overflow-hidden bg-border">
        {/* gradient track */}
        <div className="absolute inset-0 rounded-full"
          style={{ background: 'linear-gradient(90deg, #1DB87A 0%, #F0A500 55%, #E24B4A 100%)' }} />
        {/* white needle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-full bg-white shadow-lg"
          style={{ left: `${pct}%`, transform: 'translateX(-50%) translateY(-50%)' }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-[10px] text-muted font-mono">0</span>
        <span className="text-[10px] text-muted font-mono">30</span>
        <span className="text-[10px] text-muted font-mono">70</span>
        <span className="text-[10px] text-muted font-mono">100</span>
      </div>
    </div>
  )
}
