# BRUTABIT Web — Next.js + Firebase + Vercel

## Tech Stack
- **Next.js 14** (App Router)
- **Firebase 10** (Auth + Firestore + Cloud Messaging)
- **Tailwind CSS** (Neobrutalism theme)
- **Zustand** (state management)
- **Vercel** (deployment)

---

## Setup (5 langkah)

### 1. Install dependencies
```bash
npm install
```

### 2. Setup Firebase
1. Buka https://console.firebase.google.com
2. Buat project baru (atau gunakan project yang sama dengan app mobile)
3. **Authentication** → Enable: Email/Password + Google
4. **Firestore** → Create database → Production mode
5. **Project Settings** → General → Your apps → Add Web App
6. Copy config Firebase

### 3. Buat file .env.local
```bash
cp .env.example .env.local
```
Isi dengan config Firebase dari langkah 2:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 4. Jalankan dev server
```bash
npm run dev
```
Buka http://localhost:3000

### 5. Deploy ke Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Isi env variables saat diminta, atau tambah lewat Vercel Dashboard
```

---

## Struktur Project
```
src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx         ← Halaman login
│   │   ├── register/page.tsx      ← Halaman daftar
│   │   └── forgot-password/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx             ← Layout dengan sidebar
│   │   ├── habits/page.tsx        ← Habit tracker
│   │   ├── journal/page.tsx       ← Jurnal harian
│   │   ├── todo/page.tsx          ← To-do list
│   │   ├── mood/page.tsx          ← Mood tracker
│   │   ├── stats/page.tsx         ← Statistik & heatmap
│   │   ├── rewards/page.tsx       ← XP, level, lencana
│   │   └── alarms/page.tsx        ← Notifikasi browser
│   ├── globals.css
│   └── layout.tsx                 ← Root layout + fonts
├── components/
│   └── layout/
│       ├── AuthProvider.tsx        ← Firebase auth state
│       └── Sidebar.tsx             ← Sidebar navigasi
├── lib/
│   ├── firebase.ts                 ← Firebase config
│   ├── auth.ts                     ← Auth helpers
│   └── notifications.ts            ← Browser notifications
├── store/index.ts                  ← Zustand global state
└── types/index.ts                  ← TypeScript types
```

---

## Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. Profil Pengguna (Membuka akses BACA agar bisa melihat nama di Chat/Beranda)
    match /users/{userId} {
      // Siapapun yang login bisa baca Profil (Nama/Foto)
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Kunci mati semua sub-datanya (Habit, Jurnal, Todo) buat privasi ketat!
      match /{collectionId}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // 2. Aturan untuk BERANDA (Post & Komunitas)
    match /posts/{postId} {
      allow read, create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null && request.auth.uid == resource.data.authorId;
      
      // Aturan komentar di dalam post
      match /comments/{commentId} {
        allow read, write: if request.auth != null;
      }
    }

    // Aturan untuk PRIVATE CHAT (Sangat Dijaga Privasinya!)
    match /chats/{chatId} {
      allow read, write: if request.auth != null;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

---

## Deploy ke Vercel (cara mudah via GitHub)
1. Push project ke GitHub
2. Buka https://vercel.com → Import project dari GitHub
3. Tambah semua env variables di Vercel Dashboard
4. Deploy otomatis setiap push ke main branch

---

## Fitur
- ✅ Login (Email + Google)
- ✅ Register + Reset password
- ✅ Habit tracker + week/month view
- ✅ Jurnal harian dengan tags
- ✅ To-do list dengan prioritas
- ✅ Mood tracker + grafik 7 hari
- ✅ Statistik + heatmap 12 minggu
- ✅ Sistem XP + level + lencana
- ✅ Notifikasi browser
- ✅ Realtime sync via Firestore
- ✅ Responsive (mobile + desktop)
- ✅ Dark / light mode
- ✅ Deploy 1-klik ke Vercel
