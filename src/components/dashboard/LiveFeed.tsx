import { useState, useEffect } from 'react';
import { MapPin, MessageCircle, Plus, ShieldCheck, Info, Send, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeTravel } from '../../contexts/SafeTravelContext';
import { aiService, AISuggestion } from '../../lib/aiService';
import { AnswerCard } from './AnswerCard';

export function LiveFeed() {
  const { 
    queries, addQuery,
    answers, addAnswer, fetchAnswers,
    userLocation, verifiedLocals 
  } = useSafeTravel();
  const { profile } = useAuth();
  
  const [showNewQuery, setShowNewQuery] = useState(false);
  const [filterCity, setFilterCity] = useState('');
  const [answeringTo, setAnsweringTo] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  
  const [newQuery, setNewQuery] = useState({
    location: userLocation || '',
    category: 'safety' as any,
    question: '',
    is_anonymous: true,
  });

  const [aiAnalysis] = useState<Record<string, AISuggestion>>({});

  // Fetch answers for queries
  useEffect(() => {
    queries.forEach((q) => {
      if (!answers[q.id]) {
        fetchAnswers(q.id);
      }
    });
  }, [queries]);

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // AI Classification before posting (FR29)
    const analysis = await aiService.analyzeQuery(newQuery.question, newQuery.location);
    
    addQuery({
      traveler_id: profile.id,
      location: newQuery.location,
      category: analysis.category as any,
      question: newQuery.question,
      is_anonymous: newQuery.is_anonymous,
      profiles: { full_name: profile.full_name, role: profile.role } as any
    });

    setShowNewQuery(false);
    setNewQuery({
      location: userLocation || '',
      category: 'safety',
      question: '',
      is_anonymous: true,
    });
  };

  const handleAnswerSubmit = (queryId: string) => {
    if (!profile || !answerText.trim()) return;

    addAnswer({
      query_id: queryId,
      local_id: profile.id,
      answer_text: answerText,
    });

    setAnswerText('');
    setAnsweringTo(null);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      safety: 'bg-red-100 text-red-700',
      price: 'bg-emerald-100 text-emerald-700',
      route: 'bg-blue-100 text-blue-700',
      food: 'bg-orange-100 text-orange-700',
      scam: 'bg-purple-100 text-purple-700'
    };
    return colors[category as keyof typeof colors] || colors.safety;
  };

  const filteredQueries = queries.filter(q => 
    q.location.toLowerCase().includes(filterCity.toLowerCase())
  );

  const cityLocals = verifiedLocals.filter(l => 
    filterCity && l.location?.toLowerCase().includes(filterCity.toLowerCase())
  ).slice(0, 3);

  return (
    <div className="flex gap-8 max-w-6xl mx-auto">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Community Feed</h1>
            <p className="text-slate-500 mt-1">Real-time guidance from locals & AI safety insights</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by city..."
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-teal-500 outline-none w-48"
              />
            </div>
            {profile?.role === 'traveler' && (
              <button
                onClick={() => setShowNewQuery(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-all font-semibold shadow-lg shadow-teal-100"
              >
                <Plus className="w-5 h-5" />
                Ask Question
              </button>
            )}
          </div>
        </div>

        {showNewQuery && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-xl font-bold text-slate-900 mb-4">What's on your mind?</h3>
            <form onSubmit={handleSubmitQuery} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Current Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={newQuery.location}
                      onChange={(e) => setNewQuery({ ...newQuery, location: e.target.value })}
                      placeholder="e.g. Rome, Italy"
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={newQuery.is_anonymous}
                      onChange={(e) => setNewQuery({ ...newQuery, is_anonymous: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Post Anonymously</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Your Question</label>
                <textarea
                  value={newQuery.question}
                  onChange={(e) => setNewQuery({ ...newQuery, question: e.target.value })}
                  placeholder="Ask about safety, routes, prices, or local tips..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-8 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all">
                  Post with AI Analysis
                </button>
                <button type="button" onClick={() => setShowNewQuery(false)} className="px-8 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {filteredQueries.map((query) => {
            const analysis = aiAnalysis[query.id];
            
            return (
              <div key={query.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${getCategoryColor(analysis?.category || query.category)}`}>
                        {analysis?.category || query.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                        <MapPin className="w-4 h-4" />
                        {query.location}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {new Date(query.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-lg text-slate-900 font-medium mb-6 leading-relaxed">
                    {query.question}
                  </p>

                  {/* AI Safety Panel (FR31 & FR30) */}
                  {(query.ai_scam_risk || query.category === 'scam') && (
                    <div className={`mb-6 rounded-2xl p-4 border ${
                      query.ai_scam_risk === 'high' ? 'bg-red-50 border-red-100' : 
                      query.ai_scam_risk === 'medium' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className={`w-5 h-5 ${
                            query.ai_scam_risk === 'high' ? 'text-red-600' : 
                            query.ai_scam_risk === 'medium' ? 'text-amber-600' : 'text-blue-600'
                          }`} />
                          <span className="text-sm font-bold text-slate-900">AI Safety Insights</span>
                        </div>
                        <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-500 border border-slate-100">
                          Scam Risk: <span className={
                            query.ai_scam_risk === 'high' ? 'text-red-600' : 
                            query.ai_scam_risk === 'medium' ? 'text-amber-600' : 'text-teal-600'
                          }>{(query.ai_scam_risk || 'low').toUpperCase()}</span>
                        </div>
                      </div>
                      
                      {query.ai_explanation && (
                        <p className="text-xs font-semibold text-slate-600 mb-3 italic">
                          "{query.ai_explanation}"
                        </p>
                      )}

                      <div className="space-y-2">
                        {(query.ai_safety_tips || []).map((tip: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                            <Info className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                            {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                        {query.is_anonymous ? '?' : query.profiles?.full_name?.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        {query.is_anonymous ? 'Anonymous Traveler' : query.profiles?.full_name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-slate-400 font-medium">
                        {answers[query.id]?.length || 0} local responses
                      </div>
                      {(profile?.role === 'local' || profile?.role === 'admin') && profile.verified && (
                        <button 
                          onClick={() => setAnsweringTo(answeringTo === query.id ? null : query.id)}
                          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold text-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {answeringTo === query.id ? 'Cancel' : 'Respond'}
                        </button>
                      )}
                    </div>
                  </div>

                  {answeringTo === query.id && (
                    <div className="mt-6 pt-6 border-t border-slate-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="relative">
                        <textarea
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="Provide detailed guidance..."
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 resize-none text-sm"
                          rows={2}
                        />
                        <button 
                          onClick={() => handleAnswerSubmit(query.id)}
                          className="absolute right-3 bottom-3 p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {answers[query.id] && answers[query.id].length > 0 && (
                    <div className="mt-6 space-y-4">
                      {answers[query.id].map((ans) => (
                        <AnswerCard 
                          key={ans.id} 
                          answer={ans} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matching & Trust Engine Sidebar (FR15 & FR17) */}
      <aside className="w-80 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            Top Locals in {filterCity || 'Popular Destinations'}
          </h3>
          
          <div className="space-y-4">
            {(cityLocals.length > 0 ? cityLocals : verifiedLocals.slice(0, 3)).map((local) => (
              <div key={local.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                  {local.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate flex items-center gap-1">
                    {local.full_name}
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] text-slate-500 font-semibold">{local.location}</div>
                    <div className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded">★ {local.trust_score}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {!filterCity && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Use the city filter to see high-trust locals in specific areas.
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-6 text-white shadow-lg shadow-teal-100">
          <h4 className="font-bold mb-2">Be a Local Hero</h4>
          <p className="text-xs text-teal-100 mb-4 leading-relaxed">
            Verified locals help thousands of travelers stay safe. Share your knowledge and build your reputation.
          </p>
          <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-bold transition-all">
            Get Verified
          </button>
        </div>
      </aside>
    </div>
  );
}
