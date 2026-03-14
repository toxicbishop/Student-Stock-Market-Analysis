import { AutopsyResponse } from '../api'

interface Props {
  autopsy: AutopsyResponse | null
  ticker: string
  action: string
  onClose: () => void
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#E24B4A',
  warning:  '#F0A500',
  info:     '#7F77DD',
}

export function AutopsySheet({ autopsy, ticker, action, onClose }: Props) {
  if (!autopsy) return null

  const scoreColor =
    autopsy.score >= 75 ? '#1DB87A' :
    autopsy.score >= 50 ? '#F0A500' : '#E24B4A'

  const scoreLabel =
    autopsy.score >= 75 ? 'Good Entry' :
    autopsy.score >= 50 ? 'Fair Entry' : 'Poor Entry'

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        <div className="px-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="label-xs mb-1">Trade Analysis</p>
              <h2 className="text-lg font-semibold">
                {action} {ticker}
              </h2>
            </div>
            {/* Score ring */}
            <div className="relative flex items-center justify-center w-16 h-16">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#1E1E2E" strokeWidth="5" />
                <circle
                  cx="28" cy="28" r="24" fill="none"
                  stroke={scoreColor} strokeWidth="5"
                  strokeDasharray={`${(autopsy.score / 100) * 150.8} 150.8`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-center">
                <p className="text-base font-mono font-semibold leading-none" style={{ color: scoreColor }}>
                  {autopsy.score}
                </p>
                <p className="text-[9px] text-muted leading-none mt-0.5">/ 100</p>
              </div>
            </div>
          </div>

          <p className="text-xs font-medium" style={{ color: scoreColor }}>{scoreLabel}</p>

          {/* Rule-based flag */}
          <div
            className="rounded-xl p-4 border"
            style={{
              borderColor: SEVERITY_COLOR[autopsy.rule_based.severity] + '40',
              background: SEVERITY_COLOR[autopsy.rule_based.severity] + '10',
            }}
          >
            <p className="text-xs font-semibold mb-1"
              style={{ color: SEVERITY_COLOR[autopsy.rule_based.severity] }}>
              {autopsy.rule_based.flag}
            </p>
            <p className="text-sm text-white/80 leading-relaxed">
              {autopsy.rule_based.lesson}
            </p>
          </div>

          {/* AI Mentor */}
          <div className="rounded-xl p-4 border border-brand/30 bg-brand/5">
            <p className="text-xs font-semibold text-brand mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block" />
              AI Mentor
            </p>
            <p className="text-sm text-white/80 leading-relaxed">
              {autopsy.ai_explanation}
            </p>
          </div>

          {/* Fix tip */}
          <div className="rounded-xl p-3 bg-surface border border-border">
            <p className="text-xs text-muted mb-1">What to do next time</p>
            <p className="text-sm text-white/90">{autopsy.rule_based.fix}</p>
          </div>

          <button className="btn-ghost" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </>
  )
}
