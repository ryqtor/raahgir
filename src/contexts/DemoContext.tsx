import React, { createContext, useContext, useState, useEffect } from 'react';
import { Query, Answer, Profile, Verification } from '../lib/supabase';

interface DemoContextType {
  queries: Query[];
  addQuery: (query: Omit<Query, 'id' | 'created_at' | 'status'>) => void;
  answers: Record<string, Answer[]>;
  userLocation: string | null;
  setUserLocation: (location: string) => void;
  chatMessages: { id: string; sender: string; text: string; time: string }[];
  sendChatMessage: (text: string) => void;
  archiveItems: Query[];
  getLocationSummary: (location: string) => LocationSummary | null;
  addAnswer: (answer: Omit<Answer, 'id' | 'created_at' | 'helpful_count'>) => void;
  rateAnswer: (queryId: string, answerId: string, rating: number) => void;
  verifiedLocals: Profile[];
  verifications: Verification[];
  addVerification: (v: Omit<Verification, 'id' | 'created_at' | 'status' | 'reviewed_by' | 'reviewed_at'>) => void;
  updateVerification: (id: string, status: 'approved' | 'rejected', adminId: string) => void;
}

export interface LocationSummary {
  name: string;
  description: string;
  ratings: {
    safety: number;
    price: number;
    food: number;
    vibe: number;
  };
  mustVisit: string[];
  nearby: string[];
  coordinates: { lat: number; lng: number };
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [userLocation, setUserLocation] = useState<string | null>('Fetching location...');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'Support', text: 'Welcome to Rahgir! How can we help you today?', time: '10:00 AM' }
  ]);
  const [verifiedLocals, setVerifiedLocals] = useState<Profile[]>([
    { id: 'local-1', full_name: 'Amit Sharma', role: 'local', verified: true, trust_score: 95, location: 'Old Delhi, India', created_at: '', updated_at: '' },
    { id: 'local-2', full_name: 'Somchai P.', role: 'local', verified: true, trust_score: 88, location: 'Bangkok, Thailand', created_at: '', updated_at: '' },
    { id: 'local-3', full_name: 'Elena Rossi', role: 'local', verified: true, trust_score: 92, location: 'Paris, France', created_at: '', updated_at: '' },
    { id: 'local-4', full_name: 'John Smith', role: 'local', verified: true, trust_score: 85, location: 'London, UK', created_at: '', updated_at: '' },
    { id: 'local-5', full_name: 'Marco V.', role: 'local', verified: true, trust_score: 96, location: 'Rome, Italy', created_at: '', updated_at: '' },
    { id: 'local-6', full_name: 'Yuki T.', role: 'local', verified: true, trust_score: 94, location: 'Tokyo, Japan', created_at: '', updated_at: '' },
    { id: 'local-7', full_name: 'Carlos R.', role: 'local', verified: true, trust_score: 91, location: 'Barcelona, Spain', created_at: '', updated_at: '' },
    { id: 'local-8', full_name: 'Aisha K.', role: 'local', verified: true, trust_score: 89, location: 'Dubai, UAE', created_at: '', updated_at: '' },
    { id: 'local-9', full_name: 'Ranger Dave', role: 'local', verified: true, trust_score: 98, location: 'Sequoia National Park, USA', created_at: '', updated_at: '' },
    { id: 'local-10', full_name: 'Silva M.', role: 'local', verified: true, trust_score: 93, location: 'Amazon Rainforest, Brazil', created_at: '', updated_at: '' },
    { id: 'local-11', full_name: 'Hans B.', role: 'local', verified: true, trust_score: 90, location: 'Black Forest, Germany', created_at: '', updated_at: '' },
    { id: 'local-12', full_name: 'Karan J.', role: 'local', verified: true, trust_score: 97, location: 'Jim Corbett, India', created_at: '', updated_at: '' }
  ]);
  const [verifications, setVerifications] = useState<Verification[]>([
    {
      id: 'v1',
      local_id: 'demo-local-id',
      document_type: 'id',
      document_url: 'https://example.com/id.jpg',
      status: 'pending',
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  // Pre-populate with demo data
  useEffect(() => {
    const demoQueries: Query[] = [
      {
        id: 'q1',
        traveler_id: 'demo-user-id',
        location: 'Old Delhi, India',
        category: 'safety',
        question: 'Is it safe to visit Chandni Chowk late at night for street food?',
        is_anonymous: false,
        status: 'answered',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        profiles: { full_name: 'Sarah Jenkins', role: 'traveler' } as any
      },
      {
        id: 'q2',
        traveler_id: 'other-user-id',
        location: 'Paris, France',
        category: 'price',
        question: 'What is the average price for a dinner near Montmartre that isn\'t a tourist trap?',
        is_anonymous: true,
        status: 'open',
        created_at: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'q3',
        traveler_id: 'demo-user-id',
        location: 'Bangkok, Thailand',
        category: 'route',
        question: 'Best way to get from Suvarnabhumi Airport to Sukhumvit during rush hour?',
        is_anonymous: false,
        status: 'answered',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        profiles: { full_name: 'Demo Traveler', role: 'traveler' } as any
      }
    ];

    const demoAnswers: Record<string, Answer[]> = {
      'q1': [
        {
          id: 'a1',
          query_id: 'q1',
          local_id: 'local-1',
          answer_text: 'I live nearby! It\'s generally safe as it\'s very crowded, but be careful of pickpockets and stick to the main illuminated streets.',
          helpful_count: 12,
          created_at: new Date(Date.now() - 1800000).toISOString(),
          profiles: { full_name: 'Amit Sharma', role: 'local', verified: true } as any
        }
      ],
      'q3': [
        {
          id: 'a2',
          query_id: 'q3',
          local_id: 'local-2',
          answer_text: 'Definitely take the Airport Rail Link to Phaya Thai and then switch to the BTS Sukhumvit line. Taxis will get stuck in traffic for hours!',
          helpful_count: 24,
          created_at: new Date(Date.now() - 43200000).toISOString(),
          profiles: { full_name: 'Somchai P.', role: 'local', verified: true } as any
        }
      ]
    };

    setQueries(demoQueries);
    setAnswers(demoAnswers);

    // Live Location Fetching
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Simulated global data sync for the demo (FR29)
            console.log("RAHGIR: Initiating Global Safety Sync...");
            console.log("RAHGIR: Checking crime indices for current region...");
            console.log("RAHGIR: Syncing verified local database (5,402 experts online)...");
            
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.village || 'Your Location';
            setUserLocation(`${city}, ${data.address.country}`);
            
            console.log(`RAHGIR: Sync Complete. Connected to ${city} safety protocols.`);
          } catch (e) {
            setUserLocation('Unknown Location');
          }
        },
        () => setUserLocation('Location Access Denied')
      );
    }
  }, []);

  const archiveItems: Query[] = [
    { id: 'arch1', traveler_id: 'user-1', is_anonymous: false, location: 'Paris, France', category: 'safety', question: 'Is it safe to walk in the 18th arrondissement after midnight?', status: 'resolved', created_at: '2024-03-20T10:00:00Z' },
    { id: 'arch2', traveler_id: 'user-2', is_anonymous: true, location: 'Paris, France', category: 'food', question: 'Best authentic croissant near the Eiffel Tower?', status: 'resolved', created_at: '2024-03-21T11:00:00Z' },
    { id: 'arch3', traveler_id: 'user-3', is_anonymous: false, location: 'Tokyo, Japan', category: 'price', question: 'How much should I budget per day for food in Shinjuku?', status: 'resolved', created_at: '2024-03-22T09:00:00Z' },
    { id: 'arch4', traveler_id: 'user-4', is_anonymous: true, location: 'Tokyo, Japan', category: 'safety', question: 'Is it okay for a solo female traveler to stay in Roppongi?', status: 'resolved', created_at: '2024-03-23T15:00:00Z' },
    { id: 'arch5', traveler_id: 'user-5', is_anonymous: false, location: 'Bali, Indonesia', category: 'route', question: 'Scooter or private driver for getting around Ubud?', status: 'resolved', created_at: '2024-03-24T08:00:00Z' },
    { id: 'arch6', traveler_id: 'user-6', is_anonymous: true, location: 'Bali, Indonesia', category: 'food', question: 'Where to find the best Babi Guling in Seminyak?', status: 'resolved', created_at: '2024-03-25T10:00:00Z' },
    { id: 'arch7', traveler_id: 'user-7', is_anonymous: false, location: 'New York, USA', category: 'safety', question: 'Is the subway safe at 2 AM on a weekday?', status: 'resolved', created_at: '2024-03-26T12:00:00Z' },
    { id: 'arch8', traveler_id: 'user-8', is_anonymous: true, location: 'New York, USA', category: 'price', question: 'Tips for saving money on Broadway shows?', status: 'resolved', created_at: '2024-03-27T14:30:00Z' },
    { id: 'arch9', traveler_id: 'user-9', is_anonymous: false, location: 'London, UK', category: 'route', question: 'Is the Oyster card better than using contactless for a 3-day trip?', status: 'resolved', created_at: '2024-03-28T09:15:00Z' },
    { id: 'arch10', traveler_id: 'user-10', is_anonymous: true, location: 'London, UK', category: 'food', question: 'Best Sunday Roast in Camden Town?', status: 'resolved', created_at: '2024-03-29T13:00:00Z' },
    { id: 'arch11', traveler_id: 'user-11', is_anonymous: false, location: 'Rome, Italy', category: 'safety', question: 'How to avoid the fake gladiators near the Colosseum?', status: 'resolved', created_at: '2024-03-30T10:00:00Z' },
    { id: 'arch12', traveler_id: 'user-12', is_anonymous: false, location: 'Barcelona, Spain', category: 'safety', question: 'Best way to keep valuables safe on Las Ramblas?', status: 'resolved', created_at: '2024-03-31T11:00:00Z' },
    { id: 'arch13', traveler_id: 'user-13', is_anonymous: false, location: 'Jim Corbett, India', category: 'safety', question: 'What to do if a wild elephant blocks our safari path?', status: 'resolved', created_at: '2024-04-01T06:00:00Z' },
    { id: 'arch14', traveler_id: 'user-14', is_anonymous: false, location: 'Amazon Rainforest, Brazil', category: 'food', question: 'Is it safe to eat the local river fish while on a jungle trek?', status: 'resolved', created_at: '2024-04-02T12:00:00Z' },
    { id: 'arch15', traveler_id: 'user-15', is_anonymous: false, location: 'Sequoia National Park, USA', category: 'route', question: 'Are the trails to the hidden Silverthread Waterfall clearly marked?', status: 'resolved', created_at: '2024-04-03T09:00:00Z' },
    { id: 'arch16', traveler_id: 'user-16', is_anonymous: false, location: 'Monteverde, Costa Rica', category: 'safety', question: 'Is it safe to walk through the cloud forest at night without a guide?', status: 'resolved', created_at: '2024-04-04T20:00:00Z' },
    { id: 'arch17', traveler_id: 'user-17', is_anonymous: false, location: 'Black Forest, Germany', category: 'food', question: 'Where can I find the most authentic Black Forest Cake in Triberg?', status: 'resolved', created_at: '2024-04-05T14:00:00Z' },
    { id: 'arch18', traveler_id: 'user-18', is_anonymous: false, location: 'Mumbai, India', category: 'route', question: 'Is the local train journey from South Mumbai to Borivali safe for tourists?', status: 'resolved', created_at: '2024-04-06T18:00:00Z' },
    { id: 'arch19', traveler_id: 'user-19', is_anonymous: false, location: 'Singapore', category: 'price', question: 'Are there any cheap hawker centers near Marina Bay Sands?', status: 'resolved', created_at: '2024-04-07T12:30:00Z' },
    { id: 'arch20', traveler_id: 'user-20', is_anonymous: false, location: 'Istanbul, Turkey', category: 'safety', question: 'How do I handle the shoe-shiners who drop their brush in front of me?', status: 'resolved', created_at: '2024-04-07T15:00:00Z' }
  ];

  const locationSummaries: Record<string, LocationSummary> = {
    'Paris, France': {
      name: 'Paris',
      description: 'The City of Light, known for its art, fashion, and gastronomy. Watch out for the friendship bracelet scam near Montmartre.',
      ratings: { safety: 3, price: 2, food: 5, vibe: 5 },
      mustVisit: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Sacré-Cœur'],
      nearby: ['Versailles', 'Disneyland Paris'],
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    'Tokyo, Japan': {
      name: 'Tokyo',
      description: 'A mix of ultramodern and traditional. Very safe, but be cautious of overcharging in Roppongi bars.',
      ratings: { safety: 5, price: 3, food: 5, vibe: 5 },
      mustVisit: ['Shibuya Crossing', 'Senso-ji Temple', 'Tokyo Skytree', 'Tsukiji Market'],
      nearby: ['Mount Fuji', 'Yokohama'],
      coordinates: { lat: 35.6762, lng: 139.6503 }
    },
    'Bali, Indonesia': {
      name: 'Bali',
      description: 'Tropical paradise. Be careful with money changers in Kuta and stick to Blue Bird taxis.',
      ratings: { safety: 4, price: 5, food: 4, vibe: 5 },
      mustVisit: ['Uluwatu Temple', 'Ubud Monkey Forest', 'Tegallalang Rice Terrace'],
      nearby: ['Nusa Penida', 'Gili Islands'],
      coordinates: { lat: -8.3405, lng: 115.0920 }
    },
    'New York, USA': {
      name: 'New York City',
      description: 'The concrete jungle. Stay alert in Times Square for CD scammers and use the subway for best transport.',
      ratings: { safety: 3, price: 1, food: 5, vibe: 5 },
      mustVisit: ['Statue of Liberty', 'Central Park', 'Empire State Building', 'High Line'],
      nearby: ['Jersey City', 'Philadelphia'],
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    'London, UK': {
      name: 'London',
      description: 'Historical and diverse. Watch out for pickpockets in the West End and fake police scams.',
      ratings: { safety: 4, price: 2, food: 4, vibe: 5 },
      mustVisit: ['London Eye', 'Tower of London', 'British Museum', 'Westminster Abbey'],
      nearby: ['Oxford', 'Cambridge'],
      coordinates: { lat: 51.5074, lng: -0.1278 }
    },
    'Rome, Italy': {
      name: 'Rome',
      description: 'The Eternal City. Watch out for fake gladiators and overpriced menus near tourist hotspots.',
      ratings: { safety: 3, price: 3, food: 5, vibe: 5 },
      mustVisit: ['Colosseum', 'Vatican Museums', 'Pantheon', 'Trevi Fountain'],
      nearby: ['Tivoli', 'Ostia Antica'],
      coordinates: { lat: 41.8902, lng: 12.4922 }
    },
    'Barcelona, Spain': {
      name: 'Barcelona',
      description: 'Gaudis playground. Very high risk of pickpockets on Las Ramblas and Metro L3.',
      ratings: { safety: 2, price: 3, food: 5, vibe: 5 },
      mustVisit: ['Sagrada Familia', 'Park Guell', 'Casa Batllo', 'La Rambla'],
      nearby: ['Montserrat', 'Sitges'],
      coordinates: { lat: 41.3851, lng: 2.1734 }
    },
    'Jim Corbett, India': {
      name: 'Jim Corbett National Park',
      description: 'Indias premier tiger reserve. Follow the Dhikala trail at 5am for best wildlife sightings. **Expert Tip**: Hidden waterfall located 3km past the Khinanauli rest house - follow the stream upstream.',
      ratings: { safety: 3, price: 4, food: 3, vibe: 5 },
      mustVisit: ['Dhikala Zone', 'Bijrani Zone', 'Corbett Waterfall', 'Garjia Temple'],
      nearby: ['Nainital', 'Bhutan'],
      coordinates: { lat: 29.5300, lng: 78.7747 }
    },
    'Amazon Rainforest, Brazil': {
      name: 'Amazon Rainforest',
      description: 'The worlds largest rainforest. Only use guides with official ICMBio permits. **Hidden Gem**: A rare pink dolphin sighting spot is located at the confluence of Rio Negro and Solimões near dusk.',
      ratings: { safety: 2, price: 3, food: 3, vibe: 5 },
      mustVisit: ['Manaus', 'Meeting of Waters', 'Anavilhanas Archipelago'],
      nearby: ['Belém', 'Macapa'],
      coordinates: { lat: -3.4653, lng: -62.2159 }
    },
    'Sequoia National Park, USA': {
      name: 'Sequoia National Park',
      description: 'Land of giants. Home to the General Sherman tree. **Trail Alert**: For the secret Crystal Stream, take the unpaved path marked "Danger" near Moro Rock – it leads to a secluded quartz-bottomed pool.',
      ratings: { safety: 4, price: 3, food: 2, vibe: 5 },
      mustVisit: ['General Sherman', 'Moro Rock', 'Giant Forest', 'Crystal Cave'],
      nearby: ['Kings Canyon', 'Yosemite'],
      coordinates: { lat: 36.4864, lng: -118.5658 }
    },
    'Black Forest, Germany': {
      name: 'Black Forest',
      description: 'A fairytale woodland. Famous for cuckoo clocks and cherries. **Local Trick**: Take the Wutach Gorge trail – at the middle point, there is a hollow tree that local hikers use to leave "forest notes" for each other.',
      ratings: { safety: 5, price: 3, food: 4, vibe: 5 },
      mustVisit: ['Triberg Waterfalls', 'Titisee Lake', 'Freiburg', 'Baden-Baden'],
      nearby: ['Strasbourg', 'Zurich'],
      coordinates: { lat: 48.0664, lng: 8.2233 }
    },
    'Monteverde, Costa Rica': {
      name: 'Monteverde Cloud Forest',
      description: 'High altitude biodiversity hotspot. **Wildlife Secret**: To see the Resplendent Quetzal, head to the "Continental Divide" bridge at exactly 6:15 AM before the mist lifts.',
      ratings: { safety: 4, price: 4, food: 3, vibe: 5 },
      mustVisit: ['Cloud Forest Reserve', 'Sky Walk', 'Selvatura Park', 'Orchid Garden'],
      nearby: ['Arenal Volcano', 'Santa Elena'],
      coordinates: { lat: 10.3121, lng: -84.8155 }
    },
    'Mumbai, India': {
      name: 'Mumbai',
      description: 'The Maximum City. Dynamic and overwhelming. Stick to official prepaid taxis at the airport.',
      ratings: { safety: 4, price: 5, food: 5, vibe: 5 },
      mustVisit: ['Gateway of India', 'Marine Drive', 'Elephanta Caves', 'Dhobi Ghat'],
      nearby: ['Lonavala', 'Alibaug'],
      coordinates: { lat: 19.0760, lng: 72.8777 }
    }
  };

  const getLocationSummary = (location: string) => {
    const key = Object.keys(locationSummaries).find(k => 
      location.toLowerCase().includes(k.split(',')[0].toLowerCase())
    );
    return key ? locationSummaries[key] : null;
  };

  const addQuery = (newQueryData: Omit<Query, 'id' | 'created_at' | 'status'>) => {
    const q: Query = {
      ...newQueryData,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      status: 'open'
    };
    setQueries(prev => [q, ...prev]);
  };

  const sendChatMessage = (text: string) => {
    const userMsg = { 
      id: Date.now().toString(), 
      sender: 'You', 
      text, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setChatMessages(prev => [...prev, userMsg]);

    // Simple automated response
    setTimeout(() => {
      const resp = { 
        id: (Date.now() + 1).toString(), 
        sender: 'Local Expert', 
        text: 'Thanks for your message! A verified local in that area will be notified soon to help you.', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setChatMessages(prev => [...prev, resp]);
    }, 1500);
  };

  const addAnswer = (newAnswerData: Omit<Answer, 'id' | 'created_at' | 'helpful_count'>) => {
    const a: Answer = {
      ...newAnswerData,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      helpful_count: 0
    };
    setAnswers(prev => ({
      ...prev,
      [newAnswerData.query_id]: [...(prev[newAnswerData.query_id] || []), a]
    }));
  };

  const rateAnswer = (queryId: string, answerId: string, rating: number) => {
    setAnswers(prev => ({
      ...prev,
      [queryId]: prev[queryId].map(a => a.id === answerId ? { ...a, rating } : a)
    }));

    // Dynamically update trust score for the demo
    const answer = answers[queryId]?.find(a => a.id === answerId);
    if (answer) {
      setVerifiedLocals(prev => prev.map(l => 
        l.id === answer.local_id 
          ? { ...l, trust_score: Math.min(100, l.trust_score + (rating >= 4 ? 2 : -1)) }
          : l
      ));
    }
  };

  return (
    <DemoContext.Provider value={{ 
      queries, 
      addQuery, 
      answers, 
      userLocation, 
      setUserLocation, 
      chatMessages, 
      sendChatMessage,
      archiveItems,
      getLocationSummary,
      addAnswer,
      rateAnswer,
      verifiedLocals,
      verifications,
      addVerification: (v) => {
        const newV: Verification = {
          ...v,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending',
          reviewed_by: null,
          reviewed_at: null,
          created_at: new Date().toISOString()
        };
        setVerifications(prev => [newV, ...prev]);
      },
      updateVerification: (id, status, adminId) => {
        setVerifications(prev => prev.map(v => 
          v.id === id ? { ...v, status, reviewed_by: adminId, reviewed_at: new Date().toISOString() } : v
        ));
      }
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
