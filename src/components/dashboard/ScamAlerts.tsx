import { useState } from 'react';
import { ShieldAlert, MapPin, AlertTriangle, Search, PlusCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeTravel } from '../../contexts/SafeTravelContext';

export function ScamAlerts() {
  const { scamReports, addScamReport, userLocation, updateScamReport } = useSafeTravel();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [newReport, setNewReport] = useState({ location: userLocation || '', description: '' });

  const filteredReports = scamReports.filter(r => 
    r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReportScam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    await addScamReport({
      reporter_id: profile.id,
      location: newReport.location,
      description: newReport.description,
    });

    setShowReportForm(false);
    setNewReport({ location: userLocation || '', description: '' });
  };

  const handleApprove = (id: string) => {
    updateScamReport(id, 'verified');
  };

  const handleDismiss = (id: string) => {
    updateScamReport(id, 'dismissed');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-600" />
            Scam Alerts
          </h1>
          <p className="text-slate-600 mt-1">Verified travel hazards and scam reports from fellow travelers</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by city or scam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 w-64 text-sm"
            />
          </div>
          <button
            onClick={() => setShowReportForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm font-semibold shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Report Scam
          </button>
        </div>
      </div>

      {showReportForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Report a Scam</h3>
              <button onClick={() => setShowReportForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleReportScam} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={newReport.location}
                    onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g. Rome, Italy"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Describe the scam in detail..."
                />
              </div>
              <div className="bg-red-50 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-800 leading-relaxed">
                  Your report will be reviewed by our moderation team. False reporting may lead to account suspension.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold shadow-md shadow-red-200"
                >
                  Submit Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className={`bg-white rounded-2xl border-l-4 p-6 shadow-sm hover:shadow-md transition-all group ${
              report.status === 'verified' ? 'border-red-500' : 'border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700">{report.location}</span>
              </div>
              {report.status === 'verified' ? (
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                  <ShieldAlert className="w-3 h-3" />
                  Verified
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  <AlertTriangle className="w-3 h-3" />
                  Pending
                </div>
              )}
            </div>

            <p className="text-slate-800 text-sm leading-relaxed mb-4 line-clamp-3">
              {report.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-xs text-slate-400">
              <span>{new Date(report.created_at).toLocaleDateString()}</span>
              {profile?.role === 'admin' && (
                <div className="flex gap-2">
                  {report.status !== 'verified' && (
                    <button 
                      onClick={() => handleApprove(report.id)}
                      className="text-teal-600 hover:underline font-bold"
                    >
                      Approve
                    </button>
                  )}
                  <button 
                    onClick={() => handleDismiss(report.id)}
                    className="text-red-500 hover:underline font-bold"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400">
            <ShieldAlert className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-lg">No scam reports found for your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
