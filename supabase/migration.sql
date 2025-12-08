-- 如果已經建立了基本表，執行以下 SQL 來添加缺少的欄位

-- 添加 questions 和 answers JSONB 欄位到 exam_sessions
ALTER TABLE exam_sessions 
ADD COLUMN IF NOT EXISTS questions JSONB,
ADD COLUMN IF NOT EXISTS answers JSONB,
ADD COLUMN IF NOT EXISTS time_spent INTEGER;

-- 如果需要重新建立完整的表結構，可以刪除後重建：
-- DROP TABLE IF EXISTS exam_sessions;
-- DROP TABLE IF EXISTS exam_progress;

-- 完整建立資料表 (如果尚未建立)
CREATE TABLE IF NOT EXISTS exam_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_index INTEGER,
  selected_indices INTEGER[],
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  time_spent INTEGER,
  questions JSONB,
  answers JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 RLS
ALTER TABLE exam_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;

-- RLS 政策 (如果已存在會報錯，可以忽略)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exam_progress' AND policyname = 'Users can manage own data') THEN
        CREATE POLICY "Users can manage own data" ON exam_progress FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exam_sessions' AND policyname = 'Users can manage own sessions') THEN
        CREATE POLICY "Users can manage own sessions" ON exam_sessions FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;
