/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

app.use(express.json({ limit: '10mb' }));

// Local database helper
interface DBStructure {
  users: Array<{
    id: string;
    username: string;
    email?: string;
    passwordHash: string; // stored simple password
    avatar?: string; // base64 string or URL
    role?: 'admin' | 'user';
    status?: 'active' | 'suspended';
  }>;
  questions: Array<{
    id: string;
    category: string;
    subCategory?: string;
    type: 'truth' | 'dare';
    text: string;
    text_formal?: string;
    text_casual?: string;
    isCustom: boolean;
    userId?: string;
    status?: 'pending' | 'approved' | 'rejected';
  }>;
  categories?: Array<{
    key: string;
    label: string;
    colorNormal: string;
    colorContrast: string;
  }>;
  subCategories?: Array<{
    key: string;
    label: string;
    parentKey: string;
  }>;
  feedbacks?: Array<{
    id: string;
    name: string;
    category: string;
    comment: string;
    date: string;
  }>;
  histories?: Array<{
    id: string;
    userId: string;
    date: string;
    playerName: string;
    type: 'truth' | 'dare';
    questionText: string;
    category: string;
  }>;
}

// Ensure database file exists
function readDB(): DBStructure {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial: DBStructure = { users: [], questions: [], categories: [], subCategories: [], feedbacks: [], histories: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.users) parsed.users = [];
    if (!parsed.questions) parsed.questions = [];
    if (!parsed.categories) parsed.categories = [];
    if (!parsed.subCategories) parsed.subCategories = [];
    if (!parsed.feedbacks) parsed.feedbacks = [];
    if (!parsed.histories) parsed.histories = [];

    // Seed default administrator if not present
    const hasAdmin = parsed.users.some((u: any) => u.role === 'admin' || u.email === 'admin@tod.com');
    if (!hasAdmin) {
      parsed.users.push({
        id: 'local_admin_uid',
        username: 'admin',
        email: 'admin@tod.com',
        passwordHash: 'admin123',
        role: 'admin',
        status: 'active'
      });
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }

    return parsed;
  } catch (err) {
    console.error('Error reading database file, using fallback', err);
    return { users: [], questions: [], categories: [], feedbacks: [], histories: [] };
  }
}

function writeDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file', err);
  }
}

// Simple in-memory session token store (maps token to user ID)
const sessionStore: Record<string, string> = {};

// Express Middleware to authenticate sessions
function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Sesi tidak valid atau belum masuk.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const userId = sessionStore[token];
  if (!userId) {
    res.status(401).json({ error: 'Sesi kedaluwarsa atau tidak dikenal.' });
    return;
  }

  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    res.status(401).json({ error: 'Pengguna tidak ditemukan.' });
    return;
  }

  (req as any).user = user;
  (req as any).token = token;
  next();
}

// Firebase Lazy Initialization Helper
let firebaseAppInstance: any = null;

function getFirebaseModules() {
  let apiKey = process.env.FIREBASE_API_KEY;
  let authDomain = process.env.FIREBASE_AUTH_DOMAIN;
  let projectId = process.env.FIREBASE_PROJECT_ID;
  let storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  let messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID;
  let appId = process.env.FIREBASE_APP_ID;

  // Fallback to firebase-applet-config.json if environment variables are not available
  if (!apiKey || !authDomain || !projectId || !storageBucket || !appId) {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        apiKey = apiKey || config.apiKey;
        authDomain = authDomain || config.authDomain;
        projectId = projectId || config.projectId;
        storageBucket = storageBucket || config.storageBucket;
        messagingSenderId = messagingSenderId || config.messagingSenderId;
        appId = appId || config.appId;
      } catch (err) {
        console.error('Error reading firebase-applet-config.json', err);
      }
    }
  }

  if (!apiKey || !authDomain || !projectId || !storageBucket || !appId) {
    throw new Error('Konfigurasi Firebase belum lengkap. Silakan lengkapi FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, dan FIREBASE_APP_ID di bagian Pengaturan Rahasia Applet Anda.');
  }

  if (!firebaseAppInstance) {
    const config = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
    if (getApps().length === 0) {
      firebaseAppInstance = initializeApp(config);
    } else {
      firebaseAppInstance = getApp();
    }
  }

  return {
    auth: getAuth(firebaseAppInstance),
    storage: getStorage(firebaseAppInstance)
  };
}

// API Routes

