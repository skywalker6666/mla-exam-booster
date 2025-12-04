import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useHistoryStore } from '../store/historyStore';
import QuestionCard from '../components/QuestionCard';
import { cn } from '../utils/cn';
import questionsData from '../data/questions.json';
import { Question } from '../types';

const PracticeWrong: React.FC = () => {
    const navigate = useNavigate();
    const { sessions } = useHistoryStore();
    const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    useEffect(() => {
        // Collect all wrong answers from history
        const wrongIds = new Set<string>();
        sessions.forEach(session => {
            session.answers.forEach(ans => {
                if (!ans.isCorrect) {
                    wrongIds.add(ans.questionId);
                }
            });
        });

        const questions = (questionsData as Question[]).filter(q => wrongIds.has(q.id));
        setWrongQuestions(questions);
    }, [sessions]);

    const handleAnswer = (index: number) => {
        setSelectedOption(index);
        setShowResult(true);
    };

    const handleNext = () => {
        if (currentIndex < wrongQuestions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowResult(false);
            setSelectedOption(null);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setShowResult(false); // Reset state when going back for simplicity in this mode
            setSelectedOption(null);
        }
    };

    if (wrongQuestions.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="inline-flex p-4 rounded-full bg-green-500/10 text-green-400 mb-4">
                    <CheckCircle size={48} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">No Wrong Answers Found</h2>
                <p className="text-muted mb-8">Great job! You haven't missed any questions yet or you haven't taken any exams.</p>
                <button onClick={() => navigate('/exam/start')} className="btn btn-primary">
                    Start New Exam
                </button>
            </div>
        );
    }

    const currentQuestion = wrongQuestions[currentIndex];

    return (
        <div className="max-w-3xl mx-auto h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <RefreshCw className="text-primary" />
                    Review Mistakes
                </h1>
                <div className="text-muted">
                    Question {currentIndex + 1} of {wrongQuestions.length}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-6">
                <QuestionCard
                    question={currentQuestion}
                    selectedIndex={selectedOption}
                    onSelect={handleAnswer}
                    showResult={showResult}
                />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="btn btn-secondary disabled:opacity-50"
                >
                    <ChevronLeft size={20} />
                    Previous
                </button>

                <button
                    onClick={handleNext}
                    disabled={currentIndex === wrongQuestions.length - 1}
                    className="btn btn-primary disabled:opacity-50"
                >
                    Next
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default PracticeWrong;
