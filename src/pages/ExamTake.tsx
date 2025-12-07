import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { useExamSessionStore } from '../store/examSessionStore';
import { useHistoryStore } from '../store/historyStore';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import ProgressBar from '../components/ProgressBar';
import { cn } from '../utils/cn';

const ExamTake: React.FC = () => {
    const navigate = useNavigate();
    const { currentSession, getQuestion, answerQuestion, toggleMultiSelectAnswer, finishExam, getAnswer } = useExamSessionStore();
    const addSession = useHistoryStore((state) => state.addSession);

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!currentSession) {
            navigate('/exam/start');
        }
    }, [currentSession, navigate]);

    if (!currentSession) return null;

    const currentQuestionId = currentSession.questionIds[currentIndex];
    const question = getQuestion(currentQuestionId);
    const currentAnswer = getAnswer(currentQuestionId);

    const handleAnswer = (selectedIndex: number) => {
        if (!question) return;

        if (question.isMultiSelect) {
            toggleMultiSelectAnswer(currentQuestionId, selectedIndex);
        } else {
            answerQuestion(currentQuestionId, selectedIndex);
        }
    };

    const handleNext = () => {
        if (currentIndex < currentSession.totalQuestions - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleSubmit = () => {
        if (window.confirm('Are you sure you want to submit your exam?')) {
            finishExam();
            const finishedSession = useExamSessionStore.getState().currentSession;
            if (finishedSession) {
                addSession(finishedSession);
                navigate(`/exam/result/${finishedSession.id}`);
            }
        }
    };

    const handleTimeUp = React.useCallback(() => {
        alert('Time is up! Submitting your exam.');
        finishExam();
        const finishedSession = useExamSessionStore.getState().currentSession;
        if (finishedSession) {
            addSession(finishedSession);
            navigate(`/exam/result/${finishedSession.id}`);
        }
    }, [finishExam, addSession, navigate]);

    if (!question) return <div>Loading question...</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-80px)]">
            {/* Main Content - Full width optimized */}
            <div className="flex-1 flex flex-col gap-3 max-w-6xl mx-auto w-full overflow-hidden">
                {/* Compact Header */}
                <div className="flex items-center justify-between bg-surface px-4 py-2 rounded-lg border border-slate-700/50 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div>
                            <span className="text-xs text-muted uppercase tracking-wider font-bold">Question</span>
                            <div className="text-xl font-bold text-white">
                                {currentIndex + 1} <span className="text-muted text-sm">/ {currentSession.totalQuestions}</span>
                            </div>
                        </div>
                        <ProgressBar current={currentIndex + 1} total={currentSession.totalQuestions} />
                    </div>
                    <Timer
                        durationSeconds={currentSession.durationSeconds}
                        onTimeUp={handleTimeUp}
                    />
                </div>

                {/* Question Card - Scrollable */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <QuestionCard
                        question={question}
                        selectedIndex={currentAnswer?.selectedIndex ?? null}
                        selectedIndices={currentAnswer?.selectedIndices ?? []}
                        onSelect={handleAnswer}
                    />
                </div>

                {/* Navigation - Always visible */}
                <div className="flex items-center justify-between py-4 sticky bottom-0 bg-background/95 backdrop-blur-sm -mx-4 px-4 border-t border-slate-800">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="btn btn-secondary disabled:opacity-50"
                    >
                        <ChevronLeft size={20} />
                        Previous
                    </button>

                    {currentIndex === currentSession.totalQuestions - 1 ? (
                        <button
                            onClick={handleSubmit}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 shadow-green-500/20"
                        >
                            Submit Exam
                            <Flag size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="btn btn-primary"
                        >
                            Next
                            <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Sidebar Navigation (Desktop) */}
            <div className="hidden lg:flex flex-col w-64 bg-surface rounded-xl border border-slate-700/50 p-4 h-fit sticky top-4 max-h-[calc(100vh-120px)] overflow-hidden">
                <h3 className="font-bold text-white mb-4">Question Navigator</h3>
                <div className="grid grid-cols-5 gap-2 overflow-y-auto content-start flex-1 pr-2">
                    {currentSession.questionIds.map((qid, idx) => {
                        const isAnswered = currentSession.answers.some(a => a.questionId === qid);
                        const isCurrent = idx === currentIndex;

                        return (
                            <button
                                key={qid}
                                onClick={() => setCurrentIndex(idx)}
                                className={cn(
                                    "aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                                    isCurrent
                                        ? "bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-surface"
                                        : isAnswered
                                            ? "bg-primary/20 text-primary border border-primary/30"
                                            : "bg-slate-800 text-muted hover:bg-slate-700 border border-slate-700"
                                )}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700 space-y-2 text-xs text-muted">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-primary"></div>
                        <span>Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-primary/20 border border-primary/30"></div>
                        <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></div>
                        <span>Unanswered</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamTake;
