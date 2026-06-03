/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useRef } from 'react';
import { LogIn, UserPlus, Upload, Trash, LogOut, Check, AlertTriangle, User } from 'lucide-react';
import { authApi } from '../lib/api';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  setCurrentUser: (u: UserType | null) => void;
  initialType?: 'user' | 'admin';
}

export default function AuthModal({ isOpen, onClose, currentUser, setCurrentUser, initialType = 'user' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>(initialType);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialType || 'user');
      setIsRegisterMode(false);
      setErrorMsg('');
      setSuccessMsg('');
      setEmail('');
      setUsername('');
      setPassword('');
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (activeTab === 'user' && isRegisterMode) {
      if (!email.trim() || !username.trim() || !password) {
        setErrorMsg('Harap lengkapi semua baris input (Email, Username, Kata Sandi).');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Kata sandi minimal berisi 6 karakter untuk keamanan Firebase Auth.');
        return;
      }
    } else {
      if (!email.trim() || !password) {
        setErrorMsg('Harap masukkan Email dan Kata Sandi.');
        return;
      }
    }

    setLoading(true);
    try {
      if (activeTab === 'user' && isRegisterMode) {
        const res = await authApi.register(email, username, password);
        setCurrentUser(res.user);
        setSuccessMsg('Pendaftaran akun berhasil! Anda otomatis masuk.');
        setTimeout(() => {
          onClose();
          setSuccessMsg('');
        }, 1500);
      } else {
        const res = await authApi.login(email, password);
        setCurrentUser(res.user);
        setSuccessMsg(activeTab === 'admin' ? 'Berhasil masuk sebagai Administrator!' : 'Berhasil masuk! Selamat bermain.');
        setTimeout(() => {
          onClose();
          setSuccessMsg('');
        }, 1500);
      }
      setEmail('');
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
      setCurrentUser(null);
      setSuccessMsg('Berhasil keluar dari akun.');
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg('Gagal memproses keluar.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih berkas gambar yang valid (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran foto terlalu besar. Maksimal berkapasitas 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result as string;
      setLoading(true);
      setErrorMsg('');
      try {
        await authApi.uploadAvatar(base64Image);
        setCurrentUser({ ...currentUser!, avatar: base64Image });
        setSuccessMsg('Foto profil baru berhasil diunggah!');
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal mengunggah foto profil.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAvatar = async () => {
    if (!currentUser) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await authApi.uploadAvatar('');
      setCurrentUser({ ...currentUser, avatar: undefined });
      setSuccessMsg('Foto profil berhasil dihapus.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus foto profil.');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className={`relative w-full max-w-md bg-slate-900 border ${activeTab === 'admin' ? 'border-amber-500/30' : 'border-slate-700/60'} rounded-2xl shadow-2xl p-6 overflow-hidden`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 id="auth-modal-title" className="text-lg sm:text-xl font-bold font-display text-slate-100 flex items-center gap-2">
            {currentUser ? 'Akun Profil Saya' : (activeTab === 'admin' ? '🛡️ Secure Admin Login' : (isRegisterMode ? 'Daftar Akun Baru' : '🔑 Masuk Anggota Pemain'))}
          </h2>
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Tutup panel masuk"
          >
            ✕
          </button>
        </div>

        {/* Content body */}
        <div className="mt-4 space-y-4">
          
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3 bg-red-500/15 border border-red-500/35 text-red-300 text-xs rounded-xl flex items-center gap-2" role="alert">
              <AlertTriangle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}
          
          {successMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs rounded-xl flex items-center gap-2" role="alert">
              <Check size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Separator Tabs when anonymous */}
          {!currentUser && (
            <div className="flex border border-slate-850 p-1 bg-slate-950/80 rounded-xl">
              <button
                type="button"
                id="select-user-tab-btn"
                onClick={() => {
                  setActiveTab('user');
                  setIsRegisterMode(false);
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeTab === 'user'
                    ? 'bg-neutral-900 text-red-400 shadow-md border border-neutral-800'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                👤 Masuk Anggota
              </button>
              <button
                type="button"
                id="select-admin-tab-btn"
                onClick={() => {
                  setActiveTab('admin');
                  setIsRegisterMode(false);
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-neutral-900 text-amber-400 shadow-md border border-neutral-800'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                🛡️ Portal Admin
              </button>
            </div>
          )}

          {currentUser ? (
            /* Logged in Profil View */
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-slate-850 rounded-xl border border-slate-800">
                
                {/* Avatar Display */}
                <div className={`relative w-20 h-20 bg-slate-755 border-2 ${currentUser.role === 'admin' ? 'border-amber-500' : 'border-red-500'} rounded-full flex items-center justify-center overflow-hidden shadow-inner`}>
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={`Foto profil ${currentUser.username}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={36} className="text-slate-400" />
                  )}
                </div>

                <div className="text-center">
                  <p className={`text-[10px] ${currentUser.role === 'admin' ? 'text-amber-500' : 'text-red-400'} font-mono font-bold uppercase tracking-widest`}>
                    {currentUser.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'PEMAIN TERDAFTAR'}
                  </p>
                  <p className="text-lg font-bold text-slate-100 font-display p-0.5">@{currentUser.username}</p>
                  <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
                </div>

                {/* Upload & Delete profiling files */}
                {currentUser.role !== 'admin' && (
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                        id="input-avatar-file"
                        aria-label="Unggah foto profil"
                      />
                      <button
                        id="btn-upload-avatar"
                        onClick={triggerFileInput}
                        disabled={loading}
                        className="px-3 py-1.5 bg-slate-850 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold border border-slate-750 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Upload size={13} />
                        <span>Unggah Foto</span>
                      </button>
                      {currentUser.avatar && (
                        <button
                          id="btn-delete-avatar"
                          onClick={handleDeleteAvatar}
                          disabled={loading}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg text-xs border border-rose-500/20 transition cursor-pointer"
                          title="Hapus Foto Profil"
                          aria-label="Hapus foto profil saat ini"
                        >
                          <Trash size={13} />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">PNG atau JPG maksimal 2MB.</p>
                  </div>
                )}
              </div>

              {/* Action columns */}
              <button
                id="btn-me-logout"
                onClick={handleLogout}
                disabled={loading}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-755 text-rose-300 border border-rose-500/20 hover:border-rose-500/40 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <LogOut size={16} />
                <span>Keluar dari Akun (Logout)</span>
              </button>
            </div>
          ) : (
            /* Auth Form */
            <form onSubmit={handleAuth} className="space-y-4">
              
              {activeTab === 'admin' ? (
                /* Admin Information Tip Box without displaying demo credentials */
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-[11px] rounded-xl text-amber-300/90 leading-relaxed font-sans space-y-1.5">
                  <p className="font-bold text-amber-400 flex items-center gap-1">
                    <span>🛡️ Portal Keamanan Hub</span>
                  </p>
                  <p>Akses administrasi terbatas untuk moderator, administrator sistem, dan pemilik game. Kredensial telah diamankan untuk mencegah penyalahgunaan publik.</p>
                </div>
              ) : (
                /* Member Welcome tip */
                <div className="p-3 bg-red-500/5 border border-red-500/10 text-[11px] rounded-xl text-red-350/90 leading-relaxed font-sans">
                  {isRegisterMode 
                    ? 'Buat profil akun pemain Anda untuk mengusulkan pertanyaan kustom, simpan masukan umpan balik, dan kumpulkan skor aman.'
                    : 'Masuk sebagai pemain terdaftar untuk menyimpan rekapitulasi bermain dan rekor putaran Anda.'}
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="auth-email-field" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {activeTab === 'admin' ? 'Surel Administrator' : 'Alamat Email'}
                </label>
                <input
                  id="auth-email-field"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === 'admin' ? 'admin@tod.com' : 'nama@domain.com'}
                  className={`w-full px-3 py-2 bg-slate-800 border ${activeTab === 'admin' ? 'border-amber-550/30 font-mono' : 'border-slate-700'} rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-1 ${activeTab === 'admin' ? 'focus:ring-amber-550' : 'focus:ring-red-500'}`}
                  required
                />
              </div>

              {activeTab === 'user' && isRegisterMode && (
                <div className="space-y-1">
                  <label htmlFor="auth-username-field" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Nama Pengguna (Username)
                  </label>
                  <input
                    id="auth-username-field"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ketik nama pengguna..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="auth-password-field" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Kata Sandi {activeTab === 'user' && isRegisterMode ? '(Minimal 6 Karakter)' : ''}
                </label>
                <input
                  id="auth-password-field"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={activeTab === 'admin' ? 'Ketik sandi admin...' : 'Isi kata sandi aman...'}
                  className={`w-full px-3 py-2 bg-slate-800 border ${activeTab === 'admin' ? 'border-amber-550/30' : 'border-slate-700'} rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-1 ${activeTab === 'admin' ? 'focus:ring-amber-550' : 'focus:ring-red-500'}`}
                  required
                />
              </div>

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 ${activeTab === 'admin' ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black' : 'bg-red-550 hover:bg-red-655 text-white font-extrabold'} rounded-xl text-sm shadow-md transition hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 uppercase tracking-wider`}
              >
                {activeTab === 'admin' ? (
                  <>
                    <LogIn size={15} />
                    <span>Masuk Administrator</span>
                  </>
                ) : (
                  <>
                    {isRegisterMode ? <UserPlus size={16} /> : <LogIn size={16} />}
                    <span>{isRegisterMode ? 'Daftar & Bermain' : 'Masuk Sekarang'}</span>
                  </>
                )}
              </button>

              {activeTab === 'user' && (
                <div className="pt-2 border-t border-slate-800 text-center">
                  <button
                    type="button"
                    id="auth-toggle-mode-btn"
                    onClick={() => setIsRegisterMode(!isRegisterMode)}
                    className="text-xs text-slate-400 hover:text-red-350 font-semibold underline cursor-pointer"
                  >
                    {isRegisterMode
                      ? 'Sudah memiliki akun? Masuk di sini'
                      : 'Belum memiliki akun? Daftar akun baru'}
                  </button>
                </div>
              )}
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
