import { useState } from 'react';
import { Shield, Upload, CheckCircle, XCircle, Clock, FileText, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeTravel } from '../../contexts/SafeTravelContext';
import { supabase } from '../../lib/supabase';

export function VerificationCenter() {
  const { profile } = useAuth();
  const { verifications, addVerification, updateVerification } = useSafeTravel();
  const [uploadType, setUploadType] = useState<'id' | 'address_proof'>('id');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpload = async () => {
    if (!profile || !file) return;
    setIsSubmitting(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${uploadType}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL (though bucket is private, we store the path)
      const { data: { publicUrl } } = supabase.storage
        .from('verification-docs')
        .getPublicUrl(filePath);

      await addVerification({
        local_id: profile.id,
        document_type: uploadType,
        document_url: publicUrl // Store the URL or path
      });

      setFile(null);
      alert('Verification document submitted successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-teal-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-amber-50 text-amber-700 border-amber-100',
      approved: 'bg-teal-50 text-teal-700 border-teal-100',
      rejected: 'bg-red-50 text-red-700 border-red-100',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Verification Center</h1>
        <p className="text-slate-600">
          {profile?.role === 'admin'
            ? 'Review and approve local verification requests to maintain platform safety.'
            : 'Submit official documents to earn your verified local badge.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          {profile?.role === 'local' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900">Get Verified</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Document Type</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  >
                    <option value="id">Government Issued ID</option>
                    <option value="address_proof">Proof of Address</option>
                  </select>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label 
                    htmlFor="file-upload"
                    className={`block border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${
                      file ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                    }`}
                  >
                    <Upload className={`w-8 h-8 mx-auto mb-3 transition-all ${
                      file ? 'text-teal-600' : 'text-slate-300 group-hover:text-teal-500 group-hover:scale-110'
                    }`} />
                    <p className={`text-sm font-semibold mb-1 ${file ? 'text-teal-700' : 'text-slate-600'}`}>
                      {file ? file.name : 'Upload Document'}
                    </p>
                    <p className="text-[10px] text-slate-400">PDF, JPG, or PNG (Max 10MB)</p>
                  </label>
                </div>

                <button 
                  onClick={handleUpload}
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${
                    isSubmitting 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-100'
                  }`}
                >
                  {isSubmitting ? 'Uploading...' : 'Submit for Review'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              Verification Benefits
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">• Special "Verified Local" badge</li>
              <li className="flex items-center gap-2">• Priority in community feed</li>
              <li className="flex items-center gap-2">• Higher trust score baseline</li>
              <li className="flex items-center gap-2">• Access to premium local tools</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              {profile?.role === 'admin' ? 'Pending Requests' : 'Your Submissions'}
            </h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {verifications.length} Total
            </span>
          </div>

          <div className="space-y-4">
            {verifications.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No verification documents found.</p>
              </div>
            ) : (
              verifications.map((v) => (
                <div key={v.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 capitalize">
                          {v.document_type.replace('_', ' ')}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-500 font-medium">
                            ID: {v.id.toUpperCase()}
                          </p>
                          <span className="text-[10px] text-slate-300">•</span>
                          <p className="text-xs text-slate-400 font-medium">
                            {new Date(v.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(v.status)}`}>
                      {getStatusIcon(v.status)}
                      {v.status}
                    </div>
                  </div>

                  {profile?.role === 'admin' && v.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-slate-50">
                      <div className="flex-1 flex items-center gap-2 text-xs text-slate-400 italic">
                        <User className="w-3.5 h-3.5" />
                        Requested by Local #{v.local_id.slice(-4)}
                      </div>
                      <button
                        onClick={() => updateVerification(v.id, 'approved')}
                        className="px-6 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-100"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateVerification(v.id, 'rejected')}
                        className="px-6 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {v.status !== 'pending' && v.reviewed_at && (
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                      <span>Reviewed by Admin</span>
                      <span>{new Date(v.reviewed_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
