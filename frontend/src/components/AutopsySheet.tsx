import { AutopsyResponse } from '../api'
import { Shield, X, Check, AlertCircle, Info } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  autopsy: AutopsyResponse | null
  ticker: string
  action: string
  onClose: () => void
}

export function AutopsySheet({ autopsy, ticker, action, onClose }: Props) {
  if (!autopsy) return null

  const isGood = autopsy.score >= 70

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end md:justify-center p-4 md:p-6 bg-background-light/80 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-surface w-full max-w-lg rounded-[32px] shadow-card border border-gray-100 overflow-hidden relative animate-slide-up">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className={clsx(
              "w-14 h-14 rounded-2xl flex items-center justify-center",
              isGood ? "bg-primary/10 text-primary" : "bg-loss/10 text-loss"
            )}>
               <Shield size={32} />
            </div>
            <div>
               <h3 className="text-2xl font-black text-text-main tracking-tight leading-none mb-1">AI Autopsy</h3>
               <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">
                 {action} {ticker} analyzed
               </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-text-muted hover:text-text-main hover:bg-background-light rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Score Section */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
               <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em]">Execution Score</span>
               <div className="text-[56px] font-black text-text-main leading-none">
                  {autopsy.score}<span className="text-2xl text-text-muted/40 font-bold ml-1">/100</span>
               </div>
            </div>
            <div className={clsx(
              "w-20 h-20 rounded-full border-[6px] flex items-center justify-center text-xl font-black shadow-sm",
              isGood ? "border-primary/20 text-primary bg-primary/5" : "border-loss/20 text-loss bg-loss/5"
            )}>
               {isGood ? 'A+' : 'C-'}
            </div>
          </div>

          <div className="space-y-4">
            {/* Rule Based Flag */}
            <div className={clsx(
              "p-5 rounded-3xl border-2 flex gap-4",
              autopsy.rule_based.severity === 'critical' ? "bg-loss/5 border-loss/10 text-loss" : 
              autopsy.rule_based.severity === 'warning' ? "bg-warning/5 border-warning/10 text-warning" : 
              "bg-accent-blue/5 border-accent-blue/10 text-accent-blue"
            )}>
              <div className="shrink-0">
                {autopsy.rule_based.severity === 'critical' ? <AlertCircle size={24} /> : <Info size={24} />}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-1">{autopsy.rule_based.flag}</p>
                <p className="text-sm font-semibold opacity-80 leading-relaxed">{autopsy.rule_based.lesson}</p>
              </div>
            </div>

            {/* AI Explanation */}
            <div className="p-6 bg-background-light rounded-[28px] border border-gray-100 italic">
               <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-text-main" />
                  <span className="text-[10px] text-text-main font-black uppercase tracking-widest">AI Mentor Insight</span>
               </div>
               <p className="text-sm text-text-main font-medium leading-relaxed opacity-80">
                  "{autopsy.ai_explanation}"
               </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary">
                <Check size={18} />
             </div>
             <div>
                <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest leading-none">Strategic Fix</p>
                <p className="text-sm text-text-main font-bold mt-1">{autopsy.rule_based.fix}</p>
             </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full h-14 bg-text-main text-white font-black rounded-full shadow-lg hover:bg-primary transition-all active:scale-95 text-sm uppercase tracking-[0.2em]"
          >
            Acknowledge Analysis
          </button>
        </div>
      </div>
    </div>
  )
}
