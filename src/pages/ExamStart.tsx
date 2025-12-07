import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileQuestion, Play, BookOpen, Sparkles } from 'lucide-react';
import { useExamSessionStore } from '../store/examSessionStore';
import { cn } from '../utils/cn';

type ExamMode = 'practice' | 'past_exam';

const ExamStart: React.FC = () => {
    const navigate = useNavigate();
    const startExam = useExamSessionStore((state) => state.startExam);

    const [examMode, setExamMode] = useState<ExamMode>('practice');
    const [questionCount, setQuestionCount] = useState(20);
    const [duration, setDuration] = useState(30);

    const handleStart = () => {
        startExam(questionCount, duration, examMode === 'past_exam');
        navigate('/exam/take');
    };

    const questionOptions = examMode === 'past_exam' ? [10, 20, 40, 73] : [10, 20, 40, 65];
    const timeOptions = [15, 30, 60, 180];

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Configure Exam</h1>

            <div className="card p-8 space-y-8">
                {/* Exam Mode Selection */}
                <div>
                    <label className="flex items-center gap-2 text-lg font-medium text-white mb-4">
                        <Sparkles className="text-primary" />
                        Exam Mode
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setExamMode('practice')}
                            className={cn(
                                "p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2",
                                examMode === 'practice'
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-slate-700 hover:border-slate-600 text-muted hover:text-white"
                            )}
                        >
                            <FileQuestion size={28} />
                            <span className="font-bold">Practice Mode</span>
                            <span className="text-xs opacity-75">300 custom questions</span>
                        </button>
                        <button
                            onClick={() => setExamMode('past_exam')}
                            className={cn(
                                "p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2",
                                examMode === 'past_exam'
                                    ? "border-amber-500 bg-amber-500/10 text-amber-400"
                                    : "border-slate-700 hover:border-slate-600 text-muted hover:text-white"
                            )}
                        >
                            <BookOpen size={28} />
                            <span className="font-bold">Past Exam Mode</span>
                            <span className="text-xs opacity-75">73 real exam questions</span>
                        </button>
                    </div>
                </div>

                {/* Question Count Selection */}
                <div>
                    <label className="flex items-center gap-2 text-lg font-medium text-white mb-4">
                        <FileQuestion className="text-primary" />
                        Number of Questions
                    </label>
                    <div className="grid grid-cols-4 gap-4">
                        {questionOptions.map((count) => (
                            <button
                                key={count}
                                onClick={() => setQuestionCount(count)}
                                className={cn(
                                    "p-4 rounded-xl border-2 transition-all duration-200 font-bold text-lg",
                                    questionCount === count
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-slate-700 hover:border-slate-600 text-muted hover:text-white"
                                )}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Selection */}
                <div>
                    <label className="flex items-center gap-2 text-lg font-medium text-white mb-4">
                        <Clock className="text-primary" />
                        Time Limit (Minutes)
                    </label>
                    <div className="grid grid-cols-4 gap-4">
                        {timeOptions.map((time) => (
                            <button
                                key={time}
                                onClick={() => setDuration(time)}
                                className={cn(
                                    "p-4 rounded-xl border-2 transition-all duration-200 font-bold text-lg",
                                    duration === time
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-slate-700 hover:border-slate-600 text-muted hover:text-white"
                                )}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-700/50">
                    <button
                        onClick={handleStart}
                        className={cn(
                            "w-full btn py-4 text-lg shadow-xl",
                            examMode === 'past_exam'
                                ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/20"
                                : "btn-primary shadow-primary/20"
                        )}
                    >
                        <Play size={24} />
                        {examMode === 'past_exam' ? 'Start Past Exam' : 'Start Practice Exam'}
                    </button>
                    <p className="text-center text-sm text-muted mt-4">
                        {examMode === 'past_exam'
                            ? "Questions from real AWS MLA-C01 exams with explanations."
                            : "You can pause or submit the exam at any time."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ExamStart;
