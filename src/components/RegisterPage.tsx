import { useState } from 'react';
import { Globe, CircleUser as UserCircle, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '../hooks/useNavigate';

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'traveler' | 'local'>('traveler');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName, role);
      navigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <div className="absolute top-8 left-6 flex items-center gap-2">
          <Globe className="w-8 h-8 text-white" />
          <span className="text-2xl font-bold text-white">RAHGIR</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-8 hidden lg:block">
            <h1 className="text-8xl font-bold tracking-tighter leading-none">
              Start Your<br />Journey
            </h1>
            <p className="text-xl text-white/90 max-w-lg">
              Join Rahgir today and become part of a global community of travelers and locals helping each other explore the world safely.
            </p>
          </div>

          <div className="bg-white rounded-none p-12 max-w-md ml-auto w-full">
            <h2 className="text-4xl font-bold text-slate-900 mb-8">Register</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-none text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-slate-300 rounded-none focus:outline-none focus:border-slate-900 text-slate-900"
                  required
                />
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-slate-300 rounded-none focus:outline-none focus:border-slate-900 text-slate-900"
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-slate-300 rounded-none focus:outline-none focus:border-slate-900 text-slate-900"
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-slate-300 rounded-none focus:outline-none focus:border-slate-900 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  I am a:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('traveler')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      role === 'traveler'
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <UserCircle className="w-8 h-8 mx-auto mb-2 text-teal-600" />
                    <div className="font-semibold text-slate-900">Traveler</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('local')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      role === 'local'
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-teal-600" />
                    <div className="font-semibold text-slate-900">Local</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#D1512D] text-white font-bold uppercase tracking-wider hover:bg-[#B8441F] transition-colors disabled:opacity-50 rounded-none"
              >
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('login')}
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>

            <p className="text-xs text-slate-400 mt-8 text-center">
              By creating an account you agree to{' '}
              <span className="text-slate-600">Terms of Service</span> |{' '}
              <span className="text-slate-600">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
