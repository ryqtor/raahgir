import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, Query, Answer, Profile, Verification, ScamReport, Rating } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface SafeTravelContextType {
  queries: Query[];
  answers: Record<string, Answer[]>;
  scamReports: ScamReport[];
  verifications: Verification[];
  verifiedLocals: Profile[];
  userLocation: string | null;
  loading: boolean;
  
  // Queries
  addQuery: (query: Omit<Query, 'id' | 'created_at' | 'status'>) => Promise<void>;
  fetchQueries: (location?: string) => Promise<void>;
  
  // Answers
  addAnswer: (answer: Omit<Answer, 'id' | 'created_at' | 'helpful_count'>) => Promise<void>;
  fetchAnswers: (queryId: string) => Promise<void>;
  markAnswerHelpful: (answerId: string) => Promise<void>;
  
  // Ratings & Trust
  rateAnswer: (answerId: string, rating: number, feedback?: string) => Promise<void>;
  
  // Scam Reports
  addScamReport: (report: Omit<ScamReport, 'id' | 'created_at' | 'status'>) => Promise<void>;
  fetchScamReports: (location?: string) => Promise<void>;
  
  // Verifications (Admin & Local)
  addVerification: (v: Omit<Verification, 'id' | 'created_at' | 'status' | 'reviewed_by' | 'reviewed_at'>) => Promise<void>;
  fetchVerifications: () => Promise<void>;
  updateVerification: (id: string, status: 'approved' | 'rejected') => Promise<void>;
}

const SafeTravelContext = createContext<SafeTravelContextType | undefined>(undefined);

export function SafeTravelProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [queries, setQueries] = useState<Query[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [scamReports, setScamReports] = useState<ScamReport[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [verifiedLocals, setVerifiedLocals] = useState<Profile[]>([]);
  const [userLocation, setUserLocation] = useState<string | null>('Fetching location...');
  const [loading, setLoading] = useState(false);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchQueries();
      fetchScamReports();
      fetchVerifiedLocals();
      fetchUserLocation();
      if (profile?.role === 'admin') {
        fetchVerifications();
      }
    }
  }, [user, profile]);

  const fetchUserLocation = async () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || 'Your Location';
          setUserLocation(`${city}, ${data.address.country}`);
        } catch (e) {
          setUserLocation('Unknown Location');
        }
      }, () => setUserLocation('Location Access Denied'));
    }
  };

  const fetchVerifiedLocals = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'local')
      .eq('verified', true)
      .order('trust_score', { ascending: false });

    if (error) console.error('Error fetching verified locals:', error);
    else setVerifiedLocals(data || []);
  };

  const fetchQueries = async (location?: string) => {
    let query = supabase
      .from('queries')
      .select('*, profiles(*) ')
      .order('created_at', { ascending: false });

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const { data, error } = await query;
    if (error) console.error('Error fetching queries:', error);
    else setQueries(data || []);
  };

  const addQuery = async (newQueryData: Omit<Query, 'id' | 'created_at' | 'status'>) => {
    const { data, error } = await supabase
      .from('queries')
      .insert([newQueryData])
      .select()
      .single();

    if (error) throw error;
    setQueries(prev => [data, ...prev]);
  };

  const fetchAnswers = async (queryId: string) => {
    const { data, error } = await supabase
      .from('answers')
      .select('*, profiles(*) ')
      .eq('query_id', queryId)
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching answers:', error);
    else {
      setAnswers(prev => ({ ...prev, [queryId]: data || [] }));
    }
  };

  const addAnswer = async (newAnswerData: Omit<Answer, 'id' | 'created_at' | 'helpful_count'>) => {
    const { data, error } = await supabase
      .from('answers')
      .insert([newAnswerData])
      .select()
      .single();

    if (error) throw error;
    
    // Refresh answers for this query
    fetchAnswers(newAnswerData.query_id);
  };

  const markAnswerHelpful = async (answerId: string) => {
    const { data, error } = await supabase.rpc('increment_helpful_count', { answer_id: answerId });
    if (error) {
      // Fallback if RPC isn't defined yet
      const { data: currentAnswer } = await supabase.from('answers').select('helpful_count, query_id').eq('id', answerId).single();
      if (currentAnswer) {
        await supabase.from('answers').update({ helpful_count: (currentAnswer.helpful_count || 0) + 1 }).eq('id', answerId);
        fetchAnswers(currentAnswer.query_id);
      }
    } else {
      // If RPC worked, find the query_id to refresh
      const { data: q } = await supabase.from('answers').select('query_id').eq('id', answerId).single();
      if (q) fetchAnswers(q.query_id);
    }
  };

  const rateAnswer = async (answerId: string, ratingValue: number, feedback?: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('ratings')
      .upsert([{
        answer_id: answerId,
        traveler_id: user.id,
        rating: ratingValue,
        feedback: feedback
      }]);

    if (error) throw error;
    
    // Note: Trust score is updated via DB trigger
  };

  const fetchScamReports = async (location?: string) => {
    let query = supabase
      .from('scam_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const { data, error } = await query;
    if (error) console.error('Error fetching scam reports:', error);
    else setScamReports(data || []);
  };

  const addScamReport = async (report: Omit<ScamReport, 'id' | 'created_at' | 'status'>) => {
    const { data, error } = await supabase
      .from('scam_reports')
      .insert([report])
      .select()
      .single();

    if (error) throw error;
    setScamReports(prev => [data, ...prev]);
  };

  const fetchVerifications = async () => {
    const { data, error } = await supabase
      .from('verifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching verifications:', error);
    else setVerifications(data || []);
  };

  const addVerification = async (v: Omit<Verification, 'id' | 'created_at' | 'status' | 'reviewed_by' | 'reviewed_at'>) => {
    const { data, error } = await supabase
      .from('verifications')
      .insert([v])
      .select()
      .single();

    if (error) throw error;
    setVerifications(prev => [data, ...prev]);
  };

  const updateVerification = async (id: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    
    const { error } = await supabase
      .from('verifications')
      .update({ 
        status, 
        reviewed_by: user.id, 
        reviewed_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) throw error;
    
    // Update profile verified status if approved
    if (status === 'approved') {
      const v = verifications.find(v => v.id === id);
      if (v) {
        await supabase
          .from('profiles')
          .update({ verified: true })
          .eq('id', v.local_id);
      }
    }
    
    fetchVerifications();
  };

  return (
    <SafeTravelContext.Provider value={{ 
      queries, 
      answers, 
      scamReports, 
      verifications, 
      verifiedLocals,
      userLocation,
      loading,
      addQuery,
      fetchQueries,
      addAnswer,
      fetchAnswers,
      markAnswerHelpful,
      rateAnswer,
      addScamReport,
      fetchScamReports,
      addVerification,
      fetchVerifications,
      updateVerification
    }}>
      {children}
    </SafeTravelContext.Provider>
  );
}

export function useSafeTravel() {
  const context = useContext(SafeTravelContext);
  if (context === undefined) {
    throw new Error('useSafeTravel must be used within a SafeTravelProvider');
  }
  return context;
}
