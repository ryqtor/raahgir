import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, Query, Answer, Profile, Verification, ScamReport, Notification } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { aiService } from '../lib/aiService';

interface SafeTravelContextType {
  queries: Query[];
  answers: Record<string, Answer[]>;
  scamReports: ScamReport[];
  verifications: Verification[];
  verifiedLocals: Profile[];
  notifications: Notification[];
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
  updateScamReport: (id: string, status: 'verified' | 'dismissed') => Promise<void>;
  
  // Verifications (Admin & Local)
  addVerification: (v: Omit<Verification, 'id' | 'created_at' | 'status' | 'reviewed_by' | 'reviewed_at'>) => Promise<void>;
  fetchVerifications: () => Promise<void>;
  updateVerification: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  
  // Notifications
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

const SafeTravelContext = createContext<SafeTravelContextType | undefined>(undefined);

export function SafeTravelProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [queries, setQueries] = useState<Query[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [scamReports, setScamReports] = useState<ScamReport[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [verifiedLocals, setVerifiedLocals] = useState<Profile[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userLocation, setUserLocation] = useState<string | null>('Fetching location...');
  const [loading, setLoading] = useState(false);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchQueries();
      fetchScamReports();
      fetchVerifiedLocals();
      fetchUserLocation();
      fetchNotifications();

      // Real-time notifications
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev]);
          }
        )
        .subscribe();

      if (profile?.role === 'admin') {
        fetchVerifications();
      }

      return () => {
        supabase.removeChannel(channel);
      };
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

  const fetchNotifications = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching notifications:', error);
    else setNotifications(data || []);
  };

  const markNotificationRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) console.error('Error marking notification read:', error);
    else {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const addQuery = async (newQueryData: Omit<Query, 'id' | 'created_at' | 'status'>) => {
    setLoading(true);
    try {
      // Run real AI analysis
      const analysis = await aiService.analyzeQuery(newQueryData.question, newQueryData.location);
      
      const queryToInsert = {
        ...newQueryData,
        category: analysis.category,
        ai_scam_risk: analysis.scamRisk,
        ai_safety_tips: analysis.safetyTips,
        ai_explanation: analysis.explanation,
        ai_confidence: analysis.confidence
      };

      const { data, error } = await supabase
        .from('queries')
        .insert([queryToInsert])
        .select()
        .single();

      if (error) throw error;
      setQueries((prev: Query[]) => [data, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async (queryId: string) => {
    const { data, error } = await supabase
      .from('answers')
      .select('*, profiles(*) ')
      .eq('query_id', queryId)
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching answers:', error);
    else {
      setAnswers((prev: Record<string, Answer[]>) => ({ ...prev, [queryId]: data || [] }));
    }
  };

  const addAnswer = async (newAnswerData: Omit<Answer, 'id' | 'created_at' | 'helpful_count'>) => {
    const { error } = await supabase
      .from('answers')
      .insert([newAnswerData])
      .select()
      .single();

    if (error) throw error;
    
    // Refresh answers for this query
    fetchAnswers(newAnswerData.query_id);
  };

  const markAnswerHelpful = async (answerId: string) => {
    const { error } = await supabase.rpc('increment_helpful_count', { answer_id: answerId });
    if (error) {
      console.error('Error marking answer helpful:', error);
      throw error;
    }
    
    // The RPC trigger handles the notification now.
    // We just need to refresh the answers list to show the new count.
    const { data: q } = await supabase.from('answers').select('query_id').eq('id', answerId).single();
    if (q) fetchAnswers(q.query_id);
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
    setScamReports((prev: ScamReport[]) => [data, ...prev]);
  };

  const updateScamReport = async (id: string, status: 'verified' | 'dismissed') => {
    const { error } = await supabase
      .from('scam_reports')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    fetchScamReports();
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
    setVerifications((prev: Verification[]) => [data, ...prev]);
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
      const v = verifications.find((v: Verification) => v.id === id);
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
      updateScamReport,
      addVerification,
      fetchVerifications,
      updateVerification,
      notifications,
      fetchNotifications,
      markNotificationRead
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