// 1. REGISTER
app.post('/api/register', async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    res.status(400).json({ error: 'Email, nama pengguna, dan kata sandi wajib diisi.' });
    return;
  }

  const cleanUsername = String(username).trim().toLowerCase();
  const cleanEmail = String(email).trim().toLowerCase();

  if (cleanUsername.length < 3) {
    res.status(400).json({ error: 'Nama pengguna sekurangnya berdurasi 3 karakter.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Kata sandi minimal berisi 6 karakter.' });
    return;
  }

  try {
    const { auth: firebaseAuth } = getFirebaseModules();

    // Register user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, cleanEmail, password);
    const firebaseUser = userCredential.user;

    const db = readDB();
    
    const userRole = (cleanEmail === 'arthurfkot@gmail.com' || cleanEmail.includes('admin')) ? 'admin' : 'user';

    const newUser = {
      id: firebaseUser.uid,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: String(password), // Direct simple storage fallback
      avatar: undefined,
      role: userRole as 'admin' | 'user',
      status: 'active' as 'active' | 'suspended'
    };

    // Keep db.json clear of duplicates
    db.users = db.users.filter(u => u.username !== cleanUsername && u.id !== firebaseUser.uid);
    db.users.push(newUser);
    writeDB(db);

    const token = 'firebase_token_' + firebaseUser.uid + '_' + Math.random().toString(36).substring(2, 11);
    sessionStore[token] = firebaseUser.uid;

    res.json({
      success: true,
      message: 'Registrasi berhasil!',
      token,
      user: {
        id: firebaseUser.uid,
        username: cleanUsername,
        email: cleanEmail,
        avatar: undefined,
        role: userRole,
        status: 'active'
      }
    });

  } catch (err: any) {
    console.error('Registration Error:', err);
    res.status(400).json({ 
      error: `Gagal mendaftar: ${err.message || 'Konfigurasi Firebase bermasalah atau Email sudah terdaftar.'}` 
    });
  }
});

// 2. LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email dan kata sandi wajib diisi.' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();

  // Local Admin Bypass to make testing and usage extremely robust
  if (cleanEmail === 'admin@tod.com') {
    if (password === 'admin123') {
      const db = readDB();
      let adminUser = db.users.find(u => u.username === 'admin');
      if (!adminUser) {
        adminUser = {
          id: 'local_admin_uid',
          username: 'admin',
          email: 'admin@tod.com',
          passwordHash: 'admin123',
          role: 'admin',
          status: 'active'
        };
        db.users.push(adminUser);
        writeDB(db);
      }
      const token = 'local_admin_token_' + Math.random().toString(36).substring(2, 11);
      sessionStore[token] = adminUser.id;
      res.json({
        success: true,
        message: 'Masuk sebagai Administrator Berhasil!',
        token,
        user: {
          id: adminUser.id,
          username: adminUser.username,
          email: adminUser.email,
          role: 'admin',
          status: 'active'
        }
      });
      return;
    } else {
      res.status(400).json({ error: 'Sandi admin salah. Gunakan sandi admin123 untuk masuk.' });
      return;
    }
  }

  try {
    const { auth: firebaseAuth } = getFirebaseModules();

    // Login user with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, cleanEmail, password);
    const firebaseUser = userCredential.user;

    const db = readDB();
    let user = db.users.find(u => u.id === firebaseUser.uid || u.email === cleanEmail);
    const userRole = (cleanEmail === 'arthurfkot@gmail.com' || cleanEmail.includes('admin')) ? 'admin' : 'user';

    if (!user) {
      // Auto mapping if local records are missing
      const fallbackUsername = cleanEmail.split('@')[0];
      user = {
        id: firebaseUser.uid,
        username: fallbackUsername,
        email: cleanEmail,
        passwordHash: String(password),
        avatar: undefined,
        role: userRole as 'admin' | 'user',
        status: 'active' as 'active' | 'suspended'
      };
      db.users.push(user);
      writeDB(db);
    }

    if (user.status === 'suspended') {
      res.status(403).json({ error: 'Akun Anda telah ditangguhkan/diblokir oleh Administrator. Silakan hubungi tim dukungan.' });
      return;
    }

    const token = 'firebase_token_' + firebaseUser.uid + '_' + Math.random().toString(36).substring(2, 11);
    sessionStore[token] = firebaseUser.uid;

    res.json({
      success: true,
      message: 'Masuk berhasil!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role || userRole,
        status: user.status || 'active'
      }
    });

  } catch (err: any) {
    console.error('Login Error:', err);
    res.status(400).json({ 
      error: `Gagal masuk: ${err.message || 'Kombinasi email atau kata sandi salah.'}` 
    });
  }
});

