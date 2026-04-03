import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ShieldCheck, 
  Search, 
  FileText, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Eye,
  Loader2,
  AlertCircle,
  Clock,
  Filter,
  CheckCircle2,
  X,
  MessageSquare,
  Zap,
  Save,
  FileCheck,
  RefreshCw
} from 'lucide-react';

const DocumentVerification = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [remarks, setRemarks] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await api.get('/auth/documents/pending');
      setRequests(res.data);
    } catch (error) {
      console.error('Error fetching pending documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (status) => {
    if (!selectedRequest) return;
    if (status === 'rejected' && !remarks) {
      alert('Verification: Rejection requires comments.');
      return;
    }

    setVerifying(true);
    try {
      await api.post('/auth/documents/verify', {
        studentId: selectedRequest.studentId,
        documentId: selectedRequest.document._id,
        status,
        comments: remarks
      });
      
      setSelectedRequest(null);
      setRemarks('');
      setVerifying(false);
      setSelectedRequest(null);
      setRemarks('');
      setVerifying(false);
      fetchRequests();
    } catch (error) {
      alert('Failed to update verification status. Please try again.');
      setVerifying(false);
    }
  };

  const filteredRequests = requests.filter(req => 
    req.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.collegeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.document.requirement?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#1C1917] flex flex-col items-center justify-center font-sans tracking-widest">
      <div className="w-16 h-16 border-4 border-[#9A3412]/20 border-t-[#9A3412] rounded-full animate-spin mb-6" />
      <p className="text-[#D6D3D1] text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Loading Documents...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#9A3412] text-[10px] font-black uppercase tracking-[0.4em] mb-3">
                <ShieldCheck size={14} />
                Student Documents
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">Document Verification</h1>
              <p className="text-stone-600 text-[10px] font-black uppercase tracking-widest mt-4">Review and approve student documents</p>
            </div>
          </div>
          
          <div className="flex gap-4">
             <button 
              onClick={fetchRequests}
              className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-2xl flex items-center justify-center text-stone-600 hover:text-[#9A3412] hover:border-[#9A3412]/30 transition-all active:rotate-180 duration-500"
              title="Manual Re-sync"
             >
               <RefreshCw size={18} />
             </button>
             <div className="bg-stone-900/50 border border-stone-800 p-4 px-8 rounded-2xl">
                <p className="text-stone-600 text-[8px] font-black uppercase tracking-widest mb-1">Queue Size</p>
                <p className="text-xl font-black text-[#FAFAF9] tabular-nums">{requests.length}</p>
             </div>
          </div>
        </header>

        {/* Global Search and Filter */}
        <div className="bg-[#1C1917] rounded-[3rem] border border-stone-800/50 shadow-2xl relative overflow-hidden mb-12">
            <div className="p-8 flex flex-col md:flex-row gap-6 items-center">
              <div className="relative flex-1 group w-full">
                <div className="absolute inset-y-0 left-6 flex items-center text-stone-600 group-focus-within:text-[#9A3412] transition-colors">
                  <Search size={20} />
                </div>
                <input 
                  type="text"
                  placeholder="Filter by Student Name, ID or Document Type..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1F1D1B] border border-stone-800 rounded-3xl py-5 pl-16 pr-8 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition placeholder-stone-800"
                />
              </div>
              <div className="flex items-center gap-4 bg-stone-950/30 p-2 rounded-2xl border border-stone-800">
                <button className="px-6 py-3 rounded-xl bg-[#9A3412] text-white text-[10px] font-black uppercase tracking-widest">Pending</button>
                <button className="px-6 py-3 rounded-xl text-stone-600 hover:text-stone-300 text-[10px] font-black uppercase tracking-widest">History</button>
              </div>
            </div>

            {/* Submissions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-800/50">
                    <th className="p-10 text-[10px] font-black text-stone-600 uppercase tracking-widest">Student</th>
                    <th className="p-10 text-[10px] font-black text-stone-600 uppercase tracking-widest">Academic Info</th>
                    <th className="p-10 text-[10px] font-black text-stone-600 uppercase tracking-widest">Document Type</th>
                    <th className="p-10 text-[10px] font-black text-stone-600 uppercase tracking-widest">Status</th>
                    <th className="p-10 text-[10px] font-black text-stone-600 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/20">
                  {filteredRequests.map((req, i) => (
                    <tr key={i} className="group hover:bg-stone-900/30 transition-all">
                      <td className="p-10">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-stone-900 rounded-2xl border border-stone-800 flex items-center justify-center text-[#FAFAF9] font-black shadow-inner group-hover:scale-105 transition-transform">
                              {req.studentName.charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-black text-[#FAFAF9] uppercase tracking-tighter">{req.studentName}</p>
                              <p className="text-[9px] text-stone-600 font-bold uppercase tracking-widest mt-1">{req.collegeId || 'N/A'}</p>
                           </div>
                        </div>
                      </td>
                      <td className="p-10">
                         <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{req.dept} / {req.year}</p>
                         <p className="text-[9px] text-[#9A3412] font-black uppercase tracking-widest mt-1">Section {req.section}</p>
                      </td>
                      <td className="p-10">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-stone-600">
                               <FileText size={16} />
                            </div>
                            <p className="text-[10px] font-black text-[#FAFAF9] uppercase">{req.document.requirement?.title || 'Unknown'}</p>
                         </div>
                      </td>
                      <td className="p-10">
                         <div className="flex items-center gap-3">
                            <Clock size={12} className="text-amber-600" />
                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Pending Review</p>
                         </div>
                      </td>
                      <td className="p-10 text-right">
                        <button 
                          onClick={() => setSelectedRequest(req)}
                          className="p-4 px-8 bg-stone-900 border border-stone-800 rounded-2xl text-stone-500 hover:text-[#FAFAF9] hover:border-[#9A3412]/40 transition-all font-black text-[9px] uppercase tracking-widest flex items-center gap-3 ml-auto group-hover:bg-[#9A3412]/10"
                        >
                          <Eye size={16} />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="p-32 text-center">
                         <div className="w-14 h-14 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center font-black text-xl text-stone-600">
                            <CheckCircle2 size={40} strokeWidth={1} />
                         </div>
                         <h3 className="text-xl font-black uppercase tracking-[0.3em] text-stone-700">No Pending Requests</h3>
                         <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-900 mt-4">All documents have been processed.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>
      </div>

      {/* Verification Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-[#0C0A09]/90 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
           <div className="bg-[#1C1917] w-full max-w-5xl h-[90vh] rounded-[4rem] border border-stone-800 shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
              <header className="p-12 border-b border-stone-800/50 flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-stone-900 rounded-[2rem] border border-stone-800 flex items-center justify-center shadow-inner">
                       <ShieldCheck size={32} className="text-[#9A3412]" />
                    </div>
                    <div>
                       <h2 className="text-4xl font-black uppercase tracking-tighter">Review Document</h2>
                       <div className="flex items-center gap-4 mt-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-600">Student: {selectedRequest.studentName}</p>
                          <div className="w-1 h-1 bg-stone-800 rounded-full" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#9A3412]">Type: {selectedRequest.document.requirement?.title}</p>
                       </div>
                    </div>
                 </div>
                 <button 
                  onClick={() => { setSelectedRequest(null); setRemarks(''); }}
                  className="w-16 h-16 bg-stone-900 border border-stone-800 rounded-[2rem] flex items-center justify-center text-stone-500 hover:text-[#FAFAF9] hover:bg-stone-800 transition-all"
                 >
                    <X size={28} />
                 </button>
              </header>

              <div className="flex-1 flex overflow-hidden">
                 {/* Document Viewer Section */}
                 <div className="flex-1 bg-stone-950 p-12 overflow-hidden flex flex-col">
                    <div className="mb-6 flex justify-between items-center">
                       <p className="text-[9px] font-black uppercase tracking-widest text-stone-600">Document Verification Viewer</p>
                       <a href={`${api.defaults.baseURL.replace('/api', '')}${selectedRequest.document.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#9A3412] text-[9px] font-black uppercase tracking-widest hover:underline">
                          <ExternalLink size={12} /> Open Full Screen
                       </a>
                    </div>
                    <div className="flex-1 bg-[#1C1917] rounded-[2rem] border border-stone-800 overflow-hidden relative">
                       {/* Assuming Document is an Image. If PDF, use an iframe or different component */}
                       <img 
                        src={`${api.defaults.baseURL.replace('/api', '')}${selectedRequest.document.url}`} 
                        alt="Document Preview" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                           e.target.onerror = null;
                           e.target.parentNode.innerHTML = '<div class="absolute inset-0 flex flex-col items-center justify-center text-stone-700 bg-stone-900"><AlertCircle size={48} strokeWidth={1} /><p class="mt-4 text-[10px] font-bold uppercase tracking-widest font-sans">Preview unavailable: Document could not be loaded</p></div>';
                        }}
                       />
                    </div>
                 </div>

                 {/* Control Panel */}
                 <div className="w-[400px] border-l border-stone-800/50 p-12 flex flex-col gap-10 shrink-0 bg-[#1C1917]">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-stone-600 uppercase tracking-widest flex items-center gap-2">
                          <MessageSquare size={12} className="text-[#9A3412]" /> Verification Remarks
                       </label>
                       <textarea 
                        rows="6"
                        placeholder="Enter reason for rejection or additional notes..."
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 text-xs font-black uppercase tracking-widest text-[#FAFAF9] outline-none focus:border-[#9A3412] transition placeholder-stone-800 resize-none leading-relaxed"
                       />
                       <p className="text-[8px] font-bold text-stone-700 uppercase tracking-widest leading-relaxed">
                          Note: These remarks will be sent to the student's mobile app upon submission.
                       </p>
                    </div>

                    <div className="mt-auto space-y-4">
                       <button 
                        onClick={() => handleAction('rejected')}
                        disabled={verifying}
                        className="w-full py-6 rounded-3xl border border-red-900/30 text-red-500 hover:bg-red-950/20 transition-all font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3"
                       >
                          <XCircle size={18} />
                          Reject Document
                       </button>
                       <button 
                        onClick={() => handleAction('verified')}
                        disabled={verifying}
                        className="w-full py-6 rounded-3xl bg-[#9A3412] text-white hover:bg-[#C2410C] shadow-2xl shadow-orange-950/60 transition-all font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-50"
                       >
                          {verifying ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                          Verify Document
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #292524; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9A3412; }
      `}} />
    </div>
  );
};

export default DocumentVerification;
