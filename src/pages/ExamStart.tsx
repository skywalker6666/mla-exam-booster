import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileQuestion, Play } from 'lucide-react';
import { useExamSessionStore } from '../store/examSessionStore';
import { cn } from '../utils/cn';

const ExamStart: React.FC = () => {
    const navigate = useNavigate();
    const startExam = useExamSessionStore((state) => state.startExam);

    const [questionCount, setQuestionCount] = useState(20);
    const [duration, setDuration] = useState(30);

    const handleStart = () => {
        startExam(questionCount, duration);
        navigate('/exam/take');
    };

    const questionOptions = [10, 20, 40, 65];
    const timeOptions = [15, 30, 60, 180];

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Configure Exam</h1>

            <div className="card p-8 space-y-8">
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
                        className="w-full btn btn-primary py-4 text-lg shadow-xl shadow-primary/20"
                    >
                        <Play size={24} />
                        Start Exam
                    </button>
                    <p className="text-center text-sm text-muted mt-4">
                        You can pause or submit the exam at any time.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ExamStart;
