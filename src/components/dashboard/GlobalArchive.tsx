import { useState } from 'react';
import { Search, MapPin, Star, Info, Navigation, ArrowRight } from 'lucide-react';
import { useDemo } from '../../contexts/DemoContext';

export function GlobalArchive() {
  const { archiveItems, getLocationSummary } = useDemo();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'safety', label: 'Safety' },
    { id: 'price', label: 'Price' },
    { id: 'route', label: 'Route' },
    { id: 'food', label: 'Food' },
  ];

  const filteredQueries = archiveItems.filter(
    (query) => {
      const matchesSearch = query.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          query.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || query.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }
  );

  const summary = selectedLocation ? getLocationSummary(selectedLocation) : null;

  const getCategoryColor = (category: string) => {
    const colors = {
      safety: 'bg-red-50 text-red-600 border-red-100',
      price: 'bg-green-50 text-green-600 border-green-100',
      route: 'bg-blue-50 text-blue-600 border-blue-100',
      food: 'bg-orange-50 text-orange-600 border-orange-100',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-50 text-gray-600 border-gray-100';
  };

  const renderRating = (val: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className={`w-3 h-3 ${s <= val ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex gap-8 overflow-hidden">
      {/* Search & Feed Section */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Global Archive</h1>
          <p className="text-slate-600">Explore travel wisdom from across the globe</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm flex-shrink-0">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search destinations (e.g. Paris, Tokyo, Bali)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-700"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-100'
                    : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {filteredQueries.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No results found for your search</p>
            </div>
          ) : (
            filteredQueries.map((query) => (
              <div
                key={query.id}
                onClick={() => setSelectedLocation(query.location)}
                className={`group bg-white rounded-2xl border p-5 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-0.5 ${
                  selectedLocation === query.location ? 'border-teal-500 ring-1 ring-teal-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold border ${getCategoryColor(query.category)}`}>
                      {query.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-teal-500" />
                      {query.location}
                    </div>
                  </div>
                  <Star className="w-4 h-4 text-slate-200 group-hover:text-yellow-400 transition-colors" />
                </div>

                <p className="text-slate-800 font-semibold mb-3 leading-relaxed group-hover:text-teal-700 transition-colors">
                  {query.question}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {query.id[0]}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Expert Verified</span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium">
                    {new Date(query.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Location Summary Sidebar */}
      <div className="w-[400px] flex flex-col flex-shrink-0 animate-in slide-in-from-right duration-500">
        {summary ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col h-full ring-1 ring-black/5">
            <div className="relative h-48 bg-teal-800 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
               <img 
                 src={`https://source.unsplash.com/featured/?${summary.name},landmark`} 
                 className="absolute inset-0 w-full h-full object-cover transform scale-110 hover:scale-125 transition-transform duration-1000"
                 alt={summary.name}
               />
               <div className="relative z-20 text-center p-6">
                 <h2 className="text-3xl font-black text-white mb-1 uppercase tracking-tighter">{summary.name}</h2>
                 <p className="text-teal-200 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                   <Navigation className="w-3 h-3" />
                   Location Overview
                 </p>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  {summary.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(summary.ratings).map(([key, val]) => (
                  <div key={key} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <div className="text-[10px] uppercase font-black text-slate-400 mb-1">{key}</div>
                    {renderRating(val)}
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  Must Visit Landmarks
                </h4>
                <div className="space-y-2">
                  {summary.mustVisit.map((item) => (
                    <div key={item} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-teal-100 group transition-all">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xs">
                        {item[0]}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{item}</span>
                      <ArrowRight className="w-4 h-4 ml-auto text-gray-200 group-hover:text-teal-400 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  Explore Nearby
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summary.nearby.map((place) => (
                    <span key={place} className="px-3 py-1.5 bg-gray-50 text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-wider hover:bg-teal-50 hover:text-teal-700 cursor-pointer transition-colors shadow-sm">
                      {place}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-teal-600 transition-all shadow-xl shadow-black/10 active:scale-[0.98]">
                Start Planning Journey
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-300 text-center">
            <MapPin className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-black text-slate-400 uppercase tracking-tighter mb-2">Select a Location</h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Click on a card or search for a destination to reveal insights, ratings, and expert travel plans.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
