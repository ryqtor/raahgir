import { useNavigate } from '../hooks/useNavigate';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-zinc-950 text-white min-h-screen w-full font-sans overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center">
        <div className="text-3xl font-bold tracking-tighter italic">
          RAAHGIR<span className="text-orange-500">.</span>
        </div>
        
        <div className="flex gap-6 items-center">
          <a href="#explore" className="hover:text-orange-400 transition-colors text-sm font-medium">EXPLORE</a>
          <button 
            onClick={() => navigate('login')} 
            className="glass px-6 py-2 rounded-full text-sm font-medium hover:bg-orange-500 transition-all duration-300"
          >
            LOGIN
          </button>
        </div>
      </nav>

      <main className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2021" 
            className="w-full h-full object-cover scale-110 animate-[zoom_20s_infinite_alternate]" 
            alt="Travel background" 
          />
          <div className="absolute inset-0 hero-gradient"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
            Travel like a <span className="text-orange-500 underline decoration-2 underline-offset-8">Local</span>.
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop being a tourist. Raahgir connects you with local experts to unlock hidden gems, 
            authentic flavors, and stories you won't find in a guidebook.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('login')}
              className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105"
            >
              Start Your Journey
            </button>
            <button className="glass px-8 py-4 rounded-full font-bold hover:border-orange-500 transition-all">
              Watch Story
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <div className="w-[1px] h-12 bg-white mx-auto"></div>
        </div>
      </main>
    </div>
  );
}
