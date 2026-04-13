import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '../hooks/useNavigate';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await signInAsDemo();
      navigate('dashboard');
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-fixed p-6"
      style={{ 
        backgroundImage: 'url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920)',
        backgroundColor: '#1a1a2e' // Fallback
      }}
    >
      {/* Background Overlay for Cinematic Mood */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[400px] bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-10 shadow-2xl animate-float">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1">
            Rahgir
          </h1>
          <p className="text-white/60 text-sm font-medium">
            Begin your journey.
          </p>
        </div>

        {error && (
          <div className="mb-6 text-center text-red-300 text-sm font-medium bg-red-900/40 py-2 rounded-lg border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-1">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs text-white/80">
            <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <input 
                type="checkbox" 
                className="w-3.5 h-3.5 rounded-sm border-white/30 bg-white/10 checked:bg-white text-slate-900 focus:ring-0" 
              />
              Remember me
            </label>
            <button type="button" className="hover:text-white transition-colors font-medium">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white text-[#222] font-bold rounded-[4px] shadow-lg hover:shadow-white/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="text-white/70 hover:text-white text-sm font-medium transition-colors mb-6 block w-full bg-white/5 py-2.5 rounded-[4px] border border-white/10 hover:bg-white/10"
          >
            Try Demo Mode
          </button>

          <p className="text-sm text-white/50">
            New traveler?{' '}
            <button
              onClick={() => navigate('register')}
              className="text-white font-bold underline hover:text-white/80 transition-colors shadow-sm"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
