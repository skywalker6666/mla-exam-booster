import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { useHistoryStore } from '../store/historyStore';
import { cn } from '../utils/cn';

const History: React.FC = () => {
    const navigate = useNavigate();
    const { sessions, clearHistory } = useHistoryStore();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Exam History</h1>
                {sessions.length > 0 && (
                    <button
                        onClick={() => {
                            if (confirm('Clear all history?')) clearHistory();
                        }}
                        className="text-sm text-red-400 hover:text-red-300"
                    >
                        Clear History
                    </button>
                )}
            </div>

            {sessions.length === 0 ? (
                <div className="text-center py-20 card border-dashed border-slate-700">
                    <p className="text-muted mb-4">No exams taken yet.</p>
                    <button onClick={() => navigate('/exam/start')} className="btn btn-primary">
                        Start Your First Exam
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((session) => {
                        const percentage = Math.round((session.totalScore / session.totalQuestions) * 100);
                        const isPass = percentage >= 72;

                        return (
                            <div
                                key={session.id}
                                onClick={() => navigate(`/exam/result/${session.id}`)}
                                className="card p-6 flex flex-col md:flex-row items-center gap-6 hover:border-primary/50 transition-colors cursor-pointer group"
                            >
                                <div className={cn(
                                    "w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-4",
                                    isPass
                                        ? "border-green-500/20 text-green-400 bg-green-500/10"
                                        : "border-orange-500/20 text-orange-400 bg-orange-500/10"
                                )}>
                                    {percentage}%
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-lg font-bold text-white mb-1">Practice Exam</h3>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(session.startedAt).toLocaleDateString()} {new Date(session.startedAt).toLocaleTimeString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {Math.floor(session.timeSpentSeconds / 60)}m {session.timeSpentSeconds % 60}s
                                        </div>
                                        <div>
                                            {session.totalScore} / {session.totalQuestions} Correct
                                        </div>
                                    </div>
                                </div>

                                <ChevronRight className="text-slate-600 group-hover:text-primary transition-colors" />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default History;