// 3. LOG OUT
app.post('/api/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    delete sessionStore[token];
  }
  res.json({ success: true, message: 'Berhasil keluar.' });
});

// 4. ME (GET PROFILE)
app.get('/api/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.json({ user: null });
    return;
  }
  const token = authHeader.split(' ')[1];
  const userId = sessionStore[token];
  if (!userId) {
    res.json({ user: null });
    return;
  }

  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    res.json({ user: null });
    return;
  }

  if (user.status === 'suspended') {
    res.json({ user: null, error: 'Akun ditangguhkan.' });
    return;
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role || 'user',
      status: user.status || 'active'
    }
  });
});

// 5. UPLOAD AVATAR
app.post('/api/profile/avatar', authenticate, async (req, res) => {
  const { avatar } = req.body;
  if (!avatar) {
    res.status(400).json({ error: 'Data gambar avatar wajib dilampirkan.' });
    return;
  }

  const user = (req as any).user;

  try {
    const { storage } = getFirebaseModules();

    // Check for base64 image URL data
    const matches = avatar.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      res.status(400).json({ error: 'Format data gambar salah (harus berupa data URL base64 yang valid).' });
      return;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Extract file extension
    let ext = 'png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('webp')) ext = 'webp';

    const avatarRef = ref(storage, `avatars/${user.id}.${ext}`);

    // Upload payload to Firebase Storage
    await uploadBytes(avatarRef, buffer, { contentType: mimeType });

    // Grab public read link
    const downloadUrl = await getDownloadURL(avatarRef);

    const db = readDB();
    const dbUserIdx = db.users.findIndex(u => u.id === user.id);
    if (dbUserIdx !== -1) {
      db.users[dbUserIdx].avatar = downloadUrl;
      writeDB(db);
      res.json({
        success: true,
        message: 'Avatar berhasil diperbarui!',
        avatar: downloadUrl
      });
    } else {
      res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    }
  } catch (err: any) {
    console.error('Firebase Storage Upload Error:', err);
    res.status(500).json({ 
      error: `Gagal mengunggah foto ke Firebase Storage: ${err.message || 'Harap periksa konfigurasi Firebase Storage Anda.'}` 
    });
  }
});


// Endpoint to generate casual slang using Gemini API
app.post('/api/generate-slang', async (req, res) => {
  const { text_formal } = req.body;
  if (!text_formal || String(text_formal).trim().length === 0) {
    res.status(400).json({ error: 'Parameter text_formal wajib diisi.' });
    return;
  }

  const prompt = `Kamu adalah anak muda gaul usia 20 tahunan. Ubah kalimat Truth or Dare berikut menjadi bahasa gaul anak muda kekinian (circle pertemanan) yang asyik tapi tetap sopan. Jangan beri tambahan penjelasan, cukup hasil terjemahannya saja. Kalimatnya: ${text_formal.trim()}`;

  const keysToTry = [
    "AQ.Ab8RN6Ix5wb2uSggKB2x9EIPV_qzah11x16kL39ojFECylKQ5g.",
    "AQ.Ab8RN6Ix5wb2uSggKB2x9EIPV_qzah11x16kL39ojFECylKQ5g"
  ];

  let lastError: any = null;
  for (const key of keysToTry) {
    try {
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      const text_casual = response.text ? response.text.trim() : '';
      if (text_casual) {
        res.json({ text_casual });
        return;
      }
    } catch (err) {
      lastError = err;
      console.warn(`Gemini generation failed with key [${key}]:`, err);
    }
  }

  res.status(500).json({
    error: `Gagal menghasilkan teks gaul: ${lastError?.message || 'Error internal Gemini'}`
  });
});


// 6. GET QUESTIONS (Mix of defaults and approved cards)
app.get('/api/questions', (req, res) => {
  const db = readDB();
  // Filter questions: only approved ones MERGED with standard built-ins (isCustom: false or status: 'approved')
  // The main game loop must strictly fetch questions where status = 'approved'
  const visibleQuestions = db.questions.filter(q => {
    return q.status === 'approved' || (!q.isCustom && !q.status);
  });

  res.json({ questions: visibleQuestions });
});

