import clsx from 'clsx'

interface Props { rsi: number | null }

export function RSIGauge({ rsi }: Props) {
  if (rsi === null) return null

  const pct   = Math.min(100, Math.max(0, rsi))
  const colorClass = 
    rsi > 70 ? 'text-loss' : 
    rsi < 30 ? 'text-primary' : 
    'text-accent-blue'

  const label = 
    rsi > 70 ? 'Overbought' : 
    rsi < 30 ? 'Oversold' : 
    'Neutral'

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-0.5">
           <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest leading-none">Market Momentum</span>
           <span className="text-sm font-black text-text-main flex items-center gap-2">
             <span className={clsx("w-2 h-2 rounded-full", rsi > 70 ? 'bg-loss' : rsi < 30 ? 'bg-primary' : 'bg-accent-blue')} />
             {label}
           </span>
        </div>
        <div className={clsx("text-2xl font-black font-mono leading-none", colorClass)}>
          {rsi.toFixed(1)}
        </div>
      </div>
      
      <div className="relative h-2 bg-background-light rounded-full overflow-hidden border border-gray-100 shadow-inner">
        {/* Track */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent-blue/30 to-loss/30"
          style={{ clipPath: 'inset(0 0 0 0 round 9999px)' }}
        />
        {/* Scrubber */}
        <div
          className="absolute top-0 bottom-0 w-1.5 bg-text-main rounded-full shadow-lg ring-2 ring-white transition-all duration-700 ease-spring"
          style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
        />
      </div>

      <div className="flex justify-between text-[10px] font-black text-text-muted/40 tracking-tighter uppercase px-0.5">
        <span>0</span>
        <span>30</span>
        <span className="text-text-muted/10">|</span>
        <span>70</span>
        <span>100</span>
      </div>
    </div>
  )
}
