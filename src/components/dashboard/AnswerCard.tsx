import { useState } from 'react';
import { Star, ShieldCheck, ThumbsUp } from 'lucide-react';
import { Answer } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeTravel } from '../../contexts/SafeTravelContext';

interface AnswerCardProps {
  answer: Answer & { rating?: number };
}

export function AnswerCard({ answer }: AnswerCardProps) {
  const { profile } = useAuth();
  const { rateAnswer, markAnswerHelpful } = useSafeTravel();
  const [hoverRating, setHoverRating] = useState(0);

  const canRate = profile?.role === 'traveler' && profile.id !== answer.local_id;

  return (
    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
            {answer.profiles?.full_name?.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{answer.profiles?.full_name}</span>
              {answer.profiles?.verified && (
                <div className="flex items-center gap-1 text-[9px] text-teal-600 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  VERIFIED LOCAL
                </div>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {new Date(answer.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                disabled={!canRate}
                onMouseEnter={() => canRate && setHoverRating(star)}
                onMouseLeave={() => canRate && setHoverRating(0)}
                onClick={() => rateAnswer(answer.id, star)}
                className={`transition-all ${canRate ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    star <= (hoverRating || answer.rating || 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>
          {answer.rating && (
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tighter">
              Neighbor Rated: {answer.rating}/5
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed mb-4">
        {answer.answer_text}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
        <button 
          onClick={() => markAnswerHelpful(answer.id)}
          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-teal-600 transition-colors"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          Helpful ({answer.helpful_count || 0})
        </button>
        {canRate && !answer.rating && (
          <span className="text-[10px] text-slate-400 italic">Rate this guidance</span>
        )}
      </div>
    </div>
  );
}
