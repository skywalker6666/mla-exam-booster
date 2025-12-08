import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, Cloud, Loader2 } from 'lucide-react';
import { useHistoryStore } from '../store/historyStore';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { cn } from '../utils/cn';

const History: React.FC = () => {
    const navigate = useNavigate();
    const { sessions, clearHistory, fetchHistory } = useHistoryStore();
    const { user } = useAuth();
    const [migrating, setMigrating] = useState(false);
    const [migrationResult, setMigrationResult] = useState<string | null>(null);

    // Migrate local history to cloud
    const handleMigrateToCloud = async () => {
        if (!user) return;

        setMigrating(true);
        setMigrationResult(null);

        try {
            // Fetch local history from SQLite
            const response = await fetch('/api/history');
            if (!response.ok) throw new Error('Failed to fetch local history');
            const json = await response.json();
            const localSessions = json.data || [];

            if (localSessions.length === 0) {
                setMigrationResult('No local history to migrate.');
                setMigrating(false);
                return;
            }

            // Upload each session to Supabase
            let successCount = 0;
            for (const session of localSessions) {
                const { error } = await supabase
                    .from('exam_sessions')
                    .upsert({
                        id: session.id,
                        user_id: user.id,
                        exam_type: session.isPastExam ? 'past_exam' : 'practice',
                        score: session.totalScore,
                        total: session.totalQuestions,
                        time_spent: session.timeSpentSeconds,
                        questions: session.questionIds || [],
                        answers: session.answers || [],
                        completed_at: session.finishedAt || session.startedAt,
                    }, { onConflict: 'id' });

                if (!error) successCount++;
            }

            setMigrationResult(`✅ Migrated ${successCount}/${localSessions.length} sessions to cloud!`);

            // Refresh history from cloud
            await fetchHistory();
        } catch (error) {
            console.error(error);
            setMigrationResult('❌ Migration failed. Please try again.');
        } finally {
            setMigrating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Exam History</h1>
                <div className="flex items-center gap-4">
                    {user && (
                        <button
                            onClick={handleMigrateToCloud}
                            disabled={migrating}
                            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 disabled:opacity-50"
                        >
                            {migrating ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Cloud size={16} />
                            )}
                            {migrating ? 'Migrating...' : 'Sync Local to Cloud'}
                        </button>
                    )}
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
            </div>

            {migrationResult && (
                <div className={cn(
                    "mb-4 p-3 rounded-lg text-sm",
                    migrationResult.startsWith('✅')
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : migrationResult.startsWith('❌')
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-slate-700/50 text-slate-300"
                )}>
                    {migrationResult}
                </div>
            )}

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
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        {session.isPastExam ? 'Past Exam' : 'Practice Exam'}
                                    </h3>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(session.startedAt).toLocaleDateString()} {new Date(session.startedAt).toLocaleTimeString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {Math.floor((session.timeSpentSeconds || 0) / 60)}m {(session.timeSpentSeconds || 0) % 60}s
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