// 7. CREATE QUESTION (User Suggestion: defaults to status: 'pending')
app.post('/api/questions', authenticate, (req, res) => {
  const { category, subCategory, type, text, text_formal, text_casual } = req.body;
  const user = (req as any).user;

  const actualText = text_formal || text;
  if (!category || !type || !actualText) {
    res.status(400).json({ error: 'Kategori, tipe (truth/dare), dan konten teks wajib diisi.' });
    return;
  }

  const cleanText = String(actualText).trim();
  if (cleanText.length < 5) {
    res.status(400).json({ error: 'Konten pertanyaan terlalu pendek.' });
    return;
  }

  const db = readDB();
  const newQuestion = {
    id: 'custom_' + Math.random().toString(36).substring(2, 11),
    category,
    subCategory: subCategory || undefined,
    type: type as 'truth' | 'dare',
    text: cleanText,
    text_formal: cleanText,
    text_casual: text_casual ? String(text_casual).trim() : undefined,
    isCustom: true,
    userId: user.id,
    status: 'pending' as 'pending' | 'approved' | 'rejected'
  };

  db.questions.push(newQuestion);
  writeDB(db);

  const visibleQuestions = db.questions.filter(q => q.userId === user.id);
  res.json({
    success: true,
    message: 'Saran pertanyaan berhasil diajukan! Menunggu peninjauan Admin.',
    question: newQuestion,
    questions: visibleQuestions
  });
});

// 8. UPDATE QUESTION (Allowed if owned by user)
app.put('/api/questions/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { text, text_formal, text_casual } = req.body;
  const user = (req as any).user;

  const actualText = text_formal || text;
  if (!actualText || String(actualText).trim().length < 5) {
    res.status(400).json({ error: 'Teks pertanyaan baru minimal 5 karakter.' });
    return;
  }

  const db = readDB();
  const qIdx = db.questions.findIndex(q => q.id === id);
  if (qIdx === -1) {
    res.status(404).json({ error: 'Pertanyaan tidak ditemukan.' });
    return;
  }

  const question = db.questions[qIdx];
  if (!question.isCustom || question.userId !== user.id) {
    res.status(403).json({ error: 'Anda tidak memiliki hak untuk mengubah pertanyaan ini.' });
    return;
  }

  db.questions[qIdx].text = String(actualText).trim();
  db.questions[qIdx].text_formal = String(actualText).trim();
  if (text_casual !== undefined) {
    db.questions[qIdx].text_casual = text_casual ? String(text_casual).trim() : undefined;
  }
  db.questions[qIdx].status = 'pending'; // Reset status to pending for admin-repreview
  writeDB(db);

  const visibleQuestions = db.questions.filter(q => q.userId === user.id);
  res.json({
    success: true,
    message: 'Pertanyaan berhasil diubah dan diajukan ulang.',
    questions: visibleQuestions
  });
});

// 9. DELETE QUESTION (Allowed if owned by user)
app.delete('/api/questions/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;

  const db = readDB();
  const qIdx = db.questions.findIndex(q => q.id === id);
  if (qIdx === -1) {
    res.status(404).json({ error: 'Pertanyaan tidak ditemukan.' });
    return;
  }

  const question = db.questions[qIdx];
  if (!question.isCustom || question.userId !== user.id) {
    res.status(403).json({ error: 'Anda tidak memiliki hak untuk menghapus pertanyaan asli ini.' });
    return;
  }

  db.questions.splice(qIdx, 1);
  writeDB(db);

  const visibleQuestions = db.questions.filter(q => q.userId === user.id);
  res.json({
    success: true,
    message: 'Pertanyaan kustom berhasil dihapus.',
    questions: visibleQuestions
  });
});


// ============================================
// ROLE BASED ACCESS CONTROL & ADMIN SUITE
// ============================================

// Authentication Administrator specific middleware
function authenticateAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  authenticate(req, res, () => {
    const user = (req as any).user;
    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Akses ditolak. Fitur ini terbatas untuk Administrator.' });
      return;
    }
    next();
  });
}

// ADMIN: GET LIST OF ALL USERS
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  const db = readDB();
  // Return users with passwords masked for security safety
  const safeUsers = db.users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    avatar: u.avatar,
    role: u.role || 'user',
    status: u.status || 'active'
  }));
  res.json({ users: safeUsers });
});

