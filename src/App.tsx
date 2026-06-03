/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Users,
  Award,
  Heart,
  UserPlus,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
  FolderHeart,
  Plus,
  Trash,
  ChevronRight,
  Accessibility,
  UserCheck,
  LayoutGrid,
  CheckCircle2,
  History,
  TrendingUp,
  XCircle,
  ShieldCheck,
  RefreshCw,
  Globe
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { Question, Player, CategoryKey, User, GameState, TTSPlayerConfig, GameCategory } from './types';
import { authApi, questionApi } from './lib/api';
import Modal from './components/Modal';
import A11ySettings from './components/A11ySettings';
import AuthModal from './components/AuthModal';
import CustomQuestionsManager from './components/CustomQuestionsManager';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import { PageTransition, AnimatedCard, AnimatedTextSwitcher } from './components/AnimatedComponents';

export default function App() {
  // Navigation / App State
  const [screen, setScreen] = useState<'home' | 'players' | 'mode' | 'category' | 'board' | 'user-dashboard' | 'admin-dashboard'>('home');
  const [selectedPlayMode, setSelectedPlayMode] = useState<'offline' | 'online'>('offline');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Dynamic Categories normal / contrast styles list
  const [categoriesList, setCategoriesList] = useState<GameCategory[]>([
    { key: 'asmara', label: 'Asmara ❤️', colorNormal: '#450a0a', colorContrast: '#fef08a' },
    { key: 'pertemanan', label: 'Pertemanan 🤝', colorNormal: '#0c1e30', colorContrast: '#e0f2fe' },
    { key: 'keluarga', label: 'Keluarga 🏡', colorNormal: '#062c16', colorContrast: '#d1fae5' }
  ]);
  const [subCategoriesList, setSubCategoriesList] = useState<any[]>([]);
  const [currentSubCategory, setCurrentSubCategory] = useState<string>('');

  // Accessible System Defaults
  const [fontSizeSetting, setFontSizeSetting] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrastEnabled, setHighContrastEnabled] = useState(false);
  const [tone, setTone] = useState<'formal' | 'casual'>(() => {
    try {
      const saved = localStorage.getItem('tod_tone_preference');
      return (saved === 'casual') ? 'casual' : 'formal';
    } catch {
      return 'formal';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tod_tone_preference', tone);
    } catch (e) {
      console.warn('Could not save tone preference to localStorage', e);
    }
  }, [tone]);
  const [ttsConfig, setTtsConfig] = useState<TTSPlayerConfig>({
    enabled: true,
    rate: 1.0,
    pitch: 1.0
  });

  // Active Players Input State
  const [playerInput, setPlayerInput] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);

  // Current Active Game setup states
  const [currentCategory, setCurrentCategory] = useState<CategoryKey>('pertemanan');
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    categories: ['asmara', 'pertemanan', 'keluarga'],
    currentCategory: null,
    activePlayerIndex: 0,
    askedQuestionIds: [],
    history: []
  });

  // Active Card Modal display states  
  const [activeCardModalOpen, setActiveCardModalOpen] = useState(false);
  const [activeCardType, setActiveCardType] = useState<'truth' | 'dare' | null>(null);
  const [activeCardQuestion, setActiveCardQuestion] = useState<Question | null>(null);
  const [exhaustionNotice, setExhaustionNotice] = useState<string>('');

  // Auxiliary UI dialogs modal openers
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'user' | 'admin'>('user');
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [showAbortModal, setShowAbortModal] = useState(false);
  const [globalAlertMessage, setGlobalAlertMessage] = useState<string | null>(null);
  const [changeCategoryModalOpen, setChangeCategoryModalOpen] = useState(false);

  // Initial loads
  useEffect(() => {
    // 1. Verify User Session
    const checkMe = async () => {
      try {
        const data = await authApi.getMe();
        if (data.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.warn('Session loading failed initially, likely offline/sandbox', err);
      }
    };

    // 2. Load Question database
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const data = await questionApi.getQuestions();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        }
      } catch (err) {
        console.error('Failed to load questions from endpoint.', err);
      } finally {
        setLoading(false);
      }
    };

    checkMe();
    loadQuestions();

    // Load active categories and sub-categories from database
    const loadCatsAndSubs = async () => {
      try {
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (catData.categories && catData.categories.length > 0) {
          setCategoriesList(catData.categories);
        }

        const subRes = await fetch('/api/subcategories');
        const subData = await subRes.json();
        if (subData.subCategories) {
          setSubCategoriesList(subData.subCategories);
        }
      } catch (err) {
        console.warn('Failed to fetch categories/subcategories initially', err);
      }
    };
    loadCatsAndSubs();
  }, []);

  // Sync high contrast and accessibility font sizing physically with HTML document root node
  useEffect(() => {
    const root = document.documentElement;
    if (fontSizeSetting === 'large') {
      root.style.fontSize = '120%';
    } else if (fontSizeSetting === 'xlarge') {
      root.style.fontSize = '135%';
    } else {
      root.style.fontSize = '100%';
    }
  }, [fontSizeSetting]);

  // Update questions regularly when requested (e.g., custom actions updated)
  const refreshQuestions = async () => {
    try {
      const data = await questionApi.getQuestions();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.warn('Silent fallback on questions reload exception', err);
    }
  };

  // Manual speak function for the active question (independent of auto-TTS config)
  const speakActiveQuestion = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const sentence = new SpeechSynthesisUtterance(text);
      sentence.lang = 'id-ID';
      sentence.pitch = ttsConfig.pitch;
      sentence.rate = ttsConfig.rate;
      window.speechSynthesis.speak(sentence);
    } catch (err) {
      console.warn('Speech synthesis error', err);
    }
  };

  // Keep the useEffect hook ONLY for the cleanup function
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeCardQuestion, activeCardModalOpen]);

  // 1. Add Player Handler
  const handleAddPlayer = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const nameStr = playerInput.trim();
    if (!nameStr) return;

    if (players.length >= 10) {
      setGlobalAlertMessage('Maksimal jumlah pemain adalah 10 orang demi kenyamanan bernavigasi.');
      return;
    }

    const newColorPalette = [
      'bg-indigo-500', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500',
      'bg-sky-500', 'bg-fuchsia-500', 'bg-teal-500', 'bg-orange-500'
    ];
    const pickedColor = newColorPalette[players.length % newColorPalette.length];

    const newP: Player = {
      id: 'player_' + Math.random().toString(36).substring(2, 9),
      name: nameStr,
      avatarColor: pickedColor
    };

    setPlayers([...players, newP]);
    setPlayerInput('');
  }, [playerInput, players]);

  // 2. Remove Player Handler
  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  // 3. Start Game transition
  const handleStartGame = () => {
    if (players.length < 2) {
      setGlobalAlertMessage('Harap masukkan minimal 2 nama pemain untuk memulai permainan.');
      return;
    }
    setScreen('mode');
  };

  // 4. Select Category Layout Selection
  const handleSelectCategory = (cat: CategoryKey) => {
    setCurrentCategory(cat);
    setCurrentSubCategory(''); // Reset sub-category filter
    // Initialize board game state
    setGameState({
      players: [...players],
      categories: [cat],
      currentCategory: cat,
      activePlayerIndex: 0,
      askedQuestionIds: [],
      history: []
    });
    setScreen('board');
  };

  // 4b. Switch Category dynamically during gameplay
  const handleSwitchCategory = (cat: CategoryKey) => {
    setCurrentCategory(cat);
    setCurrentSubCategory(''); // Reset sub-category filter
    // Update game state categories & currentCategory while keeping active players and history intact!
    setGameState(prev => ({
      ...prev,
      categories: [cat],
      currentCategory: cat,
      askedQuestionIds: [] // Clear asked question IDs in newly selected category to start fresh
    }));
    setChangeCategoryModalOpen(false);

    // Automatically clear the currently displayed Truth/Dare card (reset the board view-modal)
    setActiveCardModalOpen(false);
    setActiveCardType(null);
    setActiveCardQuestion(null);
    setExhaustionNotice('');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // 5. Drawing Truth/Dare Card Handler
  const handleDrawCard = (type: 'truth' | 'dare') => {
    setExhaustionNotice('');
    // Get active player
    const activePlayer = gameState.players[gameState.activePlayerIndex];
    
    // Filter questions applicable: category matches + type matches & subCategory selection if applicable
    let pool = questions.filter(q => {
      const matchCat = q.category === currentCategory;
      const matchType = q.type === type;
      const matchSub = !currentSubCategory ? true : q.subCategory === currentSubCategory;
      const matchPlayMode = q.play_mode === undefined || q.play_mode === null || q.play_mode === '' || q.play_mode === 'both' || q.play_mode === selectedPlayMode;
      return matchCat && matchType && matchSub && matchPlayMode;
    });

    if (pool.length === 0) {
      setGlobalAlertMessage(`Maaf, tidak ditemukan kartu ${type} untuk kategori ini.`);
      return;
    }

    // Filter out already asked questions
    let freshPool = pool.filter(q => !gameState.askedQuestionIds.includes(q.id));

    let chosenQuestion: Question;

    if (freshPool.length === 0) {
      // Reached exhaustion of cards! Reset asked IDs for this card type to prevent repetition
      setExhaustionNotice('Semua kartu telah digunakan dalam sesi ini! Pertanyaan diulang kembali.');
      chosenQuestion = pool[Math.floor(Math.random() * pool.length)];
      
      // Keep state clean
      setGameState(prev => ({
        ...prev,
        askedQuestionIds: prev.askedQuestionIds.filter(id => !pool.map(q => q.id).includes(id))
      }));
    } else {
      chosenQuestion = freshPool[Math.floor(Math.random() * freshPool.length)];
      setGameState(prev => ({
        ...prev,
        askedQuestionIds: [...prev.askedQuestionIds, chosenQuestion.id]
      }));
    }

    setActiveCardType(type);
    setActiveCardQuestion(chosenQuestion);
    setActiveCardModalOpen(true);
  };

  // 6. Settle Active Modal turn step (Completed or Skipped)
  const handleSettleTurn = (isCompleted: boolean) => {
    if (!activeCardQuestion || !activeCardType) return;

    const activePlayer = gameState.players[gameState.activePlayerIndex];

    const currentText = (tone === 'casual' && activeCardQuestion.text_casual) ? activeCardQuestion.text_casual : (activeCardQuestion.text_formal || activeCardQuestion.text);

    // Log this turn to sessions ledger
    const logItem = {
      playerName: activePlayer.name,
      type: activeCardType,
      questionText: currentText,
      category: currentCategory
    };

    // Calculate next player index
    const nextIdx = (gameState.activePlayerIndex + 1) % gameState.players.length;

    setGameState(prev => ({
      ...prev,
      activePlayerIndex: nextIdx,
      history: [logItem, ...prev.history]
    }));

    // Reset card views
    setActiveCardModalOpen(false);
    setActiveCardType(null);
    setActiveCardQuestion(null);
    setExhaustionNotice('');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Back home logic
  const handleResetToHome = () => {
    setShowAbortModal(true);
  };

  // Font class switcher
  const getFontSizeClass = () => {
    if (fontSizeSetting === 'large') return 'text-lg';
    if (fontSizeSetting === 'xlarge') return 'text-xl';
    return 'text-base';
  };

  // dynamic styles configuration based on chosen category for high contrasted AA AA Level themes
  const getCategoryTheme = (): {
    bgColor: string;   // core category banner background
    textColor: string; // readable text contrast accent
    accentColor: string; // focus point highlights
    buttonBgColor: string; // solid clickers contrast
    buttonTextColor: string; // clicker contrast
  } => {
    if (highContrastEnabled) {
      return {
        bgColor: 'bg-black border-4 border-white rounded-[2.5rem]',
        textColor: 'text-yellow-300',
        accentColor: 'border-yellow-400',
        buttonBgColor: 'bg-yellow-400',
        buttonTextColor: 'text-black font-black'
      };
    }

    switch (currentCategory) {
      case 'asmara': // Maroon / Crimson theme
        return {
          bgColor: 'bg-[#450a0a]/90 border-4 border-red-700 rounded-[2.5rem]',
          textColor: 'text-red-200',
          accentColor: 'border-red-500',
          buttonBgColor: 'bg-red-650 hover:bg-red-600',
          buttonTextColor: 'text-neutral-50'
        };
      case 'pertemanan': // Amber / Yellow / Sky Theme
        return {
          bgColor: 'bg-[#0c1e30]/90 border-4 border-sky-700 rounded-[2.5rem]',
          textColor: 'text-sky-200',
          accentColor: 'border-sky-500',
          buttonBgColor: 'bg-sky-600 hover:bg-sky-500',
          buttonTextColor: 'text-neutral-50'
        };
      case 'keluarga': // Green / Emerald Theme
        return {
          bgColor: 'bg-[#062c16]/90 border-4 border-emerald-700 rounded-[2.5rem]',
          textColor: 'text-emerald-200',
          accentColor: 'border-emerald-500',
          buttonBgColor: 'bg-emerald-600 hover:bg-emerald-500',
          buttonTextColor: 'text-neutral-50'
        };
      default:
        return {
          bgColor: 'bg-neutral-900 border-4 border-neutral-700 rounded-[2.5rem]',
          textColor: 'text-amber-200',
          accentColor: 'border-amber-500',
          buttonBgColor: 'bg-amber-500 hover:bg-amber-600',
          buttonTextColor: 'text-neutral-950'
        };
    }
  };

  const themeConfig = getCategoryTheme();

  return (
    <div className={`min-h-screen bg-neutral-950 text-neutral-50 ${getFontSizeClass()} transition-colors duration-300 flex flex-col justify-between overflow-x-hidden`}>
      
      {/* Visual Header / Navigation Bar */}
      <nav id="header-nav" className="w-full border-b-2 border-neutral-850 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-45">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            id="nav-title-home-btn"
            onClick={() => {
              if (screen !== 'home') {
                setShowAbortModal(true);
              }
            }}
            className="flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 p-2.5 rounded-xl transition hover:bg-neutral-850"
          >
            <FolderHeart size={26} className="text-red-550" />
            <span className="font-display font-black text-lg tracking-tight select-none uppercase">
              Truth<span className="text-red-550 text-base ml-0.5 font-mono">Dare</span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            {/* Rules trigger */}
            <button
              id="rules-modal-trigger"
              onClick={() => setRulesModalOpen(true)}
              className="p-2 text-neutral-300 hover:text-white bg-neutral-950 border-2 border-neutral-850 rounded-xl cursor-pointer focus:ring-2 focus:ring-red-500 text-xs sm:text-sm font-black uppercase flex items-center gap-1.5 transition"
              aria-label="Petunjuk bermain aman dan aksesibel"
            >
              <HelpCircle size={16} />
              <span className="hidden sm:inline">Petunjuk</span>
            </button>

            {/* Auth section */}
            {currentUser && (
              currentUser.role === 'admin' ? (
                <button
                  id="admin-panel-toggle-btn"
                  onClick={() => setScreen(screen === 'admin-dashboard' ? 'home' : 'admin-dashboard')}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black border border-amber-400 rounded-xl text-[10px] font-black uppercase transition cursor-pointer"
                  aria-label="Buka Panel Administrator"
                >
                  Panel Admin
                </button>
              ) : (
                <button
                  id="user-panel-toggle-btn"
                  onClick={() => setScreen(screen === 'user-dashboard' ? 'home' : 'user-dashboard')}
                  className="px-3 py-1.5 bg-red-650 hover:bg-red-600 text-white border border-red-500 rounded-xl text-[10px] font-black uppercase transition cursor-pointer"
                  aria-label="Buka Dashboard Anggota"
                >
                  Dashboard Saya
                </button>
              )
            )}

            {currentUser ? (
              <button
                id="auth-modal-user-btn"
                onClick={() => setAuthModalOpen(true)}
                className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-900 text-red-100 border-2 border-neutral-850 rounded-xl text-xs font-black flex items-center gap-2"
                aria-label="Kelola Profil Akun Saya"
              >
                <div className="w-5 h-5 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center overflow-hidden border border-red-500/20">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="Avatar profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserCheck size={12} />
                  )}
                </div>
                <span>@{currentUser.username}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 font-sans">
                {/* Regular Member Login Button */}
                <button
                  id="auth-modal-login-btn"
                  onClick={() => {
                    setAuthModalType('user');
                    setAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 hover:border-red-500 rounded-lg text-[11px] text-neutral-300 font-bold transition cursor-pointer flex items-center gap-1 uppercase tracking-tight"
                  aria-label="Tombol Masuk Anggota Pemain"
                >
                  <UserCheck size={12} className="text-red-500" />
                  <span>Masuk Anggota</span>
                </button>

                {/* Secure Admin Portal Login Button */}
                <button
                  id="auth-modal-admin-login-btn"
                  onClick={() => {
                    setAuthModalType('admin');
                    setAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500 text-amber-500 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 uppercase tracking-tight"
                  aria-label="Tombol Masuk Secure Portal Admin"
                >
                  <ShieldCheck size={12} className="text-amber-500" />
                  <span>Portal Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Dynamic Workspace Canvas - Extended for Spacious Bento alignments */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-grow space-y-6" id="primary-layout-workspace">
        
        {/* Persistent Modular Keyboard Accessibility Widget */}
        <A11ySettings
          fontSizeSetting={fontSizeSetting}
          setFontSizeSetting={setFontSizeSetting}
          highContrastEnabled={highContrastEnabled}
          setHighContrastEnabled={setHighContrastEnabled}
          ttsConfig={ttsConfig}
          setTtsConfig={setTtsConfig}
          onShowAlert={(msg) => setGlobalAlertMessage(msg)}
        />

        {/* SCREEN SECTION ROUTER */}
        <AnimatePresence mode="wait">
          
          {/* 1. SCREEN: HOME SPLASH */}
          {screen === 'home' && (
            <PageTransition
              id="home-screen-module"
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Box 1: Hero Banner (Col-span-8) */}
              <div className="lg:col-span-8 bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[380px]">
                <div className="absolute top-0 right-0 p-3 opacity-10" aria-hidden="true">
                  <Sparkles size={160} className="text-red-500" />
                </div>

                <div className="space-y-4 max-w-xl relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs font-black font-mono">
                    <Sparkles size={12} />
                    <span>VERSI AKSESIBEL 2.1 (POUR)</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight tracking-tight text-white uppercase">
                    Truth or Dare <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">
                      Seru & Menyenangkan
                    </span>
                  </h1>

                  <p className="text-neutral-400 text-sm sm:text-base leading-relaxed font-medium">
                    Mainkan game kejujuran atau tantangan bersama keluarga, sahabat dekat, atau pasangan romantis. Sepenuhnya dirancang ramah pembaca layar, kontras ramah mata, serta dapat dikontrol penuh dengan keyboard.
                  </p>
                </div>

                {/* High Contrast Screen Reader Friendly Start Trigger Button */}
                <div className="pt-6 relative z-10">
                  <motion.button
                    id="start-playing-game-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setScreen('players')}
                    className="px-6 py-4 bg-red-650 hover:bg-red-600 border border-red-500 text-white font-black rounded-2xl text-md shadow-lg shadow-red-650/20 transition duration-200 cursor-pointer flex items-center justify-center gap-2 focus:ring-4 focus:ring-white"
                    aria-label="Mulai bermain kumpulkan nama pemain"
                  >
                    <Play size={18} fill="currentColor" />
                    <span>MULAI BERMAIN SESEGERA MUNGKIN</span>
                  </motion.button>
                  <p className="text-[10px] text-neutral-500 font-bold mt-2 uppercase tracking-wide">Dukung pembaca jalan (Tab / Enter) untuk navigasi mandiri.</p>
                </div>
              </div>

              {/* Box 2: Showcase Rules/Feature Info cards (Col-span-4) stacked vertically */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                <div className="p-5 bg-neutral-900 border-2 border-neutral-800 rounded-2xl flex gap-4 items-center flex-1 transition duration-200 hover:border-red-500/50">
                  <div className="p-3 bg-red-950 text-red-500 rounded-xl h-fit border border-red-800" aria-hidden="true">
                    <Heart size={20} />
                  </div>
                  <div className="space-y-0.5 animate-fade-in">
                    <h3 className="font-extrabold text-white font-display text-sm uppercase">Mode Asmara</h3>
                    <p className="text-xs text-neutral-400 font-medium leading-normal">Pertanyaan romantis yang menghangatkan hubungan bersama pasangan Anda.</p>
                  </div>
                </div>

                <div className="p-5 bg-neutral-900 border-2 border-neutral-800 rounded-2xl flex gap-4 items-center flex-1 transition duration-205 hover:border-sky-500/50">
                  <div className="p-3 bg-neutral-950 text-sky-400 rounded-xl h-fit border border-neutral-850" aria-hidden="true">
                    <Users size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-white font-display text-sm uppercase">Mode Pertemanan</h3>
                    <p className="text-xs text-neutral-400 font-medium leading-normal">Bahan perbincangan kocak dan tantangan seru bersama sahabat terbaik.</p>
                  </div>
                </div>

                <div className="p-5 bg-neutral-900 border-2 border-neutral-800 rounded-2xl flex gap-4 items-center flex-1 transition duration-210 hover:border-emerald-500/50">
                  <div className="p-3 bg-neutral-950 text-emerald-400 rounded-xl h-fit border border-neutral-850" aria-hidden="true">
                    <Award size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-white font-display text-sm uppercase">Mode Keluarga</h3>
                    <p className="text-xs text-neutral-400 font-medium leading-normal">Penuh kenangan masa lalu dan candaan hangat yang aman untuk semua umur.</p>
                  </div>
                </div>
              </div>

              {/* Box 3: Custom list of questions manager nested elegantly spanning full columns (Col-span-12) */}
              <div className="lg:col-span-12">
                <CustomQuestionsManager
                  currentUser={currentUser}
                  onOpenAuthModal={() => setAuthModalOpen(true)}
                  onQuestionsUpdated={refreshQuestions}
                  questions={questions}
                />
              </div>
            </PageTransition>
          )}

          {screen === 'user-dashboard' && currentUser && (
            <PageTransition id="user-dashboard-module">
              <UserDashboard
                currentUser={currentUser}
                categories={categoriesList}
                onShowAlert={(msg) => setGlobalAlertMessage(msg)}
                onBackToGame={() => setScreen('home')}
                highContrastEnabled={highContrastEnabled}
              />
            </PageTransition>
          )}

          {screen === 'admin-dashboard' && currentUser && (
            <PageTransition id="admin-dashboard-module">
              <AdminDashboard
                currentUser={currentUser}
                categories={categoriesList}
                onCategoriesUpdated={(newCats) => setCategoriesList(newCats)}
                onShowAlert={(msg) => setGlobalAlertMessage(msg)}
                onBackToGame={() => setScreen('home')}
                highContrastEnabled={highContrastEnabled}
              />
            </PageTransition>
          )}

          {/* 2. SCREEN: PLAYER SETTINGS */}
          {screen === 'players' && (
            <PageTransition
              id="players-screen-module"
              className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full"
            >
              {/* Form Bento Box (Col span 7) */}
              <div className="col-span-12 md:col-span-12 lg:col-span-7 bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
                
                <div>
                  {/* Back to home layout */}
                  <div className="flex items-center justify-between mb-4">
                    <motion.button
                      id="back-to-home-btn"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setScreen('home')}
                      className="text-xs text-neutral-400 hover:text-neutral-100 font-bold underline flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
                    >
                      ← Kembali ke Beranda
                    </motion.button>
                    <span className="text-[10px] text-red-500 font-black tracking-wider uppercase">Langkah 1 dari 4</span>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-2xl font-extrabold font-display text-white uppercase tracking-tight">Daftarkan Pemain Saat Ini</h2>
                    <p className="text-xs text-neutral-400 font-medium">Masukkan nama-nama pemain yang akan ikut memutar kejujuran dan tantangan secara bergantian.</p>
                  </div>
                </div>

                {/* Input form with fully accessible components (proper label bindings) */}
                <form onSubmit={handleAddPlayer} className="flex gap-2 items-end">
                  <div className="space-y-1.5 flex-1">
                    <label
                      htmlFor="player-name-input-field"
                      className="text-[10px] font-black text-neutral-500 uppercase tracking-widest"
                    >
                      Nama Peserta / Pemain baru
                    </label>
                    <input
                      id="player-name-input-field"
                      type="text"
                      value={playerInput}
                      onChange={(e) => setPlayerInput(e.target.value)}
                      placeholder="Contoh: Rian..."
                      className="w-full px-4 py-3 bg-neutral-950 border-2 border-neutral-850 rounded-xl text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-neutral-500 font-medium"
                    />
                  </div>
                  <motion.button
                    id="submit-add-player-btn"
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-red-650 hover:bg-red-600 border border-red-500 text-white font-extrabold rounded-xl transition focus:ring-2 focus:ring-red-400 cursor-pointer flex items-center gap-1.5 text-sm h-[46px]"
                    aria-label="Tambahkan kontestan pemain baru"
                  >
                    <Plus size={16} />
                    <span>Tambah</span>
                  </motion.button>
                </form>

                {/* Bottom Game Trigger action buttons */}
                <div className="pt-4 border-t border-neutral-850 flex justify-end">
                  <motion.button
                    id="btn-confirm-players"
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleStartGame}
                    disabled={players.length < 2}
                    className="w-full sm:w-auto px-6 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border-2 border-red-500 uppercase tracking-wider"
                  >
                    <span>Lanjutkan Pilih Kategori</span>
                    <ChevronRight size={16} />
                  </motion.button>
                </div>

              </div>

              {/* Players List Bento Box (Col span 5) */}
              <div className="col-span-12 md:col-span-12 lg:col-span-5 bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-xs font-black text-neutral-550 uppercase tracking-[0.2em] mb-4">Pemain Terdaftar ({players.length})</h3>

                  {players.length === 0 ? (
                    <div className="p-12 bg-neutral-950 text-center rounded-2xl border-2 border-dashed border-neutral-850 text-neutral-500 text-xs italic font-medium leading-relaxed">
                      Nama pemain kosong. Silakan masukkan minimal 2 nama di samping!
                    </div>
                  ) : (
                    <ul className="space-y-2 max-h-[280px] overflow-y-auto pr-1" role="list" aria-label="Daftar pemain terdaftar">
                      {players.map((p, idx) => (
                        <li
                          key={p.id}
                          tabIndex={0}
                          className="flex items-center justify-between p-3.5 bg-neutral-950 border-2 border-neutral-850 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-neutral-500 text-xs font-bold">#{idx + 1}</span>
                            <div className={`w-4 h-4 ${p.avatarColor} rounded-full border border-white/10`} aria-hidden="true" />
                            <span className="font-extrabold text-neutral-200">{p.name}</span>
                          </div>
                          
                          <motion.button
                            id={`remove-player-${p.id}-btn`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemovePlayer(p.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-550 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-550/20 transition cursor-pointer bg-transparent"
                            aria-label={`Hapus pemain bernama ${p.name}`}
                          >
                            <Trash size={14} />
                          </motion.button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="p-4 bg-neutral-950/45 rounded-2xl border border-neutral-850">
                  <p tabIndex={0} className="text-xs text-neutral-500 italic leading-relaxed text-center font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 rounded p-1">
                    "Permainan ini dirancang berkeadilan. Anda dapat menambah hingga maksimal 10 pemain."
                  </p>
                </div>
              </div>
            </PageTransition>
          )}
          
          {/* SCREEN: MODE SELECTION */}
          {screen === 'mode' && (
            <PageTransition
              id="mode-screen-module"
              className="space-y-6"
            >
              {/* Header Card */}
              <div className="bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <motion.button
                    id="back-to-players-from-mode-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setScreen('players')}
                    className="text-xs text-neutral-400 hover:text-neutral-100 underline flex items-center gap-1 cursor-pointer font-bold uppercase tracking-wider bg-transparent border-none outline-none"
                  >
                    ← Kembali ke Atur Pemain
                  </motion.button>
                  <span className="text-[10px] text-red-500 font-black tracking-wider uppercase">Langkah 2 dari 4</span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold font-display text-white uppercase tracking-tight">Pilih Mode Bermain</h2>
                  <p className="text-xs text-neutral-400 font-medium">
                    Sesuaikan jenis pertanyaan dan tantangan berdasarkan cara Anda bermain hari ini.
                  </p>
                </div>
              </div>

              {/* Mode Options (2 Column Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Mode: OFFLINE */}
                <motion.button
                  id="mode-offline-select-card"
                  whileHover={{ y: -4, scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedPlayMode('offline');
                    setScreen('category');
                  }}
                  className={`flex flex-col text-left p-8 bg-neutral-900 border-2 rounded-3xl shadow-xl transition-all duration-300 focus:ring-4 focus:ring-red-500 cursor-pointer min-h-[260px] justify-between group ${
                    selectedPlayMode === 'offline' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-neutral-800 hover:border-red-500/50'
                  }`}
                  aria-label="Pilih mode bermain Utama Satu Ruangan (Offline). Cocok untuk kumpul langsung secara fisik."
                >
                  <div className="p-4 bg-red-950/50 border border-red-800/60 text-red-400 rounded-2xl w-fit" aria-hidden="true">
                    <Users size={32} />
                  </div>
                  <div className="mt-6 space-y-2 flex-grow">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold font-display text-red-300 group-hover:text-red-400 uppercase tracking-tight">Main Satu Ruangan</h3>
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase text-red-400 bg-red-950/65 rounded border border-red-800/40">Offline</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
                      Main bareng secara tatap muka fisik langsung di ruangan yang sama. Sangat seru saat kumpul langsung dan berinteraksi secara fisik!
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-neutral-850 flex items-center gap-1.5 text-[10px] text-red-400 font-black uppercase tracking-widest">
                    <span>Pilih Mode Ini</span>
                    <ChevronRight size={14} className="text-red-500" />
                  </div>
                </motion.button>

                {/* Mode: ONLINE */}
                <motion.button
                  id="mode-online-select-card"
                  whileHover={{ y: -4, scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedPlayMode('online');
                    setScreen('category');
                  }}
                  className={`flex flex-col text-left p-8 bg-neutral-900 border-2 rounded-3xl shadow-xl transition-all duration-300 focus:ring-4 focus:ring-cyan-500 cursor-pointer min-h-[260px] justify-between group ${
                    selectedPlayMode === 'online' ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-neutral-800 hover:border-cyan-500/50'
                  }`}
                  aria-label="Pilih mode bermain Jarak Jauh (Online). Cocok untuk mabar via Discord atau Video Call."
                >
                  <div className="p-4 bg-cyan-950/50 border border-cyan-800/60 text-cyan-400 rounded-2xl w-fit" aria-hidden="true">
                    <Globe size={32} />
                  </div>
                  <div className="mt-6 space-y-2 flex-grow">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold font-display text-cyan-300 group-hover:text-cyan-400 uppercase tracking-tight">Main Jarak Jauh</h3>
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase text-cyan-400 bg-cyan-950/65 rounded border border-cyan-800/40">Online</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
                      Mabar seru via Discord, Zoom, WhatsApp, atau Google Meet. Sangat cocok bagi yang sedang LDR, berjauhan, atau kumpul via panggilan video!
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-neutral-850 flex items-center gap-1.5 text-[10px] text-cyan-400 font-black uppercase tracking-widest">
                    <span>Pilih Mode Ini</span>
                    <ChevronRight size={14} className="text-cyan-500" />
                  </div>
                </motion.button>
              </div>
            </PageTransition>
          )}

          {/* 3. SCREEN: CATEGORIES */}
          {screen === 'category' && (
            <PageTransition
              id="category-screen-module"
              className="space-y-6"
            >
              {/* Info Header Bento Card */}
              <div className="bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <motion.button
                    id="back-to-mode-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setScreen('mode')}
                    className="text-xs text-neutral-400 hover:text-neutral-100 underline flex items-center gap-1 cursor-pointer font-bold uppercase tracking-wider bg-transparent border-none outline-none"
                  >
                    ← Kembali ke Pilih Mode
                  </motion.button>
                  <span className="text-[10px] text-red-500 font-black tracking-wider uppercase">Langkah 3 dari 4</span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold font-display text-white uppercase tracking-tight">Pilih Kategori Hubungan</h2>
                  <p className="text-xs text-neutral-400 font-medium">
                    Pilih salah satu hubungan interaksi untuk memuat kumpulan pertanyaan serta penyesuaian visual warna kontras tinggi yang sesuai dengan kenyamanan Anda.
                  </p>
                </div>
              </div>

              {/* Relationship categories Bento Grid (3 Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                
                {/* Category: ASMARA */}
                <motion.button
                  id="category-asmara-select-card"
                  whileHover={{ y: -4, scale: 1.015 }}
                  whileTap={{ scale: 0.975 }}
                  onClick={() => handleSelectCategory('asmara')}
                  className="flex flex-col text-left p-6 bg-neutral-900 border-2 border-neutral-800 hover:border-red-500 rounded-3xl shadow-xl transition-all duration-300 focus:ring-4 focus:ring-red-500 cursor-pointer min-h-[240px] justify-between group"
                  aria-label="Pilih kategori hubungan Asmara. Menggunakan skema warna Crimson merah gelap kontras."
                >
                  <div className="p-3 bg-red-955/50 border border-red-800 text-red-450 rounded-2xl w-fit" aria-hidden="true">
                    <Heart size={28} />
                  </div>
                  <div className="mt-4 space-y-2 flex-grow">
                    <h3 className="text-lg font-extrabold font-display text-red-300 group-hover:text-red-400 uppercase tracking-tight">Asmara ❤️</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
                      Pertanyaan emosional, romantis, dan pengenalan hati tersembunyi bersama pasangan kesayangan Anda.
                    </p>
                  </div>
                  <div className="mt-auto pt-4 flex items-center gap-1 text-[10px] text-neutral-550 font-black uppercase tracking-widest transition-colors group-hover:text-red-400">
                    <span>Mulai Bermain</span>
                    <ChevronRight size={14} className="text-red-500" />
                  </div>
                </motion.button>

                {/* Category: PERTEMANAN */}
                <motion.button
                  id="category-pertemanan-select-card"
                  whileHover={{ y: -4, scale: 1.015 }}
                  whileTap={{ scale: 0.975 }}
                  onClick={() => handleSelectCategory('pertemanan')}
                  className="flex flex-col text-left p-6 bg-neutral-900 border-2 border-neutral-800 hover:border-sky-500 rounded-3xl shadow-xl transition-all duration-300 focus:ring-4 focus:ring-sky-500 cursor-pointer min-h-[240px] justify-between group"
                  aria-label="Pilih kategori hubungan Pertemanan. Menggunakan skema warna Sky Blue kontras."
                >
                  <div className="p-3 bg-sky-955/50 border border-sky-850 text-sky-450 rounded-2xl w-fit" aria-hidden="true">
                    <Users size={28} />
                  </div>
                  <div className="mt-4 space-y-2 flex-grow">
                    <h3 className="text-lg font-extrabold font-display text-sky-355 group-hover:text-sky-400 uppercase tracking-tight">Pertemanan 🤝</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
                      Ujian persahabatan, rahasia konyol, serta tantangan kocak yang menjamin tawa lepas bersama teman akrab.
                    </p>
                  </div>
                  <div className="mt-auto pt-4 flex items-center gap-1 text-[10px] text-neutral-555 font-black uppercase tracking-widest transition-colors group-hover:text-sky-400">
                    <span>Mulai Bermain</span>
                    <ChevronRight size={14} className="text-sky-500" />
                  </div>
                </motion.button>

                {/* Category: KELUARGA */}
                <motion.button
                  id="category-keluarga-select-card"
                  whileHover={{ y: -4, scale: 1.015 }}
                  whileTap={{ scale: 0.975 }}
                  onClick={() => handleSelectCategory('keluarga')}
                  className="flex flex-col text-left p-6 bg-neutral-900 border-2 border-neutral-800 hover:border-emerald-500 rounded-3xl shadow-xl transition-all duration-300 focus:ring-4 focus:ring-emerald-500 cursor-pointer min-h-[240px] justify-between group"
                  aria-label="Pilih kategori hubungan Keluarga. Menggunakan skema warna Emerald hijau kontras."
                >
                  <div className="p-3 bg-emerald-955/50 border border-emerald-850 text-emerald-455 rounded-2xl w-fit" aria-hidden="true">
                    <Award size={28} />
                  </div>
                  <div className="mt-4 space-y-2 flex-grow">
                    <h3 className="text-lg font-extrabold font-display text-emerald-300 group-hover:text-emerald-400 uppercase tracking-tight">Keluarga 🏡</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
                      Canda tawa hangat, nostalgia berharga, ramah keluarga yang aman, santun, dan menghibur untuk segala jenjang umur.
                    </p>
                  </div>
                  <div className="mt-auto pt-4 flex items-center gap-1 text-[10px] text-neutral-555 font-black uppercase tracking-widest transition-colors group-hover:text-emerald-400">
                    <span>Mulai Bermain</span>
                    <ChevronRight size={14} className="text-emerald-500" />
                  </div>
                </motion.button>

              </div>
            </PageTransition>
          )}

          {screen === 'board' && (
            <PageTransition
              id="gameplay-board-screen"
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full"
            >
              {/* Left Column: Sesi Info & WCAG status (Col-span-3) */}
              <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                {/* Segment: Session info */}
                <div className="bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Kategori Aktif</p>
                        <button
                          type="button"
                          onClick={() => setChangeCategoryModalOpen(true)}
                          className="text-[10px] text-amber-500 hover:text-amber-400 font-black uppercase transition hover:underline cursor-pointer bg-none border-none"
                          aria-label="Ubah kategori utama yang aktif"
                        >
                          Ubah
                        </button>
                      </div>
                      <div className="p-3 bg-red-955/10 border-2 border-red-650 rounded-xl flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="font-extrabold uppercase text-xs text-red-200 tracking-wider font-display">
                          {categoriesList.find(c => c.key === currentCategory)?.label || currentCategory}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Sub-category Filtering Chips */}
                    {subCategoriesList.filter(sc => sc.parentKey === currentCategory).length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-neutral-850">
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Filter Sub-kategori</p>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentSubCategory('');
                              setGameState(prev => ({ ...prev, askedQuestionIds: [] }));
                            }}
                            className={`px-2 py-1 text-[9px] font-black uppercase rounded-lg border-2 cursor-pointer transition ${
                              !currentSubCategory
                                ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                                : 'bg-neutral-950/40 border-neutral-800 text-neutral-450 hover:text-neutral-200'
                            }`}
                          >
                            Semua
                          </button>
                          {subCategoriesList.filter(sc => sc.parentKey === currentCategory).map(sc => (
                            <button
                              key={sc.key}
                              type="button"
                              onClick={() => {
                                setCurrentSubCategory(sc.key);
                                setGameState(prev => ({ ...prev, askedQuestionIds: [] }));
                              }}
                              className={`px-2 py-1 text-[9px] font-black uppercase rounded-lg border-2 cursor-pointer transition ${
                                currentSubCategory === sc.key
                                  ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                                  : 'bg-neutral-950/40 border-neutral-800 text-neutral-450 hover:text-neutral-200'
                              }`}
                            >
                              {sc.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Kontrol Sesi</p>
                    <motion.button
                      id="abort-current-game-btn"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleResetToHome}
                      className="w-full py-2.5 px-3 bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 rounded-xl text-xs font-bold text-red-400 tracking-wider text-center cursor-pointer uppercase transition outline-none"
                      aria-label="Hentikan dan keluar dari sesi permainan saat ini"
                    >
                      Hentikan Sesi
                    </motion.button>
                  </div>
                </div>

                {/* Segment: WCAG context note */}
                <div className="bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-5 shadow-xl flex-grow flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black text-neutral-500 mb-3 uppercase tracking-[0.2em]">Aksesibilitas (WCAG)</p>
                    <div className="grid grid-cols-2 gap-1.5 text-[9px] font-bold">
                      <button
                        type="button"
                        onClick={() => setGlobalAlertMessage("Mode Gelap diaktifkan secara bawaan untuk menjamin rasio kontras visual standar WCAG POUR & Level AA.")}
                        className="p-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 text-neutral-400 rounded text-center cursor-pointer transition hover:scale-[1.01] active:scale-[0.98]"
                      >
                        MODE GELAP
                      </button>
                      <button
                        type="button"
                        onClick={() => setHighContrastEnabled(!highContrastEnabled)}
                        className={`p-2 rounded text-center border font-black cursor-pointer transition hover:scale-[1.01] active:scale-[0.98] ${
                          highContrastEnabled ? 'bg-white text-black border-white' : 'bg-neutral-950 text-neutral-400 border-neutral-850 hover:bg-neutral-900'
                        }`}
                      >
                        CONTRAST: {highContrastEnabled ? 'HIGH' : 'AA'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTtsConfig({ ...ttsConfig, enabled: !ttsConfig.enabled })}
                        className={`p-2 rounded text-center border font-black col-span-2 text-[8px] cursor-pointer transition hover:scale-[1.01] active:scale-[0.98] ${
                          ttsConfig.enabled ? 'bg-red-950/40 text-red-500 border-red-800' : 'bg-neutral-950 text-neutral-400 border-neutral-850 hover:bg-neutral-900'
                        }`}
                      >
                        TTS PEMBACA KARTU: {ttsConfig.enabled ? 'AKTIF' : 'NONAKTIF'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const nextSize = fontSizeSetting === 'normal' ? 'large' : fontSizeSetting === 'large' ? 'xlarge' : 'normal';
                          setFontSizeSetting(nextSize);
                        }}
                        className="p-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 text-neutral-300 rounded text-center col-span-2 capitalize cursor-pointer transition hover:scale-[1.01] active:scale-[0.98]"
                      >
                        UKURAN TEKS: {fontSizeSetting === 'normal' ? 'Normal' : fontSizeSetting === 'large' ? 'Besar' : 'Sangat Besar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTone(tone === 'formal' ? 'casual' : 'formal');
                        }}
                        className={`p-2 rounded text-center border font-black col-span-2 text-[8px] cursor-pointer transition hover:scale-[1.01] active:scale-[0.98] ${
                          tone === 'casual' ? 'bg-amber-500 text-black border-amber-500 font-extrabold' : 'bg-neutral-950 text-neutral-400 border-neutral-850 hover:bg-neutral-900'
                        }`}
                        aria-label={`Ganti nada gaya bahasa. Saat ini: ${tone === 'formal' ? 'Baku' : 'Kekinian / Gaul'}`}
                      >
                        NADA KALIMAT: {tone === 'formal' ? 'BAKU (FORMAL)' : 'KEKINIAN (CASUAL)'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-850 text-center">
                    <p className="text-[10px] text-neutral-500 italic leading-relaxed font-semibold">
                      "Dukungan keyboard penuh untuk menjamin partisipasi mandiri."
                    </p>
                  </div>
                </div>
              </div>

              {/* Center Column: Core Active Playing Board (Col-span-6) */}
              <div className={`col-span-12 lg:col-span-6 ${themeConfig.bgColor} shadow-2xl relative flex flex-col justify-between min-h-[460px] overflow-hidden`}>
                
                {/* Visual Accent Sticker: Card level info */}
                <div className="absolute top-0 right-0 p-6 z-10">
                  <div className="px-3.5 py-1.5 bg-red-600/90 border border-red-400 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                    Level: {currentCategory}
                  </div>
                </div>

                {/* Player Indicator Display */}
                {gameState.players.length > 0 && (
                  <div className="flex-grow flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-8">
                    
                    <div>
                      <p className="text-red-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Giliran Kamu!</p>
                      
                      {/* Human Player Name displaying as Bento display headings */}
                      <h2 className="text-5xl sm:text-6xl font-black mb-1 leading-none tracking-tight text-white uppercase break-all">
                        {gameState.players[gameState.activePlayerIndex].name}
                        <span className="text-red-500 text-6xl">.</span>
                      </h2>
                    </div>

                    <p className="text-xs text-red-100/80 font-bold max-w-sm tracking-wide uppercase">
                      PILIH SALAH SATU OPSI DI BAWAH INI SESUAI KEBERANIANMU!
                    </p>

                    {/* Quick action buttons with 3D shadow depth styling from Design HTML */}
                    <div className="flex flex-col w-full gap-4 max-w-sm">
                      
                      {/* TRUTH BUTTON */}
                      <motion.button
                        id="btn-select-truth"
                        whileHover={{ scale: 1.025 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleDrawCard('truth')}
                        className={`py-5 text-2xl font-black rounded-3xl transition-all border-2 flex flex-col items-center justify-center gap-0.5 focus:ring-4 focus:ring-white uppercase cursor-pointer ${
                          highContrastEnabled 
                            ? 'bg-yellow-400 text-black border-white shadow-[0_6px_0_rgb(202,138,4)]' 
                            : 'bg-red-650 hover:bg-red-600 text-white border-red-400 shadow-[0_6px_0_rgb(153,27,27)]'
                        }`}
                        aria-label={`Pilih Kejujuran untuk ${gameState.players[gameState.activePlayerIndex]?.name}`}
                      >
                        <span className="text-xl font-black tracking-widest text-white">JUJUR</span>
                        <span className="text-[10px] text-white/50 lowercase font-bold">Draw Truth Card</span>
                      </motion.button>

                      {/* DARE BUTTON */}
                      <motion.button
                        id="btn-select-dare"
                        whileHover={{ scale: 1.025 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleDrawCard('dare')}
                        className={`py-5 text-2xl font-black rounded-3xl transition-all border-2 flex flex-col items-center justify-center gap-0.5 focus:ring-4 focus:ring-white uppercase cursor-pointer ${
                          highContrastEnabled 
                            ? 'bg-black text-yellow-300 border-yellow-400 shadow-[0_6px_0_rgb(100,116,139)]' 
                            : 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700 shadow-[0_6px_0_rgb(24,24,27)]'
                        }`}
                        aria-label={`Pilih Tantangan untuk ${gameState.players[gameState.activePlayerIndex]?.name}`}
                      >
                        <span className="text-xl font-black tracking-widest">TANTANGAN</span>
                        <span className="text-[10px] text-white/40 lowercase font-bold">Draw Dare Card</span>
                      </motion.button>

                      {/* GANTI KATEGORI BUTTON */}
                      <motion.button
                        id="btn-board-change-category"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setChangeCategoryModalOpen(true)}
                        className={`py-3.5 px-4 text-xs font-black rounded-2xl transition-all border-2 flex items-center justify-center gap-2 uppercase tracking-widest cursor-pointer ${
                          highContrastEnabled 
                            ? 'bg-yellow-400 text-black border-white shadow-[0_4px_0_rgb(202,138,4)]' 
                            : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-amber-400 shadow-[0_4px_0_rgb(15,23,42)]'
                        }`}
                        aria-label="Ganti Kategori Utama Permainan"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-[spin_6s_linear_infinite]" />
                        <span>GANTI KATEGORI</span>
                      </motion.button>
                    </div>

                  </div>
                )}

                {/* Board bottom counter labels */}
                {questions.length > 0 && (
                  <div className="p-4 bg-black/40 border-t-2 border-red-700/50 flex items-center justify-center gap-4 text-center">
                    <span className="text-[10px] font-black text-red-300 uppercase tracking-widest">
                      {questions.filter(q => {
                        const matchCat = q.category === currentCategory;
                        const matchPlayMode = q.play_mode === undefined || q.play_mode === null || q.play_mode === '' || q.play_mode === 'both' || q.play_mode === selectedPlayMode;
                        return matchCat && matchPlayMode;
                      }).length - gameState.askedQuestionIds.length} Kartu Tersisa
                    </span>
                    <div className="w-px h-3 bg-red-700/50"></div>
                    <span className="text-[10px] font-black text-red-300 uppercase tracking-widest">
                      Sesi: {gameState.askedQuestionIds.length} Putaran
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column: Participants list & History of play (Col-span-3) */}
              <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                
                {/* Segment: Participant list */}
                <div className="bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-5 shadow-xl flex-1 flex flex-col">
                  <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3">Peserta Sesi</h3>
                  
                  <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1 flex-grow">
                    {gameState.players.map((p, idx) => (
                      <div 
                        key={p.id} 
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition duration-200 ${
                          idx === gameState.activePlayerIndex 
                            ? 'bg-red-950/40 border-2 border-red-800 text-white font-extrabold' 
                            : 'bg-neutral-950 border border-neutral-850 text-neutral-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full ${p.avatarColor}`}></div>
                          <span>{p.name}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase opacity-60">
                          {idx === gameState.activePlayerIndex ? 'Giliran' : 'Menunggu'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Segment: Play history */}
                <div className="bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-5 shadow-xl flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3">Riwayat</h3>
                    
                    {gameState.history.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic text-center py-6 leading-relaxed">Belum ada putaran selesai.</p>
                    ) : (
                      <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                        {gameState.history.slice(0, 3).map((h, i) => (
                          <div key={i} className="border-l-2 border-red-650 pl-3 space-y-0.5">
                            <p className="text-[9px] text-neutral-500 font-black uppercase">Putaran #{gameState.history.length - i} — {h.playerName}</p>
                            <p className="text-xs font-bold leading-snug line-clamp-2 text-neutral-200">
                              {h.type === 'truth' ? 'Jujur' : 'Tantangan'}: {h.questionText}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </PageTransition>
          )}

        </AnimatePresence>

      </main>

      {/* REMAINDER OF MODAL HOOKED GRAPHICS FOR INTERACTION PORTALS */}

      {/* I. ACTIVE DRAW MODAL POPUP (FOCUS TRAPPED & TTS COMPLIANT) */}
      <Modal
        isOpen={activeCardModalOpen}
        onClose={() => handleSettleTurn(false)}
        title={activeCardType === 'truth' ? 'Kartu Kejujuran (Truth)' : 'Kartu Tantangan (Dare)'}
        ariaDescribedBy="modal-card-instructions"
      >
        <div className="text-center space-y-6" id="modal-card-instructions">
          
          {/* Tone Switcher & Active Player Reminder Grid */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl gap-3 text-center sm:text-left">
            <div>
              <p className="text-[10px] text-amber-500 font-mono font-bold tracking-widest uppercase">
                GILIRAN AKTIF
              </p>
              <h3 className="text-xl font-extrabold font-display text-white">
                {gameState.players[gameState.activePlayerIndex]?.name}
              </h3>
            </div>
            
            {/* Live Tone Switcher Toggle */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setTone('formal')}
                className={`px-3 py-1.5 rounded-lg transition-all focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer ${
                  tone === 'formal' ? 'bg-amber-500 text-black font-extrabold shadow' : 'text-neutral-400 hover:text-neutral-200'
                }`}
                aria-label="Ubah gaya bahasa ke versi Baku (Formal)"
              >
                BAKU (FORMAL)
              </button>
              <button
                type="button"
                onClick={() => setTone('casual')}
                className={`px-3 py-1.5 rounded-lg transition-all focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer ${
                  tone === 'casual' ? 'bg-amber-500 text-black font-extrabold shadow' : 'text-neutral-400 hover:text-neutral-200'
                }`}
                aria-label="Ubah gaya bahasa ke versi Kekinian (Casual)"
              >
                KEKINIAN (CASUAL)
              </button>
            </div>
          </div>

          {/* Question / Dare Payload Panel */}
          <AnimatedCard 
            cardId={activeCardQuestion?.id} 
            className="p-6 bg-slate-950 border border-slate-800 rounded-2xl relative shadow-inner space-y-4"
          >
            {exhaustionNotice && (
              <p className="text-[10px] text-amber-400 font-mono mb-2" role="alert">
                {exhaustionNotice}
              </p>
            )}
            
            {(() => {
              const textToSpeak = (tone === 'casual' && activeCardQuestion?.text_casual)
                ? activeCardQuestion.text_casual
                : (activeCardQuestion?.text_formal || activeCardQuestion?.text || '');
              return (
                <>
                  <AnimatedTextSwitcher
                    text={textToSpeak}
                    tone={tone}
                    className="text-lg sm:text-xl font-bold leading-relaxed text-slate-100 font-display"
                  />

                  <div className="flex justify-center pt-1">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => speakActiveQuestion(textToSpeak)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-750 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-black rounded-xl text-xs uppercase tracking-wide shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      aria-label="Bacakan pertanyaan"
                    >
                      <Volume2 size={14} className="text-amber-500" />
                      <span>Bacakan Pertanyaan</span>
                    </motion.button>
                  </div>
                </>
              );
            })()}
          </AnimatedCard>

          {/* Voice Reader status banner icon */}
          {ttsConfig.enabled && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded text-xs mx-auto">
              <Volume2 size={13} className="animate-pulse" />
              <span>Tekan tombol di atas untuk membacakan pertanyaan.</span>
            </div>
          )}

          {/* Form / Focus-trapped Choice buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-800">
            <motion.button
              id="settle-drawn-skip"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSettleTurn(false)}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-755 text-slate-400 hover:text-slate-200 outline-none rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
              aria-label="Lolos atau lewati giliran kartu ini"
            >
              <XCircle size={15} />
              <span>Lewati Giliran</span>
            </motion.button>
            <motion.button
              id="settle-drawn-completed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSettleTurn(true)}
              className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold outline-none rounded-xl text-xs sm:text-sm shadow transition cursor-pointer flex items-center justify-center gap-1.5"
              aria-label="Saya selesai memenuhi kejujuran atau tantangan"
            >
              <CheckCircle2 size={15} />
              <span>Selesai Melakukan!</span>
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* II. USER AUTH / PICTURE PROFILE STORAGE REGISTER MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        initialType={authModalType}
      />

      {/* III. COMPREHENSIVE PLAY MANUAL DIALOGS */}
      <Modal
        isOpen={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
        title="Petunjuk & Bimbingan Bermain Ramah Akses"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Selamat datang di <strong>Truth or Dare</strong>! Aplikasi ini dirancang agar menyenangkan untuk semua orang—termasuk dukungan penuh fitur aksesibilitas agar semua bisa ikut bermain dan bersenang-senang dengan akses yang sama.
          </p>

          <div className="space-y-2">
            <h4 className="font-bold text-amber-400 font-display">🌟 Fitur Aksesibilitas Khusus:</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Ukuran Teks Dinamis:</strong> Ubah skala keterbacaan font dari sedang, besar, hingga sangat besar.</li>
              <li><strong>E-Suara Pembaca (TTS):</strong> Narasi otomatis suara robot bahasa Indonesia yang langsung berbunyi sesaat setelah kartu dibuka.</li>
              <li><strong>Kontras Tinggi AAA:</strong> Modifikasi rasio visual hitam kuning ramah silindris dan buta warna.</li>
              <li><strong>Keyboard Trap:</strong> Fokus tombol dialog tidak akan terlepas atau tabrakan saat beralih dengan tombol <code>Tab</code> atau <code>Shift + Tab</code>.</li>
            </ul>
          </div>

          <div className="space-y-1.5 pt-2">
            <h4 className="font-bold text-amber-400 font-display">📖 Cara Bermain Secara Adil:</h4>
            <ol className="list-decimal pl-5 space-y-1 text-slate-400">
              <li>Input minimal 2 nama peserta di bagian pendaftaran pemain.</li>
              <li>Pilih kategori interaksi: Asmara, Pertemanan, atau Keluarga.</li>
              <li>Sistem akan menunjuk pemain secara bergiliran. Pemain memilih <strong>Truth</strong> (kejujuran) atau <strong>Dare</strong> (tantangan).</li>
              <li>Penuhi kartu tersebut atau pilih Lewati Giliran bila pemain merasa kurang nyaman. Selamat bersenang-senang secara sehat!</li>
            </ol>
          </div>

          <div className="pt-2 border-t border-slate-800 text-center">
            <button
              id="rules-agree-ok-btn"
              onClick={() => setRulesModalOpen(false)}
              className="py-2 px-5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg font-bold cursor-pointer transition focus:ring-1 focus:ring-amber-500"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      </Modal>

      {/* IV. GAME ABORT CONFIRMATION MODAL */}
      <Modal
        isOpen={showAbortModal}
        onClose={() => setShowAbortModal(false)}
        title="Konfirmasi Berhenti"
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-neutral-200 leading-relaxed font-semibold">
            Apakah Anda yakin ingin membatalkan permainan dan kembali ke halaman utama? Seluruh progres permainan saat ini akan dihapus.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setShowAbortModal(false)}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
            >
              Tidak, Lanjutkan
            </button>
            <button
              onClick={() => {
                setShowAbortModal(false);
                setScreen('home');
              }}
              className="py-2.5 px-4 bg-red-650 hover:bg-red-600 text-white rounded-xl text-xs sm:text-sm font-black uppercase cursor-pointer"
            >
              Ya, Hentikan Sesi
            </button>
          </div>
        </div>
      </Modal>

      {/* V. GLOBAL STATUS BANNER popup MODAL */}
      <Modal
        isOpen={globalAlertMessage !== null}
        onClose={() => setGlobalAlertMessage(null)}
        title="Sistem Informasi"
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-neutral-200 leading-relaxed font-bold">
            {globalAlertMessage}
          </p>
          <div className="pt-4 border-t border-slate-800 flex justify-center">
            <button
              onClick={() => setGlobalAlertMessage(null)}
              className="py-2.5 px-6 bg-red-650 hover:bg-red-600 text-white rounded-xl text-xs sm:text-sm font-black uppercase cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      </Modal>

      {/* VI. DYNAMIC SWITCH MAIN CATEGORY MODAL */}
      <Modal
        isOpen={changeCategoryModalOpen}
        onClose={() => setChangeCategoryModalOpen(false)}
        title="Ganti Kategori Utama"
      >
        <div className="space-y-5">
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed text-center">
            Pilih kategori utama permainan baru di bawah ini. Sesi permainan akan segera disaring ulang dengan kategori yang dipilih tanpa perlu mengulangi pendaftaran nama pemain.
          </p>

          <div className="grid grid-cols-1 gap-3.5 max-h-[320px] overflow-y-auto pr-1">
            {categoriesList.map((cat) => {
              const isSelected = currentCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleSwitchCategory(cat.key)}
                  className={`w-full p-4 rounded-2xl border-2 text-left cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between group ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 text-neutral-200 hover:text-white'
                  }`}
                  aria-label={`Pilih kategori ${cat.label}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black font-display tracking-wide">{cat.label}</span>
                  </div>
                  {isSelected ? (
                    <span className="text-[10px] bg-amber-500 text-neutral-950 font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                      Aktif
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-transform group-hover:translate-x-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => setChangeCategoryModalOpen(false)}
              className="py-2.5 px-5 bg-neutral-800 hover:bg-neutral-750 text-slate-300 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition"
            >
              Batal
            </button>
          </div>
        </div>
      </Modal>

      {/* FOOTER COOPERATIONS CREDITS */}
      <footer className="w-full border-t border-slate-900/60 bg-[#07090c] py-8 mt-12 text-center text-xs text-slate-500 space-y-4">
        <p>© 2026 Truth or Dare. Dilengkapi Fitur Aksesibulitas Berdasarkan WCAG POUR.</p>
        <p className="font-mono text-[10px] opacity-70">Aman • Terbuka • Menghargai Ruang Bermain Sesama</p>
        
        {/* Sleek, Modern attribution tag designed by BikinRapi */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="max-w-[180px] w-full p-[1px] rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/40 hover:to-purple-500/40 transition duration-300">
            <div className="bg-[#050814] rounded-[11px] p-3 text-center flex flex-col items-center gap-1.5 shadow-xl border border-slate-800/40">
              <span className="text-[9px] font-black uppercase text-indigo-300 tracking-[0.25em] font-sans opacity-80 leading-none">
                created by
              </span>
              <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-sans tracking-tight hover:brightness-110 transition leading-none">
                BikinRapi
              </span>
              <div className="w-8 h-[2px] rounded bg-gradient-to-r from-cyan-400 to-purple-500 mt-0.5 opacity-80"></div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
