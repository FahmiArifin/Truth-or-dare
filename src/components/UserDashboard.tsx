import React, { useState, useEffect } from 'react';
import { User, Question, GameHistoryItem, GameCategory } from '../types';
import { userApi, questionApi } from '../lib/api';
import { Sparkles, History, HelpCircle, FileText, Send, Check, Trash2, Edit2, AlertCircle } from 'lucide-react';

interface UserDashboardProps {
  currentUser: User;
  categories: GameCategory[];
  onShowAlert: (msg: string) => void;
  onBackToGame: () => void;
  highContrastEnabled: boolean;
}

export default function UserDashboard({
  currentUser,
  categories,
  onShowAlert,
  onBackToGame,
  highContrastEnabled
}: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<'suggest' | 'history' | 'feedback'>('suggest');
  
  // Suggestion Form State
  const [sugCategory, setSugCategory] = useState(categories[0]?.key || 'asmara');
  const [sugType, setSugType] = useState<'truth' | 'dare'>('truth');
  const [sugText, setSugText] = useState('');
  const [submittingSug, setSubmittingSug] = useState(false);
  const [mySuggestions, setMySuggestions] = useState<Question[]>([]);

  // History State
  const [myHistories, setMyHistories] = useState<GameHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Feedback Form State
  const [feedCategory, setFeedCategory] = useState('accessibility');
  const [feedComment, setFeedComment] = useState('');
  const [submittingFeed, setSubmittingFeed] = useState(false);

  // Loading Suggestions
  const fetchMySuggestions = async () => {
    try {
      const res = await userApi.getSuggestions();
      setMySuggestions(res.suggestions || []);
    } catch (err: any) {
      console.error('Failed to fetch suggestions:', err);
    }
  };

  // Loading History
  const fetchMyHistories = async () => {
    setLoadingHistory(true);
    try {
      const res = await userApi.getHistories();
      setMyHistories(res.histories || []);
    } catch (err: any) {
      console.error('Failed to fetch histories:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchMySuggestions();
    fetchMyHistories();
  }, [currentUser]);

  const handleSuggestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sugText.trim()) {
      onShowAlert('Harap isi konten pertanyaan atau tantangan.');
      return;
    }
    if (sugText.trim().length < 5) {
      onShowAlert('Pertanyaan terlalu pendek. Minimal berisi 5 karakter.');
      return;
    }

    setSubmittingSug(true);
    try {
      await userApi.createSuggestion({
        category: sugCategory,
        type: sugType,
        text: sugText.trim()
      });
      onShowAlert('Saran pertanyaan Anda berhasil diajukan! Status saat ini: tertunda (pending).');
      setSugText('');
      fetchMySuggestions();
    } catch (err: any) {
      onShowAlert(err.message || 'Gagal mengirim saran.');
    } finally {
      setSubmittingSug(false);
    }
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus saran pertanyaan ini?')) return;
    try {
      await questionApi.deleteQuestion(id);
      onShowAlert('Saran pertanyaan berhasil dihapus.');
      fetchMySuggestions();
    } catch (err: any) {
      onShowAlert(err.message || 'Gagal menghapus saran.');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedComment.trim()) {
      onShowAlert('Harap beri komentar atau laporan Anda.');
      return;
    }

    setSubmittingFeed(true);
    try {
      await userApi.submitFeedback({
        category: feedCategory,
        comment: feedComment.trim(),
        name: currentUser.username
      });
      onShowAlert('Terima kasih atas laporan/umpan balik Anda saat ini! Kami akan terus menyempurnakan aspek kenyamanan dan WCAG.');
      setFeedComment('');
    } catch (err: any) {
      onShowAlert(err.message || 'Gagal mengirim umpan balik.');
    } finally {
      setSubmittingFeed(false);
    }
  };

  return (
    <div id="user-dashboard-view" className="bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-6 shadow-xl space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-white uppercase flex items-center gap-2">
            <Sparkles className="text-red-500 animate-pulse" size={24} />
            <span>Dashboard Anggota Saya</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-medium">
            Halo @{currentUser.username}! Kirim saran pertanyaan, lacak riwayat bermain game, serta beri masukan visual.
          </p>
        </div>
        <button
          onClick={onBackToGame}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
        >
          ← Kembali Ke Game
        </button>
      </div>

      {/* WCAG compliant keyboard navigable tabs */}
      <div className="flex border-b border-neutral-800 focus-within:ring-2 focus-within:ring-red-500 rounded-lg p-0.5 bg-neutral-950/40">
        <button
          onClick={() => setActiveTab('suggest')}
          className={`flex-1 py-3 text-xs sm:text-sm font-black uppercase tracking-wide rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'suggest'
              ? 'bg-red-650 text-white border border-red-500/50'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
          }`}
          aria-selected={activeTab === 'suggest'}
          role="tab"
          aria-label="Tab Ajukan & Kelola Saran Pertanyaan Baru"
        >
          <Send size={15} />
          <span>Saran Kartu</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            fetchMyHistories();
          }}
          className={`flex-1 py-3 text-xs sm:text-sm font-black uppercase tracking-wide rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'history'
              ? 'bg-red-650 text-white border border-red-500/50'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
          }`}
          aria-selected={activeTab === 'history'}
          role="tab"
          aria-label="Tab Riwayat Sesi Bermain & Status Saran"
        >
          <History size={15} />
          <span>Riwayat Saya</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 py-3 text-xs sm:text-sm font-black uppercase tracking-wide rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'feedback'
              ? 'bg-red-650 text-white border border-red-500/50'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
          }`}
          aria-selected={activeTab === 'feedback'}
          role="tab"
          aria-label="Tab Kirim Koreksi Aksesibilitas & Bug Visual"
        >
          <HelpCircle size={15} />
          <span>Lapor & Feedback</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">

        {/* 1. SUGGEST QUESTIONS PANEL */}
        {activeTab === 'suggest' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="panel-suggest-question">
            
            {/* Form Column (Col span 5) */}
            <form onSubmit={handleSuggestSubmit} className="lg:col-span-5 bg-neutral-950/40 border-2 border-neutral-850 p-5 sm:p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText size={15} />
                <span>Rekomendasikan Pertanyaan</span>
              </h3>

              <div className="space-y-1.5">
                <label htmlFor="sug-category-select" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                  Kategori Hubungan
                </label>
                <select
                  id="sug-category-select"
                  value={sugCategory}
                  onChange={(e) => setSugCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">
                  Pilih Tipe Kartu
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSugType('truth')}
                    className={`py-2 px-3 text-xs font-black rounded-xl border-2 uppercase transition-all ${
                      sugType === 'truth'
                        ? 'bg-red-950/40 border-red-550 text-red-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    JUJUR (TRUTH)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSugType('dare')}
                    className={`py-2 px-3 text-xs font-black rounded-xl border-2 uppercase transition-all ${
                      sugType === 'dare'
                        ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        : 'bg-neutral-950/40 border-neutral-800 text-yellow-350'
                    }`}
                  >
                    TANTANGAN (DARE)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sug-text-input" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                  Teks Pertanyaan / Deskripsi Tantangan
                </label>
                <textarea
                  id="sug-text-input"
                  value={sugText}
                  onChange={(e) => setSugText(e.target.value)}
                  rows={4}
                  placeholder="Ketik pertanyaan rahasia atau instruksi seru di sini..."
                  className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm placeholder-neutral-550 focus:ring-2 focus:ring-red-500 focus:outline-none text-neutral-100 font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={submittingSug}
                className="w-full py-3 bg-red-650 hover:bg-red-600 border border-red-500 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send size={14} />
                <span>Ajukan Ke Antrean Admin</span>
              </button>
            </form>

            {/* List Column (Col span 7) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest">
                Daftar Saran Diajukan Berhasil ({mySuggestions.length})
              </h3>

              {mySuggestions.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border-2 border-dashed border-neutral-800 text-neutral-500 text-xs italic font-medium leading-relaxed bg-neutral-950/10">
                  Anda belum pernah menyarankan pertanyaan. Tulis saran baru di formulir sebelah kiri!
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {mySuggestions.map((sug) => (
                    <div
                      key={sug.id}
                      className="p-4 bg-neutral-950/40 border-2 border-neutral-850 rounded-2xl flex flex-col justify-between gap-3 relative hover:border-neutral-750 transition duration-150"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                            sug.type === 'truth'
                              ? 'bg-red-950/50 text-red-400 border-red-800'
                              : 'bg-neutral-900 text-amber-300 border-neutral-800'
                          }`}>
                            {sug.type === 'truth' ? 'Truth' : 'Dare'}
                          </span>
                          <span className="text-[9px] text-neutral-500 font-mono font-bold uppercase">
                            /{sug.category}
                          </span>
                          
                          {/* Approval badge and colors */}
                          <div className="ml-auto">
                            {sug.status === 'approved' && (
                              <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-850 text-emerald-400 rounded text-[8px] font-black uppercase">
                                Disetujui (Approved)
                              </span>
                            )}
                            {sug.status === 'rejected' && (
                              <span className="px-2 py-0.5 bg-rose-950/60 border border-rose-850 text-rose-450 rounded text-[8px] font-black uppercase">
                                Ditolak (Rejected)
                              </span>
                            )}
                            {sug.status === 'pending' && (
                              <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-850 text-amber-400 rounded text-[8px] font-black uppercase">
                                Menunggu Review
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-bold">
                          "{sug.text}"
                        </p>
                      </div>

                      <div className="flex justify-end gap-2 border-t border-neutral-900/40 pt-2 text-[10px]">
                        <button
                          onClick={() => handleDeleteSuggestion(sug.id)}
                          className="p-1 px-2.5 bg-rose-500/10 text-rose-350 hover:bg-rose-500/20 rounded border border-rose-500/20 hover:border-rose-500/30 cursor-pointer flex items-center gap-1 transition"
                          aria-label="Hapus saran ini"
                        >
                          <Trash2 size={11} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. HISTORY OF SESSIONS PANEL */}
        {activeTab === 'history' && (
          <div className="space-y-4" id="panel-history-logs">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <History size={15} />
              <span>Semua Putaran Anda Selesai Di Sesi Ini</span>
            </h3>

            {loadingHistory ? (
              <div className="p-8 text-center text-neutral-400 text-xs font-bold uppercase animate-pulse">
                Memuat data riwayat dari database server...
              </div>
            ) : myHistories.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border-2 border-dashed border-neutral-800 text-neutral-500 text-xs italic font-medium bg-neutral-950/10 leading-relaxed">
                Anda belum memiliki riwayat bermain yang tersimpan. Mulai putar permainan atau login saat gameplay berlangsung!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[440px] overflow-y-auto pr-1">
                {myHistories.map((hist, idx) => (
                  <div key={hist.id || idx} className="p-4 bg-neutral-950/30 border-2 border-neutral-850 rounded-2xl space-y-2 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-black text-neutral-500 font-mono">
                        <span>SERI #{myHistories.length - idx}</span>
                        <span>{hist.date ? new Date(hist.date).toLocaleDateString('id-ID') : '-'}</span>
                      </div>
                      <p className="text-xs text-neutral-300 font-semibold leading-relaxed">
                        Pemain <strong className="text-white">"{hist.playerName}"</strong> menarik kartu <strong className="text-amber-300 uppercase">{hist.type}</strong> dalam opsi kategori <strong>{hist.category}</strong>:
                      </p>
                    </div>
                    
                    <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-850">
                      <p className="text-xs sm:text-sm font-bold text-neutral-200 italic">
                        "{hist.questionText}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. REPORT AND VISUAL FEEDBACK PANEL */}
        {activeTab === 'feedback' && (
          <form onSubmit={handleFeedbackSubmit} className="max-w-2xl mx-auto bg-neutral-950/40 border-2 border-neutral-850 p-6 rounded-2xl space-y-4" id="panel-feedback-form">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <AlertCircle size={15} />
              <span>Beri Masukan Pembaca Layar & Kenyamanan Warna</span>
            </h3>

            <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
              Komentar, usulan kenyamanan kontras visual, kecocokan Text-To-Speech (TTS), atau bug teknis yang Anda alami dapat langsung didaftarkan di sini. Administrator akan membacanya seksama guna perbaikan berkala.
            </p>

            <div className="space-y-1.5">
              <label htmlFor="feed-category-select" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                Aspek Masukan
              </label>
              <select
                id="feed-category-select"
                value={feedCategory}
                onChange={(e) => setFeedCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="accessibility">Aksesibilitas (Screen-Reader/WCAG POUR)</option>
                <option value="visual_comfort">Visual & Rasio Kontras Warna Mata</option>
                <option value="performance">Kinerja Layanan & Kecepatan TTS</option>
                <option value="other">Lainnya / Pertanyaan Umum</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="feed-comment-input" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                Tulis Deskripsi Tanggapan Masukan Anda
              </label>
              <textarea
                id="feed-comment-input"
                value={feedComment}
                onChange={(e) => setFeedComment(e.target.value)}
                rows={5}
                required
                placeholder="Bagikan pengalaman ramah akses Anda bersama kami..."
                className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm placeholder-neutral-550 focus:ring-2 focus:ring-red-500 focus:outline-none text-neutral-100 font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={submittingFeed}
              className="w-full py-3 bg-red-650 hover:bg-red-600 border border-red-500 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send size={14} />
              <span>Submit Tanggapan</span>
            </button>
          </form>
        )}

      </div>

    </div>
  );
}
