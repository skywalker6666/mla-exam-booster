import React from 'react';
import { Question } from '../types';
import OptionButton from './OptionButton';
import { cn } from '../utils/cn';

interface QuestionCardProps {
    question: Question;
    selectedIndex: number | null;
    selectedIndices?: number[];
    onSelect: (index: number) => void;
    showResult?: boolean;
    disabled?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    selectedIndex,
    selectedIndices = [],
    onSelect,
    showResult = false,
    disabled = false,
}) => {
    const isMultiSelect = question.isMultiSelect || false;
    const selectCount = question.selectCount || 2;

    // Check if this is an ordering/matching question that requires ordered selection
    const isOrdering = question.text.toLowerCase().includes('order') ||
        question.text.toLowerCase().includes('match') ||
        question.text.toLowerCase().includes('for each');

    // Check if this is a HOTSPOT without known correct answers
    // If it's multi-select but has no correctIndices, we don't know the correct answers
    const hasNoCorrectAnswer = question.hasNoCorrectAnswer ||
        (isMultiSelect && !question.correctIndices);

    // For multi-select, check if an option is selected
    const isOptionSelected = (idx: number) => {
        if (isMultiSelect) {
            return selectedIndices.includes(idx);
        }
        return selectedIndex === idx;
    };

    // For multi-select, check if an option is correct
    // Returns undefined if we don't know the correct answer
    const isOptionCorrect = (idx: number): boolean | undefined => {
        if (hasNoCorrectAnswer) {
            return undefined; // Don't show correct/wrong for HOTSPOT without answers
        }
        if (isMultiSelect && question.correctIndices) {
            return question.correctIndices.includes(idx);
        }
        return idx === question.correctIndex;
    };

    // Get selection order (1-based) for ordering questions
    const getSelectionOrder = (idx: number): number => {
        if (!isMultiSelect || !isOrdering) return 0;
        const position = selectedIndices.indexOf(idx);
        return position >= 0 ? position + 1 : 0;
    };

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
                {isMultiSelect && (
                    <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-medium">
                        {isOrdering ? `Select & Order ${selectCount}` : `Select ${selectCount}`}
                    </span>
                )}
                {hasNoCorrectAnswer && showResult && (
                    <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">
                        Practice Only (No Answer Key)
                    </span>
                )}
            </div>

            <h2 className="text-xl md:text-2xl font-semibold mb-6 leading-relaxed whitespace-pre-wrap">
                {question.text}
            </h2>

            {isMultiSelect && isOrdering && !showResult && (
                <p className="text-sm text-amber-400 mb-4 flex items-center gap-2">
                    <span className="inline-block w-5 h-5 rounded bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">1</span>
                    Click options in order. Click again to deselect.
                </p>
            )}

            <div className="space-y-3">
                {question.options.map((option, idx) => (
                    <OptionButton
                        key={idx}
                        index={idx}
                        text={option}
                        isSelected={isOptionSelected(idx)}
                        onClick={() => onSelect(idx)}
                        disabled={disabled || showResult}
                        showResult={showResult && !hasNoCorrectAnswer}
                        isCorrect={isOptionCorrect(idx)}
                        isMultiSelect={isMultiSelect}
                        selectionOrder={getSelectionOrder(idx)}
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
