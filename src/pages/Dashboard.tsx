import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, TrendingUp, Clock, Award } from 'lucide-react';
import { useHistoryStore } from '../store/historyStore';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { getStats, sessions, fetchHistory } = useHistoryStore();

    React.useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const stats = getStats();

    const recentSessions = sessions.slice(0, 3);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Candidate</h1>
                <p className="text-muted">Ready to ace your AWS MLA certification?</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                        <Award size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted">Average Score</p>
                        <p className="text-2xl font-bold text-white">{stats.averageScore}%</p>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted">Exams Taken</p>
                        <p className="text-2xl font-bold text-white">{stats.totalExams}</p>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-500/10 text-green-400">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted">Questions Answered</p>
                        <p className="text-2xl font-bold text-white">{stats.totalQuestionsAnswered}</p>
                    </div>
                </div>
            </div>

            {/* Main Action */}
            <div className="card p-8 border-primary/20 bg-gradient-to-br from-surface to-slate-900 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Play size={120} />
                </div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-2">Start New Simulation</h2>
                    <p className="text-muted mb-6 max-w-md">
                        Take a full timed exam or customize your practice session.
                        Simulate the real exam environment.
                    </p>
                    <button
                        onClick={() => navigate('/exam/start')}
                        className="btn btn-primary px-8 py-3 text-lg"
                    >
                        <Play size={20} />
                        Start Exam
                    </button>
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {recentSessions.length === 0 ? (
                        <p className="text-muted italic">No exams taken yet.</p>
                    ) : (
                        recentSessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => navigate(`/exam/result/${session.id}`)}
                                className="card p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-12 rounded-full ${(session.totalScore / session.totalQuestions) >= 0.7 ? 'bg-green-500' : 'bg-orange-500'
                                        }`} />
                                    <div>
                                        <p className="font-medium text-white">Practice Exam</p>
                                        <p className="text-sm text-muted">{new Date(session.startedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-white">
                                        {Math.round((session.totalScore / session.totalQuestions) * 100)}%
                                    </p>
                                    <p className="text-xs text-muted">{session.totalQuestions} Questions</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
