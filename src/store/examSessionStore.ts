import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExamSession, Question } from '../types';
import questionsData from '../data/questions.json';
import { shuffle } from '../utils/shuffle';

interface ExamSessionState {
    currentSession: ExamSession | null;
    startExam: (questionCount: number, durationMinutes: number) => void;
    answerQuestion: (questionId: string, selectedIndex: number) => void;
    finishExam: () => void;
    resetSession: () => void;
    getQuestion: (id: string) => Question | undefined;
}

export const useExamSessionStore = create<ExamSessionState>()(
    persist(
        (set, get) => ({
            currentSession: null,

            startExam: (questionCount, durationMinutes) => {
                const allQuestions = questionsData as Question[];

                // Smart Selection Logic
                let usedQuestionIds = new Set<string>();
                try {
                    // Attempt to read history from local storage to prioritize new questions
                    // Note: This is a direct read to avoid circular dependency with historyStore
                    const historyStorage = localStorage.getItem('exam-history-storage');
                    if (historyStorage) {
                        const parsed = JSON.parse(historyStorage);
                        // Check if sessions exist in the parsed state
                        const sessions = parsed.state?.sessions || [];

                        sessions.forEach((s: any) => {
                            // Handle both data structures (local vs api)
                            if (s.questionIds && Array.isArray(s.questionIds)) {
                                s.questionIds.forEach((id: string) => usedQuestionIds.add(id));
                            } else if (s.answers && Array.isArray(s.answers)) {
                                s.answers.forEach((a: any) => usedQuestionIds.add(a.questionId));
                            }
                        });
                    }
                } catch (e) {
                    console.warn("Could not read history for smart selection, defaulting to random shuffle.", e);
                }

                // Filter questions
                const unseenQuestions = allQuestions.filter(q => !usedQuestionIds.has(q.id));
                const seenQuestions = allQuestions.filter(q => usedQuestionIds.has(q.id));

                // Shuffle groups
                const shuffledUnseen = shuffle([...unseenQuestions]);
                const shuffledSeen = shuffle([...seenQuestions]);

                // Select questions: prioritize unseen
                let selectedQuestions = [...shuffledUnseen];

                // If we need more, take from seen
                if (selectedQuestions.length < questionCount) {
                    const remainingCount = questionCount - selectedQuestions.length;
                    selectedQuestions = [...selectedQuestions, ...shuffledSeen.slice(0, remainingCount)];
                } else {
                    // If we have more unseen than needed, just take the first N
                    selectedQuestions = selectedQuestions.slice(0, questionCount);
                }

                // If we still don't have enough (e.g. total questions < requested), just take what we have
                // (Though UI shouldn't allow this ideally)

                const questionIds = selectedQuestions.map((q) => q.id);

                const newSession: ExamSession = {
                    id: crypto.randomUUID(),
                    startedAt: new Date().toISOString(),
                    finishedAt: null,
                    questionIds,
                    answers: [],
                    totalScore: 0,
                    totalQuestions: selectedQuestions.length,
                    durationSeconds: durationMinutes * 60,
                    timeSpentSeconds: 0,
                };

                set({ currentSession: newSession });
            },

            answerQuestion: (questionId, selectedIndex) => {
                const { currentSession } = get();
                if (!currentSession) return;

                const question = (questionsData as Question[]).find((q) => q.id === questionId);
                if (!question) return;

                const isCorrect = question.correctIndex === selectedIndex;

                const existingAnswerIndex = currentSession.answers.findIndex(a => a.questionId === questionId);
                let newAnswers = [...currentSession.answers];

                if (existingAnswerIndex >= 0) {
                    newAnswers[existingAnswerIndex] = { questionId, selectedIndex, isCorrect };
                } else {
                    newAnswers.push({ questionId, selectedIndex, isCorrect });
                }

                set({
                    currentSession: {
                        ...currentSession,
                        answers: newAnswers,
                    },
                });
            },

            finishExam: () => {
                const { currentSession } = get();
                if (!currentSession) return;

                const correctCount = currentSession.answers.filter((a) => a.isCorrect).length;
                const finishedAt = new Date().toISOString();
                const timeSpentSeconds = Math.floor(
                    (new Date(finishedAt).getTime() - new Date(currentSession.startedAt).getTime()) / 1000
                );

                set({
                    currentSession: {
                        ...currentSession,
                        finishedAt,
                        totalScore: correctCount,
                        timeSpentSeconds,
                    },
                });
            },

            resetSession: () => set({ currentSession: null }),

            getQuestion: (id) => (questionsData as Question[]).find((q) => q.id === id),
        }),
        {
            name: 'exam-session-storage',
        }
    )
);
