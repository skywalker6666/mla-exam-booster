import { create } from 'zustand';
import { ExamSession } from '../types';
import { supabase, getCurrentUser } from '../lib/supabase';

interface HistoryState {
    sessions: ExamSession[];
    isLoading: boolean;
    error: string | null;
    fetchHistory: () => Promise<void>;
    addSession: (session: ExamSession) => Promise<void>;
    clearHistory: () => Promise<void>;
    getStats: () => {
        totalExams: number;
        averageScore: number;
        totalQuestionsAnswered: number;
    };
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
    sessions: [],
    isLoading: false,
    error: null,

    fetchHistory: async () => {
        set({ isLoading: true });
        try {
            const user = await getCurrentUser();

            if (user) {
                // Fetch from Supabase for logged-in users
                const { data, error } = await supabase
                    .from('exam_sessions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('completed_at', { ascending: false });

                if (error) throw error;

                // Transform Supabase data to match ExamSession format
                const sessions = (data || []).map((s: any) => ({
                    id: s.id,
                    startedAt: s.started_at || s.completed_at,
                    finishedAt: s.completed_at,
                    questionIds: s.questions?.map((q: any) => q.id || q) || [],
                    answers: s.answers || [],
                    totalScore: s.score,
                    totalQuestions: s.total,
                    durationSeconds: s.time_spent || 0,
                    timeSpentSeconds: s.time_spent || 0,
                    isPastExam: s.exam_type === 'past_exam',
                }));

                set({ sessions, isLoading: false });
            } else {
                // Fetch from local API for guests
                const response = await fetch('/api/history');
                if (!response.ok) throw new Error('Failed to fetch history');
                const json = await response.json();
                const sessions = json.data.map((s: any) => ({
                    ...s,
                    questionIds: s.questionIds || (s.answers ? s.answers.map((a: any) => a.questionId) : [])
                }));
                set({ sessions, isLoading: false });
            }
        } catch (error) {
            console.error(error);
            set({ error: 'Failed to load history', isLoading: false });
        }
    },

    addSession: async (session) => {
        // Optimistic update
        set((state) => ({ sessions: [session, ...state.sessions] }));

        try {
            const user = await getCurrentUser();

            if (user) {
                // Save to Supabase for logged-in users
                const { error } = await supabase
                    .from('exam_sessions')
                    .insert({
                        id: session.id,
                        user_id: user.id,
                        exam_type: session.isPastExam ? 'past_exam' : 'practice',
                        score: session.totalScore,
                        total: session.totalQuestions,
                        time_spent: session.timeSpentSeconds,
                        questions: session.questionIds,
                        answers: session.answers,
                        completed_at: session.finishedAt,
                    });

                if (error) throw error;
            } else {
                // Save to local API for guests
                const response = await fetch('/api/history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(session),
                });
                if (!response.ok) throw new Error('Failed to save session');
            }
        } catch (error) {
            console.error(error);
            set({ error: 'Failed to save session' });
        }
    },

    clearHistory: async () => {
        set({ sessions: [] });
        try {
            const user = await getCurrentUser();

            if (user) {
                // Clear from Supabase
                await supabase
                    .from('exam_sessions')
                    .delete()
                    .eq('user_id', user.id);
            } else {
                // Clear from local API
                await fetch('/api/history', { method: 'DELETE' });
            }
        } catch (error) {
            console.error(error);
        }
    },

    getStats: () => {
        const { sessions } = get();
        if (sessions.length === 0) {
            return { totalExams: 0, averageScore: 0, totalQuestionsAnswered: 0 };
        }
        const totalExams = sessions.length;
        const totalScorePercent = sessions.reduce(
            (acc, s) => acc + (s.totalScore / s.totalQuestions) * 100,
            0
        );
        const totalQuestionsAnswered = sessions.reduce(
            (acc, s) => acc + s.answers.length,
            0
        );
        return {
            totalExams,
            averageScore: Math.round(totalScorePercent / totalExams),
            totalQuestionsAnswered,
        };
    },
}));

