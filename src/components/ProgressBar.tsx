import React from 'react';

interface ProgressBarProps {
    current: number;
    total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
    const percentage = Math.round((current / total) * 100);

    return (
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
                className="bg-primary h-full transition-all duration-300 ease-out"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

export default ProgressBar;
