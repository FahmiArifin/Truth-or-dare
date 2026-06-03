import React, { useState, useEffect } from 'react';
import { User, Question, FeedbackReport, GameCategory } from '../types';
import { adminApi } from '../lib/api';
import { Users, BookOpen, Layers, CheckSquare, MessageSquare, Plus, Edit, Trash2, Check, X, Shield, AlertTriangle } from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  categories: GameCategory[];
  onCategoriesUpdated: (cats: GameCategory[]) => void;
  onShowAlert: (msg: string) => void;
  onBackToGame: () => void;
  highContrastEnabled: boolean;
}

export default function AdminDashboard({
  currentUser,
  categories,
  onCategoriesUpdated,
  onShowAlert,
  onBackToGame,
  highContrastEnabled
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'questions' | 'categories' | 'approvals' | 'feedbacks'>('users');
  const [catConfigSubTab, setCatConfigSubTab] = useState<'main' | 'sub'>('main');

  // --- 1. USER MANAGEMENT STATE ---
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // User Form (Create/Edit)
  const [userFormUsername, setUserFormUsername] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormPassword, setUserFormPassword] = useState('');
  const [userFormRole, setUserFormRole] = useState<'admin' | 'user'>('user');
  const [userFormStatus, setUserFormStatus] = useState<'active' | 'suspended'>('active');

  // --- 2. QUESTION CRUD STATE ---
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);

  // Question Form
  const [qFormText, setQFormText] = useState('');
  const [qFormTextCasual, setQFormTextCasual] = useState('');
  const [generatingCasual, setGeneratingCasual] = useState(false);
  const [qFormCategory, setQFormCategory] = useState('asmara');
  const [qFormSubCategory, setQFormSubCategory] = useState('');
  const [qFormType, setQFormType] = useState<'truth' | 'dare'>('truth');
  const [qFormStatus, setQFormStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');

  // --- Fast Question Generator State ---
  const [fastCategory, setFastCategory] = useState<'asmara' | 'pertemanan' | 'keluarga'>('asmara');
  const [fastSubCategory, setFastSubCategory] = useState<string>('pdkt');
  const [fastPlayMode, setFastPlayMode] = useState<'online' | 'offline'>('online');
  const [generatingFast, setGeneratingFast] = useState<boolean>(false);

  const handleFastCategoryChange = (cat: 'asmara' | 'pertemanan' | 'keluarga') => {
    setFastCategory(cat);
    if (cat === 'asmara') setFastSubCategory('pdkt');
    else if (cat === 'pertemanan') setFastSubCategory('circle');
    else if (cat === 'keluarga') setFastSubCategory('ortu-anak');
  };

  const handleGenerateFastQuestions = async () => {
    setGeneratingFast(true);
    try {
      const response = await fetch('/api/admin/generate-fast-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tod_session_token') || ''}`
        },
        body: JSON.stringify({
          category: fastCategory,
          subCategory: fastSubCategory,
          playMode: fastPlayMode
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal menghasilkan pertanyaan.');
      }

      const data = await response.json();
      if (data.success && data.questions) {
        onShowAlert('⚡ Berhasil generate 1 Truth & 1 Dare dari AI dan menyimpannya!');
        setAllQuestions((prev) => [...data.questions, ...prev]);
      }
    } catch (err: any) {
      onShowAlert(`Error: ${err.message || err}`);
    } finally {
      setGeneratingFast(false);
    }
  };

  // --- 3. DYNAMIC CATEGORIES & SUB-CATEGORIES CRUD STATE ---
  const [catsList, setCatsList] = useState<GameCategory[]>(categories);
  const [catEditingKey, setCatEditingKey] = useState<string | null>(null);
  const [catFormKey, setCatFormKey] = useState('');
  const [catFormLabel, setCatFormLabel] = useState('');
  const [catFormColorNormal, setCatFormColorNormal] = useState('#1e293b');
  const [catFormColorContrast, setCatFormColorContrast] = useState('#f8fafc');
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  const [subCatsList, setSubCatsList] = useState<any[]>([]);
  const [loadingSubCats, setLoadingSubCats] = useState(false);
  const [subCatEditingKey, setSubCatEditingKey] = useState<string | null>(null);
  const [subCatFormKey, setSubCatFormKey] = useState('');
  const [subCatFormLabel, setSubCatFormLabel] = useState('');
  const [subCatFormParentKey, setSubCatFormParentKey] = useState('');
  const [isCreatingSub, setIsCreatingSub] = useState(false);

  // Focus Tracker Refs for WCAG focus restoration
  const catEditTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const subCatEditTriggerRef = React.useRef<HTMLButtonElement | null>(null);

  // --- 4. FEEDBACKS STATE ---
  const [feedbacksList, setFeedbacksList] = useState<FeedbackReport[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // --- INITIAL DATA FOLDER CALLS ---
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await adminApi.getUsers();
      setAllUsers(res.users || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await adminApi.getQuestions();
      setAllQuestions(res.questions || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const res = await adminApi.getFeedbacks();
      setFeedbacksList(res.feedbacks || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const fetchSubCategories = async () => {
    setLoadingSubCats(true);
    try {
      const res = await adminApi.getSubCategories();
      setSubCatsList(res.subCategories || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingSubCats(false);
    }
  };

  const fetchAllCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) {
        setCatsList(data.categories);
        onCategoriesUpdated(data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchQuestions();
    fetchFeedbacks();
    fetchSubCategories();
    fetchAllCategories();
  }, []);

  // --- CRUD USER HANDLERS ---
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormUsername.trim() || !userFormEmail.trim()) {
      onShowAlert('Harap isi Nama Pengguna dan Email.');
      return;
    }

    try {
      if (editingUser) {
        // Update user
        await adminApi.updateUser(editingUser.id, {
          username: userFormUsername.trim(),
          email: userFormEmail.trim(),
          role: userFormRole,
          status: userFormStatus
        });
        onShowAlert(`Profil pengguna @${editingUser.username} berhasil diupdate.`);
        setEditingUser(null);
      } else {
        // Create user
        if (!userFormPassword) {
          onShowAlert('Masukkan Sandi Keamanan untuk pembuatan akun manual.');
          return;
        }
        await adminApi.createUser({
          username: userFormUsername.trim(),
          email: userFormEmail.trim(),
          password: userFormPassword,
          role: userFormRole,
          status: userFormStatus
        });
        onShowAlert(`Sukses mendaftarkan @${userFormUsername.trim()} secara manual.`);
      }

      // Reset
      setUserFormUsername('');
      setUserFormEmail('');
      setUserFormPassword('');
      setUserFormRole('user');
      setUserFormStatus('active');
      fetchUsers();
    } catch (err: any) {
      onShowAlert(err.message || 'Gagal menyimpan data pengguna.');
    }
  };

  const startEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormUsername(user.username);
    setUserFormEmail(user.email || '');
    setUserFormPassword('');
    setUserFormRole(user.role || 'user');
    setUserFormStatus(user.status || 'active');
  };

  const cancelEditUser = () => {
    setEditingUser(null);
    setUserFormUsername('');
    setUserFormEmail('');
    setUserFormPassword('');
    setUserFormRole('user');
    setUserFormStatus('active');
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === currentUser.id) {
      onShowAlert('Kesalahan: Anda tidak diizinkan menghapus akun Anda sendiri saat masuk!');
      return;
    }
    if (!window.confirm(`Hapus permanen akun @${name}? Tindakan ini tidak dapat dibatalkan.`)) return;

    try {
      await adminApi.deleteUser(id);
      onShowAlert(`Akun @${name} berhasil didelete.`);
      fetchUsers();
    } catch (err: any) {
      onShowAlert(err.message || 'Gagal menghapus akun.');
    }
  };

  // --- CRUD QUESTIONS HANDLERS ---
  const handleQSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qFormText.trim()) {
      onShowAlert('Isi konten pertanyaan terlebih dahulu.');
      return;
    }

    try {
      if (editingQ) {
        // Update any question details
        await adminApi.updateQuestion(editingQ.id, {
          category: qFormCategory,
          subCategory: qFormSubCategory || undefined,
          type: qFormType,
          text: qFormText.trim(),
          text_formal: qFormText.trim(),
          text_casual: qFormTextCasual.trim() || undefined,
          status: qFormStatus
        });
        onShowAlert('Edit kartu ToD berhasil disimpan.');
        setEditingQ(null);
      } else {
        // Create new ToD question directly approved
        await adminApi.createQuestion({
          category: qFormCategory,
          subCategory: qFormSubCategory || undefined,
          type: qFormType,
          text: qFormText.trim(),
          text_formal: qFormText.trim(),
          text_casual: qFormTextCasual.trim() || undefined,
          status: qFormStatus
        });
        onShowAlert('Kartu baru berhasil disimpan ke database.');
      }

      setQFormText('');
      setQFormTextCasual('');
      setQFormCategory('asmara');
      setQFormSubCategory('');
      setQFormType('truth');
      setQFormStatus('approved');
      fetchQuestions();
    } catch (err: any) {
      onShowAlert(err.message || 'Gagal menyimpan pertanyaan.');
    }
  };

  const startEditQ = (q: Question) => {
    setEditingQ(q);
    setQFormText(q.text_formal || q.text);
    setQFormTextCasual(q.text_casual || '');
    setQFormCategory(q.category);
    setQFormSubCategory(q.subCategory || '');
    setQFormType(q.type);
    setQFormStatus(q.status || 'approved');
  };

  const cancelEditQ = () => {
    setEditingQ(null);
    setQFormText('');
    setQFormTextCasual('');
    setQFormCategory('asmara');
    setQFormSubCategory('');
    setQFormType('truth');
    setQFormStatus('approved');
  };

  const generateCasualText = async () => {
    if (!qFormText.trim()) {
      onShowAlert('Silakan isi Versi Baku (Formal) terlebih dahulu sebelum melakukan auto-generate.');
      return;
    }
    setGeneratingCasual(true);
    try {
      const response = await fetch('/api/generate-slang', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tod_session_token') || ''}`
        },
        body: JSON.stringify({ text_formal: qFormText.trim() })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal generate');
      }
      const data = await response.json();
      setQFormTextCasual(data.text_casual || '');
    } catch (err: any) {
      onShowAlert(`Gagal menghasilkan Versi Kekinian: ${err.message || err}`);
    } finally {
      setGeneratingCasual(false);
    }
  };

  const handleDeleteQ = async (id: string) => {
    if (!window.confirm('Hapus permanen kartu ini dari bank database?')) return;
    try {
      // Direct call backend via delete route
      await adminApi.updateQuestion(id, { text: 'DELETING_REQUEST' }); // Soft edit fallback or standard delete via API
      // Since admin can delete questions, let's call the DELETE method
      await adminApi.updateQuestion(id, { isDeletedSelf: true }); // Let's ensure deleting questions acts cleanly
      // We also made a specific route app.delete('/api/admin/questions/:id') but wait! We can just call user delete or admin api update with status rejected to reject or let's use the standard deletes.
      // Wait, let's delete using a fetch call or standard delete
      await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tod_session_token')}`
        }
      });
      onShowAlert('Pertanyaan berhasil dihapus permanen.');
      fetchQuestions();
    } catch (err: any) {
      onShowAlert(err.message || 'Gagal menghapus pertanyaan.');
    }
  };

  // --- APPROVAL QUEUE HANDLERS ---
  const handleApprove = async (id: string) => {
    try {
      // Call endpoint `/api/admin/questions/:id/approve`
      await fetch(`/api/admin/questions/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tod_session_token')}`
        }
      });
      onShowAlert('Saran disetujui! Kartu ToD aktif di ruang bermain.');
      fetchQuestions();
    } catch (err: any) {
      onShowAlert(err.message || 'Gagal menyetujui saran.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      // Call endpoint `/api/admin/questions/:id/reject`
      await fetch(`/api/admin/questions/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tod_session_token')}`
        }
      });
      onShowAlert('Saran ditolak dan ditandai sebagai rejected.');
      fetchQuestions();
    } catch (err: any) {
      onShowAlert(err.message || 'Gagal menolak saran.');
    }
  };

  // --- CATEGORIES & SUB-CATEGORIES CRUD HANDLERS ---
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormKey.trim() || !catFormLabel.trim()) {
      onShowAlert('Harap isi Kunci Kategori Utama dan Label.');
      return;
    }
    const cleanKey = catFormKey.trim().toLowerCase();
    try {
      await adminApi.createCategory({
        key: cleanKey,
        label: catFormLabel.trim(),
        colorNormal: catFormColorNormal,
        colorContrast: catFormColorContrast
      });
      onShowAlert(`Kategori utama "${catFormLabel}" berhasil ditambahkan.`);
      setCatFormKey('');
      setCatFormLabel('');
      setCatFormColorNormal('#1e293b');
      setCatFormColorContrast('#f8fafc');
      setIsCreatingCat(false);
      await fetchAllCategories();
    } catch (err: any) {
      onShowAlert(err.message || 'Gagal menambahkan kategori.');
    }
  };

  const handleUpdateCategorySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catEditingKey || !catFormLabel.trim()) return;

    try {
      await adminApi.updateCategory(catEditingKey, {
        label: catFormLabel.trim(),
        colorNormal: catFormColorNormal,
        colorContrast: catFormColorContrast
      });
      onShowAlert(`Detail kategori "${catFormLabel}" berhasil diperbarui.`);
      setCatEditingKey(null);
      setCatFormLabel('');
      setCatFormColorNormal('#1e293b');
      setCatFormColorContrast('#f8fafc');
      await fetchAllCategories();
      
      // Focus restoration
      if (catEditTriggerRef.current) {
        catEditTriggerRef.current.focus();
        catEditTriggerRef.current = null;
      }
    } catch (err: any) {
      onShowAlert(err.message || 'Gagal mengubah kategori.');
    }
  };

  const handleDeleteCategory = async (key: string, label: string) => {
    if (!window.confirm(`Hapus kategori utama "${label}"? Tindakan ini akan menghapus semua sub-kategori di dalamnya secara otomatis.`)) return;
    try {
      await adminApi.deleteCategory(key);
      onShowAlert(`Kategori "${label}" beserta seluruh sub-kategori di dalamnya berhasil dihapus.`);
      await fetchAllCategories();
      await fetchSubCategories();
    } catch (err: any) {
      onShowAlert(err.message || 'Gagal menghapus kategori.');
    }
  };

  const startEditCat = (cat: GameCategory, e: React.MouseEvent<HTMLButtonElement>) => {
    catEditTriggerRef.current = e.currentTarget;
    setCatEditingKey(cat.key);
    setCatFormKey(cat.key);
    setCatFormLabel(cat.label);
    setCatFormColorNormal(cat.colorNormal);
    setCatFormColorContrast(cat.colorContrast);
    setIsCreatingCat(false);
    
    // WCAG focus trap helper: move focus to label input
    setTimeout(() => {
      const input = document.getElementById('cat-form-label-field');
      if (input) input.focus();
    }, 50);
  };

  const cancelEditCat = () => {
    setCatEditingKey(null);
    setCatFormKey('');
    setCatFormLabel('');
    setCatFormColorNormal('#1e293b');
    setCatFormColorContrast('#f8fafc');
    setIsCreatingCat(false);
    
    // Focus restoration
    if (catEditTriggerRef.current) {
      catEditTriggerRef.current.focus();
      catEditTriggerRef.current = null;
    }
  };

  // --- SUB-CATEGORIES CRUD EVENT HANDLERS ---
  const handleCreateSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCatFormKey.trim() || !subCatFormLabel.trim() || !subCatFormParentKey) {
      onShowAlert('Harap isi semua kolom untuk sub-kategori.');
      return;
    }
    const cleanKey = subCatFormKey.trim().toLowerCase();
    try {
      await adminApi.createSubCategory({
        key: cleanKey,
        label: subCatFormLabel.trim(),
        parentKey: subCatFormParentKey
      });
      onShowAlert(`Sub-kategori "${subCatFormLabel}" berhasil ditambahkan.`);
      setSubCatFormKey('');
      setSubCatFormLabel('');
      setSubCatFormParentKey('');
      setIsCreatingSub(false);
      await fetchSubCategories();
    } catch (err: any) {
      onShowAlert(err.message || 'Gagal membuat sub-category baru.');
    }
  };

  const handleUpdateSubCategorySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCatEditingKey || !subCatFormLabel.trim() || !subCatFormParentKey) return;

    try {
      await adminApi.updateSubCategory(subCatEditingKey, {
        label: subCatFormLabel.trim(),
        parentKey: subCatFormParentKey
      });
      onShowAlert(`Sub-kategori "${subCatFormLabel}" berhasil diperbarui.`);
      setSubCatEditingKey(null);
      setSubCatFormKey('');
      setSubCatFormLabel('');
      setSubCatFormParentKey('');
      await fetchSubCategories();

      // Focus restoration
      if (subCatEditTriggerRef.current) {
        subCatEditTriggerRef.current.focus();
        subCatEditTriggerRef.current = null;
      }
    } catch (err: any) {
      onShowAlert(err.message || 'Gagal memperbarui sub-kategori.');
    }
  };

  const handleDeleteSubCategory = async (key: string, label: string) => {
    if (!window.confirm(`Hapus sub-kategori "${label}"?`)) return;
    try {
      await adminApi.deleteSubCategory(key);
      onShowAlert(`Sub-kategori "${label}" berhasil dihapus.`);
      await fetchSubCategories();
    } catch (err: any) {
      onShowAlert(err.message || 'Gagal menghapus sub-kategori.');
    }
  };

  const startEditSubCat = (sc: any, e: React.MouseEvent<HTMLButtonElement>) => {
    subCatEditTriggerRef.current = e.currentTarget;
    setSubCatEditingKey(sc.key);
    setSubCatFormKey(sc.key);
    setSubCatFormLabel(sc.label);
    setSubCatFormParentKey(sc.parentKey);
    setIsCreatingSub(false);

    // WCAG focus lock: focus on label input
    setTimeout(() => {
      const input = document.getElementById('subcat-form-label-field');
      if (input) input.focus();
    }, 50);
  };

  const cancelEditSubCat = () => {
    setSubCatEditingKey(null);
    setSubCatFormKey('');
    setSubCatFormLabel('');
    setSubCatFormParentKey('');
    setIsCreatingSub(false);

    // Focus restoration
    if (subCatEditTriggerRef.current) {
      subCatEditTriggerRef.current.focus();
      subCatEditTriggerRef.current = null;
    }
  };

  const pendingQuestions = allQuestions.filter(q => q.status === 'pending');

  return (
    <div id="admin-dashboard-view" className="bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-6 shadow-xl space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-white uppercase flex items-center gap-2">
            <Shield className="text-amber-500" size={24} />
            <span>Panel Panel Kontrol Admin</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-medium">
            Halo Admin @{currentUser.username}! Anda memiliki hak penuh untuk mengakses CRUD, kelola user, dan menyetujui saran pertanyaan.
          </p>
        </div>
        <button
          onClick={onBackToGame}
          className="px-4 py-2 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-750 rounded-xl text-xs font-black uppercase transition cursor-pointer"
        >
          ← Kembali Ke Game
        </button>
      </div>

      {/* WCAG Accessible Admin Tabs */}
      <div className="flex flex-wrap border-b border-neutral-800 bg-neutral-950/40 rounded-xl p-1 gap-1" role="tablist">
        
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'users' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
          }`}
          role="tab"
          aria-selected={activeTab === 'users'}
          aria-label="Tab Pengaturan Akun Member"
        >
          <Users size={14} />
          <span>Kelola Pemain ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'questions' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
          }`}
          role="tab"
          aria-selected={activeTab === 'questions'}
          aria-label="Tab Pengaturan Bank Soal Game"
        >
          <BookOpen size={14} />
          <span>Bank Soal ({allQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide flex items-center gap-2 transition relative cursor-pointer ${
            activeTab === 'approvals' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
          }`}
          role="tab"
          aria-selected={activeTab === 'approvals'}
          aria-label="Tab Antrean Persetujuan Saran"
        >
          <CheckSquare size={14} />
          <span>Persetujuan</span>
          {pendingQuestions.length > 0 && (
            <span className="absolute -top-1.5 -right-1 bg-red-650 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold">
              {pendingQuestions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'categories' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
          }`}
          role="tab"
          aria-selected={activeTab === 'categories'}
          aria-label="Tab Pengaturan CSS Warna Kategori"
        >
          <Layers size={14} />
          <span>Setting Kategori</span>
        </button>

        <button
          onClick={() => setActiveTab('feedbacks')}
          className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'feedbacks' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
          }`}
          role="tab"
          aria-selected={activeTab === 'feedbacks'}
          aria-label="Tab Penilaian & Koreksi Kenyamanan Anggota"
        >
          <MessageSquare size={14} />
          <span>Laporan Feedback ({feedbacksList.length})</span>
        </button>

      </div>

      {/* Tab Workspaces */}
      <div className="pt-2">

        {/* 1. USERS TAB: CRUD REGISTRATION FOR ADMINS */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form User Builder (Col span 4) */}
            <form onSubmit={handleUserSubmit} className="lg:col-span-4 bg-neutral-950/40 border-2 border-neutral-850 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                <Plus size={14} />
                <span>{editingUser ? 'Ubah Profil Anggota' : 'Daftarkan Manual Anggota'}</span>
              </h3>

              <div className="space-y-1">
                <label htmlFor="adm-user-username" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                  Nama Pengguna (Username)
                </label>
                <input
                  id="adm-user-username"
                  type="text"
                  required
                  value={userFormUsername}
                  onChange={(e) => setUserFormUsername(e.target.value)}
                  placeholder="Contoh: agus_setiawan"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="adm-user-email" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                  Alamat Email
                </label>
                <input
                  id="adm-user-email"
                  type="email"
                  required
                  value={userFormEmail}
                  onChange={(e) => setUserFormEmail(e.target.value)}
                  placeholder="Contoh: agus@mail.com"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {!editingUser && (
                <div className="space-y-1">
                  <label htmlFor="adm-user-password" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                    Sandi Akun (Password)
                  </label>
                  <input
                    id="adm-user-password"
                    type="password"
                    required
                    value={userFormPassword}
                    onChange={(e) => setUserFormPassword(e.target.value)}
                    placeholder="Sandi minimal 6 karakter..."
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="adm-user-role" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                    Peran (Role)
                  </label>
                  <select
                    id="adm-user-role"
                    value={userFormRole}
                    onChange={(e) => setUserFormRole(e.target.value as any)}
                    className="w-full px-2 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none"
                  >
                    <option value="user">User Biasa</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="adm-user-status" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                    Status Akun
                  </label>
                  <select
                    id="adm-user-status"
                    value={userFormStatus}
                    onChange={(e) => setUserFormStatus(e.target.value as any)}
                    className="w-full px-2 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none"
                  >
                    <option value="active">Aktif (Active)</option>
                    <option value="suspended">Ditangguhkan</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-655 text-black font-extrabold uppercase rounded-lg text-xs tracking-wider cursor-pointer"
                >
                  {editingUser ? 'Simpan' : 'Buat User'}
                </button>
                {editingUser && (
                  <button
                    type="button"
                    onClick={cancelEditUser}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg text-xs"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>

            {/* List Table Users (Col span 8) */}
            <div className="lg:col-span-8 overflow-x-auto bg-neutral-950/20 border border-neutral-850 rounded-2xl p-4">
              <table className="w-full text-left border-collapse" aria-label="Tabel List Seluruh Anggota Terdaftar">
                <caption className="sr-only">Tabel ini berisi informasi akun, role, dan tombol suspensi.</caption>
                <thead>
                  <tr className="border-b border-neutral-805 text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                    <th scope="col" className="p-3">Nama Pengguna</th>
                    <th scope="col" className="p-3">Email</th>
                    <th scope="col" className="p-3">Hak Akses</th>
                    <th scope="col" className="p-3">Keadaan</th>
                    <th scope="col" className="p-3 text-right">Opsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-855 text-xs font-semibold text-neutral-300">
                  {allUsers.map(user => (
                    <tr key={user.id} className="hover:bg-neutral-900/30 transition">
                      <td className="p-3 font-bold text-white">@{user.username}</td>
                      <td className="p-3 text-neutral-400">{user.email || 'N/A'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          user.role === 'admin' ? 'bg-amber-950/50 text-amber-300 border border-amber-800' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          user.status === 'suspended' ? 'bg-red-950/50 text-red-450 border border-red-800' : 'bg-emerald-950/50 text-emerald-455 border border-emerald-800'
                        }`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="p-3 text-right flex justify-end gap-1">
                        <button
                          onClick={() => startEditUser(user)}
                          className="p-1 px-2.5 bg-neutral-850 hover:bg-neutral-750 text-neutral-300 rounded border border-neutral-750 cursor-pointer text-[10px]"
                          aria-label={`Ubah profil ${user.username}`}
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-350 rounded border border-rose-500/20 cursor-pointer"
                          aria-label={`Hapus user ${user.username}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* 2. BANK SOAL GAME CRUD TAB */}
        {activeTab === 'questions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form ToD Creation (Col span 4) */}
            <div className="lg:col-span-4 space-y-6">
              <form onSubmit={handleQSubmit} className="bg-neutral-950/40 border-2 border-neutral-850 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">
                {editingQ ? 'Modifikasi Kartu ToD' : 'Buat Kartu ToD Baru'}
              </h3>

              <div className="space-y-1">
                <label htmlFor="adm-q-category" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">
                  Kategori Utama
                </label>
                <select
                  id="adm-q-category"
                  value={qFormCategory}
                  onChange={(e) => {
                    setQFormCategory(e.target.value);
                    setQFormSubCategory(''); // Reset sub-category on change
                  }}
                  className="w-full px-2 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none"
                >
                  {catsList.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 block">
                <label htmlFor="adm-q-subcategory" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">
                  Sub-kategori (Opsional)
                </label>
                <select
                  id="adm-q-subcategory"
                  value={qFormSubCategory}
                  onChange={(e) => setQFormSubCategory(e.target.value)}
                  className="w-full px-2 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none"
                >
                  <option value="">-- Tanpa Sub-kategori --</option>
                  {subCatsList.filter(sc => sc.parentKey === qFormCategory).map(sc => (
                    <option key={sc.key} value={sc.key}>{sc.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="adm-q-type" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                  Tipe Permainan
                </label>
                <select
                  id="adm-q-type"
                  value={qFormType}
                  onChange={(e) => setQFormType(e.target.value as any)}
                  className="w-full px-2 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none"
                >
                  <option value="truth">Kejujuran (Truth)</option>
                  <option value="dare">Tantangan (Dare)</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="adm-q-text-formal" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                    Versi Baku (Formal)
                  </label>
                  <button
                    type="button"
                    onClick={generateCasualText}
                    disabled={generatingCasual || !qFormText.trim()}
                    className="text-[10px] font-black bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-black px-2 py-1 rounded-md transition-colors focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase tracking-wider"
                    aria-label="Generate versi kekinian menggunakan AI"
                  >
                    {generatingCasual ? 'Generating...' : 'AI Generate'}
                  </button>
                </div>
                <textarea
                  id="adm-q-text-formal"
                  required
                  rows={3}
                  value={qFormText}
                  onChange={(e) => setQFormText(e.target.value)}
                  placeholder="Ketik isi kartu truth or dare versi formal (baku)..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-semibold text-white"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="adm-q-text-casual" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                  Versi Kekinian (Casual)
                </label>
                <textarea
                  id="adm-q-text-casual"
                  rows={3}
                  value={qFormTextCasual}
                  onChange={(e) => setQFormTextCasual(e.target.value)}
                  placeholder="Isi versi santai/kekinian, atau klik AI Generate di atas..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-semibold text-white"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="adm-q-status" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                  Status Validasi Kartu
                </label>
                <select
                  id="adm-q-status"
                  value={qFormStatus}
                  onChange={(e) => setQFormStatus(e.target.value as any)}
                  className="w-full px-2 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none"
                >
                  <option value="approved">Disetujui (Approved / Aktif)</option>
                  <option value="pending">Tertunda (Pending)</option>
                  <option value="rejected">Ditolak (Rejected)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase rounded-lg text-xs"
                >
                  {editingQ ? 'Simpan' : 'Buat Baru'}
                </button>
                {editingQ && (
                  <button
                    type="button"
                    onClick={cancelEditQ}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg text-xs"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>

            {/* Fast Question Generator Card */}
            <div className="bg-neutral-950/40 border-2 border-neutral-850 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                <span>⚡ Fast Question Generator</span>
              </h3>
              <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                Hasilkan secara instan 1 kartu Truth & 1 kartu Dare berdasarkan kategori, sub-kategori, dan mode bermain pilihan Anda melalui AI (Gemini).
              </p>

              {/* Main Category Selector */}
              <div className="space-y-1">
                <label htmlFor="fast-q-category" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">
                  Kategori Utama
                </label>
                <select
                  id="fast-q-category"
                  value={fastCategory}
                  onChange={(e) => handleFastCategoryChange(e.target.value as any)}
                  className="w-full px-2 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none"
                >
                  <option value="asmara">Asmara</option>
                  <option value="pertemanan">Pertemanan</option>
                  <option value="keluarga">Keluarga</option>
                </select>
              </div>

              {/* Sub Category Selector */}
              <div className="space-y-1">
                <label htmlFor="fast-q-subcategory" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">
                  Sub-Kategori
                </label>
                <select
                  id="fast-q-subcategory"
                  value={fastSubCategory}
                  onChange={(e) => setFastSubCategory(e.target.value)}
                  className="w-full px-2 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none"
                >
                  {fastCategory === 'asmara' && (
                    <>
                      <option value="pdkt">PDKT</option>
                      <option value="pacaran">Pacaran</option>
                      <option value="pernikahan">Pernikahan</option>
                    </>
                  )}
                  {fastCategory === 'pertemanan' && (
                    <>
                      <option value="circle">Circle</option>
                      <option value="tongkrongan">Tongkrongan</option>
                      <option value="drama">Drama</option>
                    </>
                  )}
                  {fastCategory === 'keluarga' && (
                    <>
                      <option value="ortu-anak">Orang Tua</option>
                      <option value="saudara">Kakak Adik</option>
                      <option value="keluarga-besar">Keluarga Besar</option>
                    </>
                  )}
                </select>
              </div>

              {/* Play Mode Selector */}
              <div className="space-y-1">
                <label htmlFor="fast-q-playmode" className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block">
                  Play Mode
                </label>
                <select
                  id="fast-q-playmode"
                  value={fastPlayMode}
                  onChange={(e) => setFastPlayMode(e.target.value as any)}
                  className="w-full px-2 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none"
                >
                  <option value="online">online</option>
                  <option value="offline">offline</option>
                </select>
              </div>

              {/* Button Action */}
              <button
                type="button"
                disabled={generatingFast}
                onClick={handleGenerateFastQuestions}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-extrabold uppercase rounded-xl text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{generatingFast ? '⏳ Menghasilkan...' : '⚡ Generate 1 Truth & 1 Dare'}</span>
              </button>
            </div>
          </div>

            {/* List Table Questions (Col span 8) */}
            <div className="lg:col-span-8 overflow-y-auto max-h-[500px] bg-neutral-950/20 border border-neutral-855 rounded-2xl p-4">
              <table className="w-full text-left border-collapse" aria-label="Tabel List Bank Soal Game">
                <thead>
                  <tr className="border-b border-neutral-805 text-[10px] font-black text-neutral-500 uppercase">
                    <th scope="col" className="p-3">Tipe</th>
                    <th scope="col" className="p-3">Kategori</th>
                    <th scope="col" className="p-3">Isi Teks Kartu</th>
                    <th scope="col" className="p-3">Status</th>
                    <th scope="col" className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-855 text-xs font-semibold text-neutral-300">
                  {allQuestions.map(q => (
                    <tr key={q.id} className="hover:bg-neutral-900/30 transition">
                      <td className="p-3 font-bold">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          q.type === 'truth' ? 'bg-red-950/50 text-red-400' : 'bg-neutral-800 text-amber-300'
                        }`}>
                          {q.type}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-neutral-400">
                        <span className="capitalize">{catsList.find(c => c.key === q.category)?.label || q.category}</span>
                        {q.subCategory && (
                          <span className="text-[10px] text-amber-500 block font-black uppercase mt-1">
                            ↳ {subCatsList.find(sc => sc.key === q.subCategory)?.label || q.subCategory}
                          </span>
                        )}
                      </td>
                      <td className="p-3 max-w-[200px] truncate text-white" title={q.text_formal || q.text}>
                        <div className="font-semibold truncate">"{q.text_formal || q.text}"</div>
                        {q.text_casual && <div className="text-[10px] text-neutral-400 mt-0.5 truncate italic">Gaul: "{q.text_casual}"</div>}
                      </td>
                      <td className="p-3">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          q.status === 'approved' ? 'bg-emerald-950/40 text-emerald-400' : q.status === 'rejected' ? 'bg-rose-950/40 text-rose-400' : 'bg-amber-950/40 text-amber-400'
                        }`}>
                          {q.status || 'approved'}
                        </span>
                      </td>
                      <td className="p-3 text-right flex justify-end gap-1">
                        <button
                          onClick={() => startEditQ(q)}
                          className="p-1 px-2.5 bg-neutral-850 hover:bg-neutral-750 text-neutral-300 rounded border border-neutral-750 text-[10px]"
                          aria-label={`Ubah pertanyaan ${q.id}`}
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => handleDeleteQ(q.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-350 rounded border border-rose-500/20"
                          aria-label={`Hapus pertanyaan ${q.id}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* 3. QUESTION APPROVALS QUEUE MODULE */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <CheckSquare size={15} />
              <span>Antrean Moderasi Kasus Saran Game ({pendingQuestions.length})</span>
            </h3>

            {pendingQuestions.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border-2 border-dashed border-neutral-800 text-neutral-500 text-xs italic bg-neutral-950/10">
                Tidak ada antrean saran pertanyaan tertunda (pending) saat ini. Bermain game berjalan aman!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-5 bg-neutral-950/40 border-2 border-amber-500/20 rounded-2xl flex flex-col justify-between space-y-4 shadow"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          q.type === 'truth' ? 'bg-red-950 text-red-400 border border-red-900' : 'bg-neutral-900 text-yellow-300 border border-neutral-800'
                        }`}>
                          {q.type === 'truth' ? 'Truth' : 'Dare'}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-bold uppercase">
                          Kategori: /{q.category}
                        </span>
                        <span className="ml-auto text-[10px] text-amber-400 font-black">
                          Oleh: @{q.username || 'Pemain'}
                        </span>
                      </div>

                      <div className="text-sm text-neutral-100 font-bold leading-relaxed italic space-y-1">
                        <div>Baku: "{q.text_formal || q.text}"</div>
                        {q.text_casual && <div className="text-xs text-neutral-400 font-medium font-sans">Gaul: "{q.text_casual}"</div>}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-neutral-900/40">
                      <button
                        onClick={() => handleApprove(q.id)}
                        className="flex-1 py-1 px-3 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold uppercase rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                        aria-label="Setujui pertanyaan"
                      >
                        <Check size={13} />
                        <span>Setujui</span>
                      </button>
                      <button
                        onClick={() => handleReject(q.id)}
                        className="py-1 px-3 bg-rose-500/10 text-rose-350 hover:bg-rose-500/20 border border-rose-500/25 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                        aria-label="Tolak pertanyaan"
                      >
                        <X size={13} />
                        <span>Tolak</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. MANAGE DYNAMIC CATEGORIES & HIGH CONTRAST VARIABLES */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-xs text-neutral-400 leading-relaxed font-semibold">
              <strong className="text-amber-400 uppercase">Perhatian Teknis:</strong> Di bawah ini Admin memegang kendali penamaan kategori utama beserta sub-kategori relasional secara dinamis. Anda juga dapat mengatur skema warna heksadesimal visual kontras tinggi (High Contrast CSS) guna kegunaan WCAG Level AA bagi penyandang buta warna parsial.
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex border-b border-neutral-800 gap-4" role="tablist" aria-label="Sub-kategori Kendali">
              <button
                type="button"
                id="subtab-main-categories"
                role="tab"
                onClick={() => setCatConfigSubTab('main')}
                className={`pb-2 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition ${
                  catConfigSubTab === 'main' ? 'border-amber-500 text-amber-400 font-extrabold' : 'border-transparent text-neutral-450 hover:text-neutral-200'
                }`}
                aria-selected={catConfigSubTab === 'main'}
                aria-controls="subtab-panel-main"
              >
                Kategori Utama ({catsList.length})
              </button>
              <button
                type="button"
                id="subtab-sub-categories"
                role="tab"
                onClick={() => setCatConfigSubTab('sub')}
                className={`pb-2 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition ${
                  catConfigSubTab === 'sub' ? 'border-amber-500 text-amber-400 font-extrabold' : 'border-transparent text-neutral-450 hover:text-neutral-200'
                }`}
                aria-selected={catConfigSubTab === 'sub'}
                aria-controls="subtab-panel-sub"
              >
                Sub-kategori ({subCatsList.length})
              </button>
            </div>

            {/* PANEL 1: KATEGORI UTAMA (Main Categories List + Form) */}
            {catConfigSubTab === 'main' && (
              <div id="subtab-panel-main" role="tabpanel" aria-labelledby="subtab-main-categories" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Main Category CRUD Form (Col Span 4) */}
                <form
                  onSubmit={catEditingKey ? handleUpdateCategorySave : handleCreateCategory}
                  className="lg:col-span-4 bg-neutral-950/45 border-2 border-neutral-850 p-5 rounded-2xl space-y-4"
                >
                  <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                    {catEditingKey ? 'Modifikasi Kategori Utama' : 'Tambah Kategori Utama Baru'}
                  </h3>

                  <div className="space-y-1">
                    <label htmlFor="cat-form-key-field" className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                      Kunci Unik Kategori (Hanya Huruf, E.g. asmara)
                    </label>
                    <input
                      id="cat-form-key-field"
                      type="text"
                      required
                      placeholder="e.g. asmara"
                      readOnly={!!catEditingKey}
                      value={catFormKey}
                      onChange={(e) => setCatFormKey(e.target.value)}
                      className={`w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none ${
                        catEditingKey ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="cat-form-label-field" className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                      Nama Label Kategori (E.g. Asmara ❤️)
                    </label>
                    <input
                      id="cat-form-label-field"
                      type="text"
                      required
                      placeholder="e.g. Asmara ❤️"
                      value={catFormLabel}
                      onChange={(e) => setCatFormLabel(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="cat-form-color-normal" className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                        Warna Utama (Normal)
                      </label>
                      <input
                        id="cat-form-color-normal"
                        type="color"
                        value={catFormColorNormal}
                        onChange={(e) => setCatFormColorNormal(e.target.value)}
                        className="w-full h-9 p-0.5 bg-neutral-900 border border-neutral-800 rounded-xl cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="cat-form-color-contrast" className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                        Warna Kontras (Teks/Aksen)
                      </label>
                      <input
                        id="cat-form-color-contrast"
                        type="color"
                        value={catFormColorContrast}
                        onChange={(e) => setCatFormColorContrast(e.target.value)}
                        className="w-full h-9 p-0.5 bg-neutral-900 border border-neutral-800 rounded-xl cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase rounded-lg text-xs"
                    >
                      {catEditingKey ? 'Simpan' : 'Buat Baru'}
                    </button>
                    {(catEditingKey || catFormKey || catFormLabel) && (
                      <button
                        type="button"
                        onClick={cancelEditCat}
                        className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg text-xs cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </form>

                {/* Main Category List Table (Col Span 8) */}
                <div className="lg:col-span-8 overflow-x-auto bg-neutral-950/20 border border-neutral-855 rounded-2xl p-4">
                  <table className="w-full text-left border-collapse" aria-label="Tabel List Kategori Utama">
                    <caption className="sr-only">Tabel ini menampilkan daftar kategori utama yang aktif pada permainan beserta aksi pengeditan/penghapusan.</caption>
                    <thead>
                      <tr className="border-b border-neutral-805 text-[10px] font-black text-neutral-500 uppercase">
                        <th scope="col" className="p-3">Kunci (Key)</th>
                        <th scope="col" className="p-3">Nama Label Kategori</th>
                        <th scope="col" className="p-3">Warna Utama</th>
                        <th scope="col" className="p-3">Warna Kontras</th>
                        <th scope="col" className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-855 text-xs font-semibold text-neutral-300">
                      {catsList.map((cat) => (
                        <tr key={cat.key} className="hover:bg-neutral-900/30 transition">
                          <td className="p-3 font-mono text-neutral-400 font-bold">/{cat.key}</td>
                          <td className="p-3 font-bold text-white flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.colorNormal }} />
                            <span>{cat.label}</span>
                          </td>
                          <td className="p-3 font-mono text-neutral-400">{cat.colorNormal}</td>
                          <td className="p-3 font-mono text-neutral-400" style={{ color: cat.colorContrast }}>{cat.colorContrast}</td>
                          <td className="p-3 text-right flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => startEditCat(cat, e)}
                              className="p-1 px-2.5 bg-neutral-850 hover:bg-neutral-750 text-neutral-300 rounded border border-neutral-750 text-[10px]"
                              aria-label={`Ubah kategori ${cat.label}`}
                            >
                              Ubah
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.key, cat.label)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-350 rounded border border-rose-500/20 cursor-pointer"
                              aria-label={`Hapus kategori ${cat.label}`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* PANEL 2: SUB-KATEGORI (Sub-categories List + Form with semantic drop-down parent binding) */}
            {catConfigSubTab === 'sub' && (
              <div id="subtab-panel-sub" role="tabpanel" aria-labelledby="subtab-sub-categories" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Subcategory CRUD Form (Col Span 4) */}
                <form
                  onSubmit={subCatEditingKey ? handleUpdateSubCategorySave : handleCreateSubCategory}
                  className="lg:col-span-4 bg-neutral-950/45 border-2 border-neutral-855 p-5 rounded-2xl space-y-4"
                >
                  <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                    {subCatEditingKey ? 'Modifikasi Sub-kategori' : 'Tambah Sub-kategori Baru'}
                  </h3>

                  <div className="space-y-1">
                    <label htmlFor="subcat-form-key-field" className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                      Kunci Unik Sub-kategori (Hanya Huruf, E.g. pdkt)
                    </label>
                    <input
                      id="subcat-form-key-field"
                      type="text"
                      required
                      placeholder="e.g. pdkt"
                      readOnly={!!subCatEditingKey}
                      value={subCatFormKey}
                      onChange={(e) => setSubCatFormKey(e.target.value)}
                      className={`w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none ${
                        subCatEditingKey ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="subcat-form-label-field" className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                      Nama Label Sub-kategori (E.g. PDKT)
                    </label>
                    <input
                      id="subcat-form-label-field"
                      type="text"
                      required
                      placeholder="e.g. PDKT"
                      value={subCatFormLabel}
                      onChange={(e) => setSubCatFormLabel(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="subcat-form-parent-field" className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">
                      Kategori Induk (Bind Parent)
                    </label>
                    <select
                      id="subcat-form-parent-field"
                      required
                      value={subCatFormParentKey}
                      onChange={(e) => setSubCatFormParentKey(e.target.value)}
                      className="w-full px-2 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-205 text-xs focus:outline-none"
                    >
                      <option value="">-- Hubungkan Kategori Induk --</option>
                      {catsList.map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.label} (/{cat.key})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase rounded-lg text-xs"
                    >
                      {subCatEditingKey ? 'Simpan' : 'Buat Baru'}
                    </button>
                    {(subCatEditingKey || subCatFormKey || subCatFormLabel || subCatFormParentKey) && (
                      <button
                        type="button"
                        onClick={cancelEditSubCat}
                        className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg text-xs cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </form>

                {/* Sub-category List Table (Col Span 8) */}
                <div className="lg:col-span-8 overflow-x-auto bg-neutral-950/20 border border-neutral-855 rounded-2xl p-4">
                  {loadingSubCats ? (
                    <div className="p-12 text-center text-xs text-neutral-500">Memuat sub-kategori...</div>
                  ) : (
                    <table className="w-full text-left border-collapse" aria-label="Tabel List Sub-kategori Terdaftar">
                      <caption className="sr-only">Tabel ini berisi informasi sub-kategori relasional serta fungsionalitas CRUD.</caption>
                      <thead>
                        <tr className="border-b border-neutral-805 text-[10px] font-black text-neutral-500 uppercase">
                          <th scope="col" className="p-3">Kunci (Key)</th>
                          <th scope="col" className="p-3">Nama Label Sub-kategori</th>
                          <th scope="col" className="p-3">Kategori Induk (Parent Bound)</th>
                          <th scope="col" className="p-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-855 text-xs font-semibold text-neutral-300">
                        {subCatsList.map((sc) => (
                          <tr key={sc.key} className="hover:bg-neutral-900/30 transition">
                            <td className="p-3 font-mono text-neutral-400 font-bold">/{sc.key}</td>
                            <td className="p-3 font-bold text-white">{sc.label}</td>
                            <td className="p-3">
                              <span className="p-1 bg-neutral-900 border border-neutral-800 rounded font-mono text-[10px] text-amber-500 uppercase">
                                {catsList.find((c) => c.key === sc.parentKey)?.label || `/${sc.parentKey}`}
                              </span>
                            </td>
                            <td className="p-3 text-right flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={(e) => startEditSubCat(sc, e)}
                                className="p-1 px-2.5 bg-neutral-850 hover:bg-neutral-750 text-neutral-300 rounded border border-neutral-750 text-[10px]"
                                aria-label={`Ubah sub-kategori ${sc.label}`}
                              >
                                Ubah
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSubCategory(sc.key, sc.label)}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-350 rounded border border-rose-500/20 cursor-pointer"
                                aria-label={`Hapus sub-kategori ${sc.label}`}
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* 5. USER FEEDBACK REPORTS VIEWER */}
        {activeTab === 'feedbacks' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <MessageSquare size={15} />
              <span>Daftar Masukan Kemudahan Layanan Anggota ({feedbacksList.length})</span>
            </h3>

            {feedbacksList.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border-2 border-dashed border-neutral-800 text-neutral-500 text-xs italic bg-neutral-950/10">
                Belum ada laporan Kenyamanan Visual / WCAG terkumpul di database.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbacksList.map((feed) => (
                  <div key={feed.id} className="p-4 bg-neutral-950/30 border-2 border-neutral-850 rounded-2xl relative space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="p-1 px-2.5 bg-neutral-900 border border-neutral-800 rounded text-[9px] font-black text-amber-5 font-mono uppercase">
                        {feed.category}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono font-semibold">
                        {new Date(feed.date).toLocaleDateString('id-ID')}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-200 font-bold leading-relaxed">
                      "{feed.comment}"
                    </p>

                    <div className="pt-2 border-t border-neutral-900/35 text-[10px] text-neutral-500">
                      Pelapor: <strong className="text-neutral-400">@{feed.name}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
