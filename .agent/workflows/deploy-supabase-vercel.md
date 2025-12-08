---
description: Deploy MLA Exam Booster with Supabase + Vercel for multi-user support
---

# 部署指南：Supabase + Vercel

## 第一步：建立 Supabase 專案

1. 前往 https://supabase.com 並註冊/登入
2. 點擊 "New Project"
3. 填寫：
   - **Project name**: `mla-exam-booster`
   - **Database Password**: 設定一個強密碼（記下來）
   - **Region**: 選擇 `Northeast Asia (Tokyo)` 或最近的
4. 等待專案建立完成（約 2 分鐘）

## 第二步：建立資料表

在 Supabase Dashboard 中，前往 **SQL Editor**，執行以下 SQL：

```sql
-- 用戶考試進度表
CREATE TABLE exam_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_index INTEGER,
  selected_indices INTEGER[],
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id, answered_at)
);

-- 考試歷史記錄表
CREATE TABLE exam_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL,
  exam_mode TEXT,
  questions JSONB NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  time_spent INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 收藏題目表
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- 啟用 Row Level Security (RLS)
ALTER TABLE exam_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS 政策：用戶只能存取自己的資料
CREATE POLICY "Users can view own progress" ON exam_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON exam_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON exam_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON exam_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- 建立索引提升查詢效能
CREATE INDEX idx_progress_user ON exam_progress(user_id);
CREATE INDEX idx_sessions_user ON exam_sessions(user_id);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
```

## 第三步：設定驗證方式

1. 在 Supabase Dashboard 前往 **Authentication** > **Providers**
2. 啟用以下登入方式：
   - **Email** (預設啟用)
   - **Google** (可選，需要 Google Cloud Console 設定)
   - **GitHub** (可選)

## 第四步：取得 API 金鑰

1. 前往 **Settings** > **API**
2. 複製以下資訊：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1...`

## 第五步：安裝 Supabase SDK

```bash
npm install @supabase/supabase-js
```

## 第六步：建立環境變數

建立 `.env.local` 檔案：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 第七步：部署到 Vercel

1. 前往 https://vercel.com 並用 GitHub 登入
2. 點擊 "Import Project"
3. 選擇 `mla-exam-booster` repo
4. 在 Environment Variables 加入：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. 點擊 Deploy

## 檔案結構變更

```
src/
├── lib/
│   └── supabase.ts          # Supabase 客戶端
├── hooks/
│   └── useAuth.ts           # 驗證 Hook
├── components/
│   ├── AuthForm.tsx         # 登入/註冊表單
│   └── ProtectedRoute.tsx   # 保護路由
├── store/
│   └── examSessionStore.ts  # 修改為使用 Supabase
└── pages/
    └── Login.tsx            # 登入頁面
```
