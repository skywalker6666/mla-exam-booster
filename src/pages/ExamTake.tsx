import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flag, Menu, X } from 'lucide-react';
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
    const [isNavOpen, setIsNavOpen] = useState(false);

    useEffect(() => {
        if (!currentSession) {
            navigate('/exam/start');
        }
    }, [currentSession, navigate]);

    // Close nav automatically on smaller screens when a question is selected
    const handleQuestionSelect = (idx: number) => {
        setCurrentIndex(idx);
        if (window.innerWidth < 1024) {
            setIsNavOpen(false);
        }
    };

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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const answeredCount = currentSession.answers.length;

    return (
        <div className="flex flex-col min-h-[calc(100vh-80px)] relative">
            {/* Header Bar - Full Width */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-slate-700/50 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-white">Q{currentIndex + 1}</span>
                            <span className="text-sm text-muted">of {currentSession.totalQuestions}</span>
                        </div>
                    </div>
                    <div className="hidden md:block w-32">
                        <ProgressBar current={answeredCount} total={currentSession.totalQuestions} />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Timer
                        durationSeconds={currentSession.durationSeconds}
                        onTimeUp={handleTimeUp}
                    />
                    <button
                        onClick={() => setIsNavOpen(!isNavOpen)}
                        className={cn(
                            "p-2 rounded-lg transition-colors",
                            isNavOpen ? "bg-primary text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        )}
                        title="Toggle Question Navigator"
                    >
                        {isNavOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 relative">
                {/* Main Content Area */}
                <div className={cn(
                    "flex-1 flex flex-col transition-all duration-300 ease-in-out w-full",
                    isNavOpen ? "lg:mr-80" : ""
                )}>
                    {/* Content Container - Centered with max-width */}
                    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col gap-6 flex-1">

                        {/* Question Card */}
                        <div className="flex-1">
                            <QuestionCard
                                question={question}
                                selectedIndex={currentAnswer?.selectedIndex ?? null}
                                selectedIndices={currentAnswer?.selectedIndices ?? []}
                                onSelect={handleAnswer}
                            />
                        </div>

                        {/* Bottom Navigation Buttons */}
                        <div className="flex items-center justify-between mt-auto">
                            <button
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="btn btn-secondary disabled:opacity-50 px-6"
                            >
                                <ChevronLeft size={20} />
                                Previous
                            </button>

                            {currentIndex === currentSession.totalQuestions - 1 ? (
                                <button
                                    onClick={handleSubmit}
                                    className="btn btn-primary bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20 px-8"
                                >
                                    Submit Exam
                                    <Flag size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="btn btn-primary px-8"
                                >
                                    Next
                                    <ChevronRight size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Question Navigator Sidebar - Fixed Right */}
                <div className={cn(
                    "fixed top-[73px] right-0 bottom-0 w-80 bg-surface border-l border-slate-700/50 p-4 transform transition-transform duration-300 ease-in-out z-10 flex flex-col shadow-2xl overflow-hidden",
                    // Note: top value adjusts based on header height (~73px)
                    isNavOpen ? "translate-x-0" : "translate-x-full"
                )}>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
                        <h3 className="font-bold text-white">Question Navigator</h3>
                        <div className="text-sm text-muted">
                            {answeredCount}/{currentSession.totalQuestions} Answered
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-5 gap-2">
                            {currentSession.questionIds.map((qid, idx) => {
                                const isAnswered = currentSession.answers.some(a => a.questionId === qid);
                                const isCurrent = idx === currentIndex;

                                return (
                                    <button
                                        key={qid}
                                        onClick={() => handleQuestionSelect(idx)}
                                        className={cn(
                                            "aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all relative overflow-hidden",
                                            isCurrent
                                                ? "bg-primary text-white shadow-lg shadow-primary/25 ring-2 ring-primary ring-offset-2 ring-offset-surface"
                                                : isAnswered
                                                    ? "bg-primary/15 text-primary border border-primary/30"
                                                    : "bg-slate-800/50 text-muted hover:bg-slate-800 border border-slate-700/50"
                                        )}
                                    >
                                        {idx + 1}
                                        {isAnswered && !isCurrent && (
                                            <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-primary rounded-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3 text-sm text-muted">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs shadow-lg">#</div>
                            <span>Current Question</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-xs relative">
                                #
                                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-primary rounded-full" />
                            </div>
                            <span>Answered</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-muted text-xs">#</div>
                            <span>Unanswered</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop for mobile */}
            {isNavOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-0 lg:hidden"
                    onClick={() => setIsNavOpen(false)}
                />
            )}
        </div>
    );
};

export default ExamTake;

