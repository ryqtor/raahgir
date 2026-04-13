import { X, ExternalLink } from 'lucide-react';

interface MapModalProps {
  location: string;
  onClose: () => void;
}

export function MapModal({ location, onClose }: MapModalProps) {
  const encodedLocation = encodeURIComponent(location);
  // Using OpenStreetMap/Leaflet style via iframe for a clean demo look, 
  // or a simple Google Maps embed.
  const mapUrl = `https://www.google.com/maps?q=${encodedLocation}&output=embed`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Live Map View</h3>
            <p className="text-sm text-slate-500 font-medium">{location}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 bg-slate-100 relative">
          <iframe
            title="Location Map"
            width="100%"
            height="100%"
            frameBorder="0"
            src={mapUrl}
            allowFullScreen
          />
        </div>

        <div className="p-4 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            Powered by Rahgir Geospatial Engine
          </p>
          <a 
            href={`https://www.google.com/maps/search/${encodedLocation}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-teal-600 transition-all"
          >
            Open in Google Maps
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
