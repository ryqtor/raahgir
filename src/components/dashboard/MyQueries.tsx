import { useState } from 'react';
import { MapPin, MessageCircle, CheckCircle, Clock } from 'lucide-react';
import { Answer } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeTravel } from '../../contexts/SafeTravelContext';

export function MyQueries() {
  const { queries: allQueries, answers: allAnswers, fetchAnswers } = useSafeTravel();
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const { profile } = useAuth();

  const myQueries = allQueries.filter(q => q.traveler_id === profile?.id);

  const handleQueryClick = (queryId: string) => {
    setSelectedQuery(queryId === selectedQuery ? null : queryId);
    if (queryId !== selectedQuery && !allAnswers[queryId]) {
      fetchAnswers(queryId);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-700',
      answered: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700',
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      safety: 'bg-red-100 text-red-700',
      price: 'bg-green-100 text-green-700',
      route: 'bg-blue-100 text-blue-700',
      food: 'bg-orange-100 text-orange-700',
    };
    return colors[category as keyof typeof colors] || colors.safety;
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Queries</h1>
        <p className="text-slate-600">Track your questions and responses</p>
      </div>

      <div className="space-y-4">
        {myQueries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">You haven't asked any questions yet</p>
          </div>
        ) : (
          myQueries.map((query) => (
            <div key={query.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleQueryClick(query.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(query.category)}`}>
                      {query.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
                      {query.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {new Date(query.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                  <MapPin className="w-4 h-4" />
                  {query.location}
                </div>

                <p className="text-slate-800 mb-4">{query.question}</p>

                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {allAnswers[query.id]?.length || 0} answers
                  </span>
                </div>
              </div>

              {selectedQuery === query.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <h4 className="font-semibold text-slate-900 mb-4">Answers</h4>
                  {!allAnswers[query.id] || allAnswers[query.id].length === 0 ? (
                    <p className="text-slate-500 text-sm">No answers yet</p>
                  ) : (
                    <div className="space-y-4">
                      {allAnswers[query.id].map((answer: Answer) => (
                        <div key={answer.id} className="bg-white rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-teal-600">
                                  {answer.profiles?.full_name?.[0] || 'L'}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900">
                                  {answer.profiles?.full_name || 'Local Expert'}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {answer.profiles?.verified && (
                                    <span className="flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3 text-green-500" />
                                      Verified Local
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-slate-400">
                              {new Date(answer.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-slate-700 text-sm">{answer.answer_text}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <button className="text-xs text-teal-600 hover:text-teal-700">
                              Helpful ({answer.helpful_count})
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
