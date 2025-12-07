import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExamSession, Question, UserAnswer } from '../types';
import questionsData from '../data/questions.json';
import pastExamQuestionsData from '../data/past_exam_questions.json';
import { shuffle } from '../utils/shuffle';

// Combine all questions for lookup
const allQuestionsMap = new Map<string, Question>();
(questionsData as Question[]).forEach(q => allQuestionsMap.set(q.id, q));
(pastExamQuestionsData as Question[]).forEach(q => allQuestionsMap.set(q.id, q));

interface ExamSessionState {
    currentSession: ExamSession | null;
    startExam: (questionCount: number, durationMinutes: number, isPastExam?: boolean) => void;
    answerQuestion: (questionId: string, selectedIndex: number) => void;
    toggleMultiSelectAnswer: (questionId: string, selectedIndex: number) => void;
    finishExam: () => void;
    resetSession: () => void;
    getQuestion: (id: string) => Question | undefined;
    getAnswer: (questionId: string) => UserAnswer | undefined;
}

export const useExamSessionStore = create<ExamSessionState>()(
    persist(
        (set, get) => ({
            currentSession: null,

            startExam: (questionCount, durationMinutes, isPastExam = false) => {
                // Select the appropriate question pool
                const allQuestions = isPastExam
                    ? (pastExamQuestionsData as Question[])
                    : (questionsData as Question[]);

                // Smart Selection Logic
                let usedQuestionIds = new Set<string>();
                try {
                    const historyStorage = localStorage.getItem('exam-history-storage');
                    if (historyStorage) {
                        const parsed = JSON.parse(historyStorage);
                        const sessions = parsed.state?.sessions || [];

                        sessions.forEach((s: any) => {
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

                if (selectedQuestions.length < questionCount) {
                    const remainingCount = questionCount - selectedQuestions.length;
                    selectedQuestions = [...selectedQuestions, ...shuffledSeen.slice(0, remainingCount)];
                } else {
                    selectedQuestions = selectedQuestions.slice(0, questionCount);
                }

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
                    isPastExam,
                };

                set({ currentSession: newSession });
            },

            answerQuestion: (questionId, selectedIndex) => {
                const { currentSession } = get();
                if (!currentSession) return;

                const question = allQuestionsMap.get(questionId);
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

            toggleMultiSelectAnswer: (questionId, selectedIndex) => {
                const { currentSession } = get();
                if (!currentSession) return;

                const question = allQuestionsMap.get(questionId);
                if (!question) return;

                const existingAnswerIndex = currentSession.answers.findIndex(a => a.questionId === questionId);
                let newAnswers = [...currentSession.answers];

                // Check if this is a HOTSPOT without known correct answers
                const hasNoCorrectAnswer = question.hasNoCorrectAnswer ||
                    (question.isMultiSelect && !question.correctIndices);

                if (existingAnswerIndex >= 0) {
                    // Update existing answer
                    const existing = newAnswers[existingAnswerIndex];
                    let selectedIndices = existing.selectedIndices ? [...existing.selectedIndices] : [];

                    if (selectedIndices.includes(selectedIndex)) {
                        // Remove if already selected
                        selectedIndices = selectedIndices.filter(i => i !== selectedIndex);
                    } else {
                        // Add if not selected (respect selectCount limit)
                        const maxSelect = question.selectCount || 2;
                        if (selectedIndices.length < maxSelect) {
                            selectedIndices.push(selectedIndex);
                        } else {
                            // Replace oldest selection
                            selectedIndices.shift();
                            selectedIndices.push(selectedIndex);
                        }
                    }

                    // Check correctness for multi-select
                    // For HOTSPOT without correct answers, treat as practice (always correct)
                    let isCorrect = true;
                    if (!hasNoCorrectAnswer) {
                        const correctIndices = question.correctIndices || [question.correctIndex];
                        isCorrect = selectedIndices.length === correctIndices.length &&
                            selectedIndices.every(i => correctIndices.includes(i));
                    }

                    newAnswers[existingAnswerIndex] = {
                        questionId,
                        selectedIndex: selectedIndices[0] ?? null,
                        selectedIndices,
                        isCorrect
                    };
                } else {
                    // Create new answer
                    const selectedIndices = [selectedIndex];

                    // For HOTSPOT without correct answers, treat as practice (always correct)
                    let isCorrect = true;
                    if (!hasNoCorrectAnswer) {
                        const correctIndices = question.correctIndices || [question.correctIndex];
                        isCorrect = selectedIndices.length === correctIndices.length &&
                            selectedIndices.every(i => correctIndices.includes(i));
                    }

                    newAnswers.push({
                        questionId,
                        selectedIndex,
                        selectedIndices,
                        isCorrect
                    });
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

            getQuestion: (id) => allQuestionsMap.get(id),

            getAnswer: (questionId) => {
                const { currentSession } = get();
                if (!currentSession) return undefined;
                return currentSession.answers.find(a => a.questionId === questionId);
            },
        }),
        {
            name: 'exam-session-storage',
        }
    )
);