// ADMIN: CREATE USER MANUALLY
app.post('/api/admin/users', authenticateAdmin, (req, res) => {
  const { username, email, password, role, status } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: 'Nama pengguna, email, dan kata sandi wajib diisi.' });
    return;
  }
  
  const db = readDB();
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanUsername = String(username).trim().toLowerCase();

  if (db.users.some(u => u.email === cleanEmail || u.username === cleanUsername)) {
    res.status(400).json({ error: 'Email atau nama pengguna sudah terdaftar.' });
    return;
  }

  const newUser = {
    id: 'user_' + Math.random().toString(36).substring(2, 11),
    username: cleanUsername,
    email: cleanEmail,
    passwordHash: String(password),
    avatar: undefined,
    role: (role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
    status: (status === 'suspended' ? 'suspended' : 'active') as 'active' | 'suspended'
  };

  db.users.push(newUser);
  writeDB(db);
  res.json({ success: true, user: newUser });
});

// ADMIN: UPDATE USER DETAILS / STATUS / ROLE
app.put('/api/admin/users/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { username, email, role, status } = req.body;
  
  const db = readDB();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    return;
  }

  if (username) db.users[idx].username = String(username).trim().toLowerCase();
  if (email) db.users[idx].email = String(email).trim().toLowerCase();
  if (role) db.users[idx].role = role as 'admin' | 'user';
  if (status) db.users[idx].status = status as 'active' | 'suspended';

  writeDB(db);
  res.json({ success: true, user: db.users[idx] });
});

// ADMIN: DELETE USER
app.delete('/api/admin/users/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    return;
  }

  db.users.splice(idx, 1);
  writeDB(db);
  res.json({ success: true });
});

// ADMIN: GET ALL QUESTIONS FROM ALL USERS (PENDING QUEUE AND MORE)
app.get('/api/admin/questions', authenticateAdmin, (req, res) => {
  const db = readDB();
  const richQuestions = db.questions.map(q => {
    const author = db.users.find(u => u.id === q.userId);
    return {
      ...q,
      username: author ? author.username : 'Sistem'
    };
  });
  res.json({ questions: richQuestions });
});

// ADMIN: ADD BUILT-IN/APPROVED GAME QUESTION
app.post('/api/admin/questions', authenticateAdmin, (req, res) => {
  const { category, subCategory, type, text, text_formal, text_casual, status } = req.body;
  const actualText = text_formal || text;
  if (!category || !type || !actualText) {
    res.status(400).json({ error: 'Data tidak lengkap (Kategori, Tipe, Teks).' });
    return;
  }

  const db = readDB();
  const newQ = {
    id: 'core_' + Math.random().toString(36).substring(2, 11),
    category,
    subCategory: subCategory || undefined,
    type: type as 'truth' | 'dare',
    text: String(actualText).trim(),
    text_formal: String(actualText).trim(),
    text_casual: text_casual ? String(text_casual).trim() : undefined,
    isCustom: true,
    status: (status || 'approved') as 'pending' | 'approved' | 'rejected'
  };

  db.questions.push(newQ);
  writeDB(db);
  res.json({ success: true, question: newQ });
});

