import { create } from 'zustand';
import { ExamSession } from '../types';

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
            const response = await fetch('/api/history');
            if (!response.ok) throw new Error('Failed to fetch history');
            const json = await response.json();
            // Ensure questionIds is populated if missing
            const sessions = json.data.map((s: any) => ({
                ...s,
                questionIds: s.questionIds || (s.answers ? s.answers.map((a: any) => a.questionId) : [])
            }));
            set({ sessions, isLoading: false });
        } catch (error) {
            console.error(error);
            set({ error: 'Failed to load history', isLoading: false });
        }
    },

    addSession: async (session) => {
        // Optimistic update
        set((state) => ({ sessions: [session, ...state.sessions] }));
        try {
            const response = await fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(session),
            });
            if (!response.ok) throw new Error('Failed to save session');
        } catch (error) {
            console.error(error);
            set({ error: 'Failed to save session to database' });
        }
    },

    clearHistory: async () => {
        set({ sessions: [] });
        try {
            await fetch('/api/history', { method: 'DELETE' });
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
