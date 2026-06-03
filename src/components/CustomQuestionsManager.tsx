/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, ShieldAlert, BookOpen, AlertCircle } from 'lucide-react';
import { Question, CategoryKey, User } from '../types';
import { questionApi } from '../lib/api';

interface CustomQuestionsManagerProps {
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onQuestionsUpdated: () => void;
  questions: Question[];
}

export default function CustomQuestionsManager({
  currentUser,
  onOpenAuthModal,
  onQuestionsUpdated,
  questions
}: CustomQuestionsManagerProps) {
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryKey>('pertemanan');
  const [newType, setNewType] = useState<'truth' | 'dare'>('truth');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Auto clear alerts after 3 seconds
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 3500);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(''), 3500);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  // Filter only user-created questions
  const userQuestions = questions.filter(q => q.isCustom && q.userId === currentUser?.id);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!newText.trim() || newText.trim().length < 5) {
      setErrorMsg('Konten pertanyaan terlalu pendek! Minimal berisi 5 karakter.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await questionApi.createQuestion(newCategory, newType, newText.trim());
      setNewText('');
      setSuccessMsg('Pertanyaan kustom berhasil ditambahkan!');
      onQuestionsUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan pertanyaan baru.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (q: Question) => {
    setEditingId(q.id);
    setEditText(q.text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim() || editText.trim().length < 5) {
      setErrorMsg('Teks edit terlalu pendek! Minimal berisi 5 karakter.');
      return;
    }

    setLoading(true);
    try {
      await questionApi.updateQuestion(id, editText.trim());
      setEditingId(null);
      setSuccessMsg('Pertanyaan berhasil diperbarui!');
      onQuestionsUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengubah pertanyaan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pertanyaan kustom ini?')) {
      return;
    }

    setLoading(true);
    try {
      await questionApi.deleteQuestion(id);
      setSuccessMsg('Pertanyaan kustom berhasil dihapus!');
      onQuestionsUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus pertanyaan.');
    } finally {
      setLoading(false);
    }
  };

  // Human-readable labels config
  const categoryLabels: Record<CategoryKey, string> = {
    asmara: 'Asmara ❤️',
    pertemanan: 'Pertemanan 🤝',
    keluarga: 'Keluarga 🏡'
  };

  if (!currentUser) {
    return (
      <div className="bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-6 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center mx-auto border border-red-500/20" aria-hidden="true">
          <ShieldAlert size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-neutral-100 font-display">Ingin Menambahkan Pertanyaan Sendiri?</h3>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto font-medium">
            Silakan masuk (Login) atau daftarkan akun baru secara gratis untuk membuat, mengedit, dan menyimpan daftar pertanyaan kustom Anda yang aman dari pemain lain.
          </p>
        </div>
        <button
          id="btn-login-prompt-questions"
          onClick={onOpenAuthModal}
          className="mx-auto px-5 py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-red-600/10 transition transform hover:scale-[1.01] cursor-pointer focus:ring-2 focus:ring-red-400"
        >
          Masuk / Buat Akun Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <BookOpen size={20} className="text-red-500" />
        <h3 className="text-lg font-extrabold text-neutral-100 font-display uppercase tracking-tight">Kelola Pertanyaan Kustom Khas Anda</h3>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-300 text-sm rounded-xl flex items-center gap-2" role="alert">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm rounded-xl flex items-center gap-2" role="alert">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Creation form */}
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.55">
            <label htmlFor="select-q-category" className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              Kategori Hubungan
            </label>
            <select
              id="select-q-category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as CategoryKey)}
              className="w-full px-3 py-2.5 bg-neutral-950 border-2 border-neutral-850 rounded-xl text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="asmara">Asmara (Romantis)</option>
              <option value="pertemanan">Pertemanan (Sahabat)</option>
              <option value="keluarga">Keluarga</option>
            </select>
          </div>

          <div className="space-y-1.55">
            <label htmlFor="select-q-type" className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              Tipe Pertanyaan
            </label>
            <select
              id="select-q-type"
              value={newType}
              onChange={(e) => setNewType(e.target.value as 'truth' | 'dare')}
              className="w-full px-3 py-2.5 bg-neutral-950 border-2 border-neutral-850 rounded-xl text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="truth">Truth (Kejujuran)</option>
              <option value="dare">Dare (Tantangan Berani)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.55">
          <label htmlFor="input-q-text" className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
            Konten Teks Pertanyaan / Tantangan
          </label>
          <textarea
            id="input-q-text"
            rows={2}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Ketik pertanyaan rahasia atau tantangan seru di sini..."
            className="w-full px-3 py-2.5 bg-neutral-950 border-2 border-neutral-850 rounded-xl text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl text-sm shadow-md transition focus:ring-2 focus:ring-red-400 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-55"
        >
          <Plus size={16} />
          <span>Tambah Pertanyaan Baru</span>
        </button>
      </form>

      {/* Questions list */}
      <div className="space-y-3 pt-4 border-t border-neutral-800">
        <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Daftar Pertanyaan Kustom Anda ({userQuestions.length})</h4>
        
        {userQuestions.length === 0 ? (
          <p className="text-xs text-neutral-500 italic">Belum ada pertanyaan kustom. Buat satu pertanyaan seru di atas!</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {userQuestions.map((q) => (
              <div
                key={q.id}
                className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      q.type === 'truth' ? 'bg-indigo-900/30 text-indigo-300' : 'bg-red-900/30 text-red-400'
                    }`}>
                      {q.type}
                    </span>
                    <span className="text-neutral-400 font-bold text-[10px] uppercase">
                      {categoryLabels[q.category]}
                    </span>
                  </div>

                  {editingId === q.id ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        id={`edit-input-${q.id}`}
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(q.id)}
                        className="p-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                        title="Simpan Perubahan"
                        aria-label="Simpan perubahan teks pertanyaan"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 rounded bg-neutral-805 hover:bg-neutral-800 text-neutral-400"
                        title="Batal"
                        aria-label="Batal ubah teks pertanyaan"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-neutral-200 line-clamp-2 md:line-clamp-none font-medium">{q.text}</p>
                  )}
                </div>

                {editingId !== q.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(q)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 cursor-pointer"
                      title="Edit"
                      aria-label="Ubah pertanyaan"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 cursor-pointer"
                      title="Hapus"
                      aria-label="Hapus pertanyaan"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
