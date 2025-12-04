import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../utils/cn';

interface TimerProps {
    durationSeconds: number;
    onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ durationSeconds, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(durationSeconds);

    const hasTriggeredRef = React.useRef(false);

    useEffect(() => {
        if (timeLeft <= 0 && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            onTimeUp();
            return;
        }

        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const isWarning = timeLeft < 300; // Less than 5 mins

    return (
        <div className={cn(
            "flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-lg border",
            isWarning ? "text-red-400 border-red-400/30 bg-red-400/10" : "text-primary border-primary/30 bg-primary/10"
        )}>
            <Clock size={20} />
            <span>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
        </div>
    );
};

export default Timer;
