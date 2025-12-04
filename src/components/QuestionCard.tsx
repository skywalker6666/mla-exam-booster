import React from 'react';
import { Question } from '../types';
import OptionButton from './OptionButton';
import { cn } from '../utils/cn';

interface QuestionCardProps {
    question: Question;
    selectedIndex: number | null;
    onSelect: (index: number) => void;
    showResult?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    selectedIndex,
    onSelect,
    showResult = false,
}) => {
    return (
        <div className="card p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-wrap gap-2 mb-4">
                {question.topics.map((topic) => (
                    <span key={topic} className="px-2 py-1 rounded-md bg-slate-800 text-xs font-medium text-slate-400 border border-slate-700">
                        {topic}
                    </span>
                ))}
                {question.difficulty && (
                    <span className={cn(
                        "px-2 py-1 rounded-md text-xs font-medium border",
                        question.difficulty === 'EASY' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                            question.difficulty === 'MEDIUM' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                        {question.difficulty}
                    </span>
                )}
            </div>

            <h2 className="text-xl md:text-2xl font-semibold mb-8 leading-relaxed">
                {question.text}
            </h2>

            <div className="space-y-3">
                {question.options.map((option, idx) => (
                    <OptionButton
                        key={idx}
                        index={idx}
                        text={option}
                        isSelected={selectedIndex === idx}
                        onClick={() => onSelect(idx)}
                        disabled={showResult}
                        showResult={showResult}
                        isCorrect={idx === question.correctIndex}
                    />
                ))}
            </div>

            {showResult && question.explanation && (
                <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 text-sm leading-relaxed">
                    <strong className="text-primary block mb-1">Explanation:</strong>
                    {question.explanation}
                </div>
            )}
        </div>
    );
};

export default QuestionCard;
