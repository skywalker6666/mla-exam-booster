import React from 'react';
import { Question } from '../types';
import { cn } from '../utils/cn';

interface OptionButtonProps {
    text: string;
    index: number;
    isSelected: boolean;
    onClick: () => void;
    disabled?: boolean;
    showResult?: boolean;
    isCorrect?: boolean;
}

const OptionButton: React.FC<OptionButtonProps> = ({
    text,
    index,
    isSelected,
    onClick,
    disabled,
    showResult,
    isCorrect,
}) => {
    let variantClass = "border-slate-700 hover:bg-slate-700/50 hover:border-slate-600";

    if (showResult) {
        if (isCorrect) {
            variantClass = "border-green-500 bg-green-500/10 text-green-400";
        } else if (isSelected && !isCorrect) {
            variantClass = "border-red-500 bg-red-500/10 text-red-400";
        } else {
            variantClass = "border-slate-700 opacity-50";
        }
    } else if (isSelected) {
        variantClass = "border-primary bg-primary/10 text-primary ring-1 ring-primary";
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 group",
                variantClass,
                disabled && !showResult && "opacity-50 cursor-not-allowed"
            )}
        >
            <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                isSelected || (showResult && isCorrect) ? "border-current" : "border-slate-600 group-hover:border-slate-500"
            )}>
                {(isSelected || (showResult && isCorrect)) && <div className="w-2.5 h-2.5 rounded-full bg-current" />}
            </div>
            <span className="leading-relaxed">{text}</span>
        </button>
    );
};

export default OptionButton;
