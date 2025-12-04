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
    const { currentSession, getQuestion, answerQuestion, finishExam } = useExamSessionStore();
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
    const currentAnswer = currentSession.answers.find(a => a.questionId === currentQuestionId);

    const handleAnswer = (selectedIndex: number) => {
        answerQuestion(currentQuestionId, selectedIndex);
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
            // We need to get the updated session from the store, but finishExam updates it.
            // However, the state update might be async in React's view, but Zustand is synchronous.
            // Let's grab the latest state directly.
            const finishedSession = useExamSessionStore.getState().currentSession;
            if (finishedSession) {
                addSession(finishedSession);
                navigate(`/exam/result/${finishedSession.id}`);
                // Reset session is not called here, so we can view results. 
                // It should be reset when starting a new exam.
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
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
                {/* Header */}
                <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-slate-700/50">
                    <div>
                        <span className="text-sm text-muted uppercase tracking-wider font-bold">Question</span>
                        <div className="text-2xl font-bold text-white">
                            {currentIndex + 1} <span className="text-muted text-lg">/ {currentSession.totalQuestions}</span>
                        </div>
                    </div>
                    <Timer
                        durationSeconds={currentSession.durationSeconds}
                        onTimeUp={handleTimeUp}
                    />
                </div>

                <ProgressBar current={currentIndex + 1} total={currentSession.totalQuestions} />

                {/* Question Card */}
                <div className="flex-1">
                    <QuestionCard
                        question={question}
                        selectedIndex={currentAnswer?.selectedIndex ?? null}
                        onSelect={handleAnswer}
                    />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between py-4">
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
            <div className="hidden md:flex flex-col w-72 bg-surface rounded-xl border border-slate-700/50 p-4 h-full overflow-hidden">
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