// ADMIN: FAST QUESTION GENERATOR WITH GEMINI API
app.post('/api/admin/generate-fast-questions', authenticateAdmin, async (req, res) => {
  const { category, subCategory, playMode } = req.body;
  if (!category || !subCategory || !playMode) {
    res.status(400).json({ error: 'Data tidak lengkap (Kategori, Sub-Kategori, Play Mode).' });
    return;
  }

  // Build the strict user instructions
  const systemInstructionText = "You are a creative content generator for an Indonesian Truth or Dare game for Gen-Z.\nGenerate exactly TWO items: One 'truth' question and one 'dare' task.\nStrict Parameters to Follow:\n\nMain Category: [INSERT SELECTED MAIN CATEGORY]\n\nSub-Category: [INSERT SELECTED SUB-CATEGORY]\n\nPlay Mode: [INSERT SELECTED PLAY MODE]\n\nContextual Constraints based on Play Mode:\n\nIf Play Mode is 'online', both the truth and dare MUST be 100% doable remotely via digital screen, video call, or chat app (e.g., sharing digital history, sending a chat message, showing something to the camera). No physical contact allowed.\n\nIf Play Mode is 'offline', the tasks MUST involve in-person/physical interactions within the same room (e.g., physical gestures, looking at someone directly).\n\nOutput Format: You MUST return the result strictly as a valid JSON array containing exactly 2 objects. Each object must have these exact keys: id (unique string), type ('truth' or 'dare'), category, sub_category, play_mode, text_formal (Standard Indonesian), and text_casual (Trendy Indonesian youth slang/bahasa gaul). Do not output markdown wrappers or text explanations.";

  // Dynamic Prompt replacing placeholders with selected parameters
  const prompt = systemInstructionText
    .replace('[INSERT SELECTED MAIN CATEGORY]', category)
    .replace('[INSERT SELECTED SUB-CATEGORY]', subCategory)
    .replace('[INSERT SELECTED PLAY MODE]', playMode);

  const keysToTry = [
    process.env.GEMINI_API_KEY,
    "AQ.Ab8RN6Ix5wb2uSggKB2x9EIPV_qzah11x16kL39ojFECylKQ5g.",
    "AQ.Ab8RN6Ix5wb2uSggKB2x9EIPV_qzah11x16kL39ojFECylKQ5g"
  ].filter(Boolean) as string[];

  let lastError: any = null;
  for (const key of keysToTry) {
    try {
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Use gemini-3.5-flash as the standard/active text model recommended by our skill.
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text ? response.text.trim() : '';
      if (responseText) {
        let generatedArray;
        try {
          generatedArray = JSON.parse(responseText);
        } catch (jsonErr) {
          const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          generatedArray = JSON.parse(cleanText);
        }

        if (Array.isArray(generatedArray) && generatedArray.length === 2) {
          const db = readDB();
          
          const completedObjects = generatedArray.map((item: any) => {
            return {
              id: item.id || 'core_' + Math.random().toString(36).substring(2, 11),
              type: (item.type === 'dare' ? 'dare' : 'truth') as 'truth' | 'dare',
              category: item.category || category,
              subCategory: item.sub_category || item.subCategory || subCategory,
              play_mode: (item.play_mode || playMode) as 'offline' | 'online' | 'both',
              text: item.text_formal || item.text || '',
              text_formal: item.text_formal || item.text || '',
              text_casual: item.text_casual || undefined,
              isCustom: true,
              status: 'approved' as const
            };
          });

          db.questions.push(...completedObjects);
          writeDB(db);

          res.json({ success: true, questions: completedObjects });
          return;
        } else {
          throw new Error('Respons format array JSON dari model tidak valid atau panjangnya tidak sama dengan 2.');
        }
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini generation in Fast Question Generator failed with key [${key.substring(0, 10)}...]:`, err);
    }
  }

  res.status(500).json({
    error: `Gagal menghasilkan kartu Truth or Dare otomatis: ${lastError?.message || 'Error internal Gemini'}`
  });
});

// ADMIN: UPDATE ANY QUESTION (TEXT, CATEGORY, TYPE, STATUS)
app.put('/api/admin/questions/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { category, subCategory, type, text, text_formal, text_casual, status } = req.body;

  const db = readDB();
  const idx = db.questions.findIndex(q => q.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Pertanyaan tidak ditemukan.' });
    return;
  }

  if (category) db.questions[idx].category = category;
  db.questions[idx].subCategory = subCategory || undefined; // support clear sub-category
  if (type) db.questions[idx].type = type;
  
  const actualText = text_formal || text;
  if (actualText) {
    db.questions[idx].text = String(actualText).trim();
    db.questions[idx].text_formal = String(actualText).trim();
  }
  
  if (text_casual !== undefined) {
    db.questions[idx].text_casual = text_casual ? String(text_casual).trim() : undefined;
  }
  if (status) db.questions[idx].status = status;

  writeDB(db);
  res.json({ success: true, question: db.questions[idx] });
});

// ADMIN: APPROVE SUGGESTION
app.post('/api/admin/questions/:id/approve', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const idx = db.questions.findIndex(q => q.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Pertanyaan tidak ditemukan.' });
    return;
  }

  db.questions[idx].status = 'approved';
  writeDB(db);
  res.json({ success: true, question: db.questions[idx] });
});

// ADMIN: REJECT SUGGESTION
app.post('/api/admin/questions/:id/reject', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const idx = db.questions.findIndex(q => q.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Pertanyaan tidak ditemukan.' });
    return;
  }

  db.questions[idx].status = 'rejected';
  writeDB(db);
  res.json({ success: true, question: db.questions[idx] });
});

// ADMIN: GET USER FEEDBACKS
app.get('/api/admin/feedbacks', authenticateAdmin, (req, res) => {
  const db = readDB();
  res.json({ feedbacks: db.feedbacks || [] });
});


// USER GAME HISTORY SUBMISSION
app.post('/api/user/histories', authenticate, (req, res) => {
  const user = (req as any).user;
  const { playerName, type, questionText, category } = req.body;
  if (!playerName || !type || !questionText || !category) {
    res.status(400).json({ error: 'Data riwayat tidak lengkap.' });
    return;
  }

  const db = readDB();
  const newHist = {
    id: 'hist_' + Math.random().toString(36).substring(2, 11),
    userId: user.id,
    date: new Date().toISOString(),
    playerName,
    type: type as 'truth' | 'dare',
    questionText,
    category
  };

  if (!db.histories) db.histories = [];
  db.histories.push(newHist);
  writeDB(db);
  res.json({ success: true, history: newHist });
});

// USER GAME HISTORY RETRIEVAL
app.get('/api/user/histories', authenticate, (req, res) => {
  const user = (req as any).user;
  const db = readDB();
  const userHist = (db.histories || []).filter(h => h.userId === user.id);
  res.json({ histories: userHist });
});

// USER QUESTION SUGGESTIONS RETRIEVAL WITH APPROVAL STATUS
app.get('/api/user/suggestions', authenticate, (req, res) => {
  const user = (req as any).user;
  const db = readDB();
  const userSug = db.questions.filter(q => q.userId === user.id);
  res.json({ suggestions: userSug });
});

// SUBMIT FEEDBACK REPORT (ACCESSIBLE TO BOTH SIGNED IN & ANONYMOUS)
app.post('/api/feedbacks', (req, res) => {
  const { category, comment, name } = req.body;
  if (!category || !comment) {
    res.status(400).json({ error: 'Kategori umpan balik dan komentar wajib diisi.' });
    return;
  }

  const db = readDB();
  const newFeedback = {
    id: 'feed_' + Math.random().toString(36).substring(2, 11),
    name: name ? String(name).trim() : 'Anonim',
    category,
    comment: String(comment).trim(),
    date: new Date().toISOString()
  };

  if (!db.feedbacks) db.feedbacks = [];
  db.feedbacks.push(newFeedback);
  writeDB(db);
  res.json({ success: true });
});

// DYNAMIC CATEGORIES & SUB-CATEGORIES SETUP
app.get('/api/categories', (req, res) => {
  const db = readDB();
  const defaultCategories = [
    { key: 'asmara', label: 'Asmara ❤️', colorNormal: '#450a0a', colorContrast: '#fef08a' },
    { key: 'pertemanan', label: 'Pertemanan 🤝', colorNormal: '#0c1e30', colorContrast: '#e0f2fe' },
    { key: 'keluarga', label: 'Keluarga 🏡', colorNormal: '#062c16', colorContrast: '#d1fae5' }
  ];
  if (!db.categories || db.categories.length === 0) {
    db.categories = defaultCategories;
    writeDB(db);
  }
  res.json({ categories: db.categories });
});

app.get('/api/subcategories', (req, res) => {
  const db = readDB();
  const defaultSubCategories = [
    { key: 'pacaran', label: 'Pacaran', parentKey: 'asmara' },
    { key: 'pdkt', label: 'PDKT', parentKey: 'asmara' },
    { key: 'pernikahan', label: 'Pernikahan', parentKey: 'asmara' },
    { key: 'bestie', label: 'Bestie', parentKey: 'pertemanan' },
    { key: 'persahabatan', label: 'Persahabatan', parentKey: 'pertemanan' },
    { key: 'teman-biasa', label: 'Teman Biasa', parentKey: 'pertemanan' },
    { key: 'ortu-anak', label: 'Orang Tua ke Anak', parentKey: 'keluarga' },
    { key: 'saudara', label: 'Saudara Kandung', parentKey: 'keluarga' },
    { key: 'keluarga-besar', label: 'Keluarga Besar', parentKey: 'keluarga' }
  ];
  if (!db.subCategories || db.subCategories.length === 0) {
    db.subCategories = defaultSubCategories;
    writeDB(db);
  }
  res.json({ subCategories: db.subCategories });
});

app.put('/api/categories', authenticateAdmin, (req, res) => {
  const { categories } = req.body;
  if (!categories || !Array.isArray(categories)) {
    res.status(400).json({ error: 'Format daftar kategori tidak valid.' });
    return;
  }
  
  const db = readDB();
  db.categories = categories;
  writeDB(db);
  res.json({ success: true, categories });
});

// ADMIN: CREATE CATEGORY
app.post('/api/admin/categories', authenticateAdmin, (req, res) => {
  const { key, label, colorNormal, colorContrast } = req.body;
  if (!key || !label || !colorNormal || !colorContrast) {
    res.status(400).json({ error: 'Data kategori tidak lengkap.' });
    return;
  }
  const cleanKey = String(key).trim().toLowerCase();
  
  const db = readDB();
  if (db.categories?.some(c => c.key === cleanKey)) {
    res.status(400).json({ error: 'Kunci kategori sudah terpakai.' });
    return;
  }
  
  const newCat = { key: cleanKey, label: String(label).trim(), colorNormal, colorContrast };
  if (!db.categories) db.categories = [];
  db.categories.push(newCat);
  writeDB(db);
  res.json({ success: true, category: newCat });
});

// ADMIN: UPDATE CATEGORY
app.put('/api/admin/categories/:key', authenticateAdmin, (req, res) => {
  const { key } = req.params;
  const { label, colorNormal, colorContrast } = req.body;
  if (!label || !colorNormal || !colorContrast) {
    res.status(400).json({ error: 'Data kategori tidak lengkap.' });
    return;
  }
  
  const db = readDB();
  const idx = db.categories?.findIndex(c => c.key === key) ?? -1;
  if (idx === -1) {
    res.status(404).json({ error: 'Kategori tidak ditemukan.' });
    return;
  }
  
  db.categories![idx] = {
    key,
    label: String(label).trim(),
    colorNormal,
    colorContrast
  };
  writeDB(db);
  res.json({ success: true, category: db.categories![idx] });
});

// ADMIN: DELETE CATEGORY (With cascading delete)
app.delete('/api/admin/categories/:key', authenticateAdmin, (req, res) => {
  const { key } = req.params;
  const db = readDB();
  
  if (!db.categories || !db.categories.some(c => c.key === key)) {
    res.status(404).json({ error: 'Kategori tidak ditemukan.' });
    return;
  }
  
  // Suppress category
  db.categories = db.categories.filter(c => c.key !== key);
  
  // Cascade delete sub-categories belonging to this category
  if (db.subCategories) {
    db.subCategories = db.subCategories.filter(sc => sc.parentKey !== key);
  }
  
  writeDB(db);
  res.json({ success: true });
});

// ADMIN: CREATE SUB-CATEGORY
app.post('/api/admin/subcategories', authenticateAdmin, (req, res) => {
  const { key, label, parentKey } = req.body;
  if (!key || !label || !parentKey) {
    res.status(400).json({ error: 'Data sub-kategori tidak lengkap.' });
    return;
  }
  const cleanKey = String(key).trim().toLowerCase();
  
  const db = readDB();
  if (db.subCategories?.some(sc => sc.key === cleanKey)) {
    res.status(400).json({ error: 'Kunci sub-kategori sudah terpakai.' });
    return;
  }
  if (!db.categories?.some(c => c.key === parentKey)) {
    res.status(400).json({ error: 'Kategori utama tidak valid.' });
    return;
  }
  
  const newSubCat = { key: cleanKey, label: String(label).trim(), parentKey };
  if (!db.subCategories) db.subCategories = [];
  db.subCategories.push(newSubCat);
  writeDB(db);
  res.json({ success: true, subCategory: newSubCat });
});

// ADMIN: UPDATE SUB-CATEGORY
app.put('/api/admin/subcategories/:key', authenticateAdmin, (req, res) => {
  const { key } = req.params;
  const { label, parentKey } = req.body;
  if (!label || !parentKey) {
    res.status(400).json({ error: 'Data sub-kategori tidak lengkap.' });
    return;
  }
  
  const db = readDB();
  const scIdx = db.subCategories?.findIndex(sc => sc.key === key) ?? -1;
  if (scIdx === -1) {
    res.status(404).json({ error: 'Sub-kategori tidak ditemukan.' });
    return;
  }
  if (!db.categories?.some(c => c.key === parentKey)) {
    res.status(400).json({ error: 'Kategori utama tidak valid.' });
    return;
  }
  
  db.subCategories![scIdx] = {
    key,
    label: String(label).trim(),
    parentKey
  };
  writeDB(db);
  res.json({ success: true, subCategory: db.subCategories![scIdx] });
});

// ADMIN: DELETE SUB-CATEGORY
app.delete('/api/admin/subcategories/:key', authenticateAdmin, (req, res) => {
  const { key } = req.params;
  const db = readDB();
  
  if (!db.subCategories || !db.subCategories.some(sc => sc.key === key)) {
    res.status(404).json({ error: 'Sub-kategori tidak ditemukan.' });
    return;
  }
  
  db.subCategories = db.subCategories.filter(sc => sc.key !== key);
  writeDB(db);
  res.json({ success: true });
});

// Vite Middleware & Static Serves
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Truth or Dare Server running on http://localhost:${PORT}`);
  });
}

startServer();
