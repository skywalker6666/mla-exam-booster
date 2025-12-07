import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowLeft, BarChart2, FileText } from 'lucide-react';
import { useHistoryStore } from '../store/historyStore';
import { useExamSessionStore } from '../store/examSessionStore';
import QuestionCard from '../components/QuestionCard';
import { cn } from '../utils/cn';
import { generateWrongNotesHTML } from '../utils/wrongNotesGenerator';
import questionsData from '../data/questions.json';
import pastExamQuestionsData from '../data/past_exam_questions.json';
import { Question } from '../types';

// Combine all questions for lookup
const allQuestionsMap = new Map<string, Question>();
(questionsData as Question[]).forEach(q => allQuestionsMap.set(q.id, q));
(pastExamQuestionsData as Question[]).forEach(q => allQuestionsMap.set(q.id, q));

const ExamResult: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { sessions } = useHistoryStore();

    // Try to find in history first, then check current session if just finished
    const session = sessions.find(s => s.id === id) ||
        (useExamSessionStore.getState().currentSession?.id === id ? useExamSessionStore.getState().currentSession : null);

    if (!session) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-4">Session not found</h2>
                <button onClick={() => navigate('/')} className="btn btn-primary">
                    Go Home
                </button>
            </div>
        );
    }

    const percentage = Math.round((session.totalScore / session.totalQuestions) * 100);
    const isPass = percentage >= 72;

    // Get wrong answers
    const wrongAnswers = session.answers.filter(a => !a.isCorrect);

    const handleExportNotion = () => {
        if (wrongAnswers.length === 0) {
            alert('恭喜！沒有錯題需要導出。');
            return;
        }

        // Generate HTML and open in new tab
        const html = generateWrongNotesHTML({
            date: new Date().toLocaleDateString('zh-TW'),
            score: session.totalScore,
            totalQuestions: session.totalQuestions,
            percentage,
            timeSpentSeconds: session.timeSpentSeconds,
            wrongAnswers,
            getQuestion: (id) => allQuestionsMap.get(id)
        });

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    // Calculate topic stats
    const topicStats = session.answers.reduce((acc, answer) => {
        const question = allQuestionsMap.get(answer.questionId);
        if (!question) return acc;

        question.topics.forEach(topic => {
            if (!acc[topic]) {
                acc[topic] = { correct: 0, total: 0 };
            }
            acc[topic].total += 1;
            if (answer.isCorrect) {
                acc[topic].correct += 1;
            }
        });
        return acc;
    }, {} as Record<string, { correct: number; total: number }>);

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={cn(
                    "md:col-span-2 card p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden",
                    isPass ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
                )}>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {isPass ? 'Congratulations! Passed' : 'Keep Practicing'}
                        </h1>
                        <p className="text-muted mb-6">
                            {isPass
                                ? 'You have demonstrated a solid understanding of the exam topics.'
                                : 'Review your weak areas and try again. You can do this!'}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => navigate('/')} className="btn btn-secondary">
                                <ArrowLeft size={18} />
                                Dashboard
                            </button>
                            <button onClick={() => navigate('/exam/start')} className="btn btn-primary">
                                Try Again
                            </button>
                            {wrongAnswers.length > 0 && (
                                <button
                                    onClick={handleExportNotion}
                                    className="btn bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white"
                                >
                                    <FileText size={18} />
                                    Export Wrong Notes
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className={cn(
                            "text-6xl font-bold mb-2",
                            isPass ? "text-green-400" : "text-red-400"
                        )}>
                            {percentage}%
                        </div>
                        <div className="text-sm text-muted uppercase tracking-wider font-bold">Total Score</div>
                        <div className="text-xl text-white mt-1">
                            {session.totalScore} <span className="text-muted">/ {session.totalQuestions}</span>
                        </div>
                    </div>
                </div>

                <div className="card p-6 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 text-muted mb-1">
                            <Clock size={16} />
                            <span className="text-sm font-medium">Time Taken</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {Math.floor(session.timeSpentSeconds / 60)}m {session.timeSpentSeconds % 60}s
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-muted mb-1">
                            <BarChart2 size={16} />
                            <span className="text-sm font-medium">Accuracy</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {percentage}%
                        </div>
                    </div>
                    {wrongAnswers.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 text-muted mb-1">
                                <XCircle size={16} />
                                <span className="text-sm font-medium">Wrong Answers</span>
                            </div>
                            <div className="text-2xl font-bold text-red-400">
                                {wrongAnswers.length}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Topic Analysis */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Topic Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(topicStats).map(([topic, stats]) => {
                        const topicPercent = Math.round((stats.correct / stats.total) * 100);
                        return (
                            <div key={topic} className="card p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-white">{topic}</span>
                                    <span className={cn(
                                        "text-sm font-bold",
                                        topicPercent >= 70 ? "text-green-400" : "text-orange-400"
                                    )}>{topicPercent}%</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5">
                                    <div
                                        className={cn(
                                            "h-full rounded-full",
                                            topicPercent >= 70 ? "bg-green-500" : "bg-orange-500"
                                        )}
                                        style={{ width: `${topicPercent}%` }}
                                    />
                                </div>
                                <div className="text-xs text-muted mt-2 text-right">
                                    {stats.correct} / {stats.total} correct
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detailed Review */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Detailed Review</h2>
                <div className="space-y-6">
                    {session.answers.map((answer, idx) => {
                        const question = allQuestionsMap.get(answer.questionId);
                        if (!question) return null;

                        return (
                            <div key={idx} className="relative">
                                <div className="absolute -left-3 top-6 -translate-x-full hidden xl:block">
                                    {answer.isCorrect ? (
                                        <CheckCircle className="text-green-500" size={24} />
                                    ) : (
                                        <XCircle className="text-red-500" size={24} />
                                    )}
                                </div>
                                <QuestionCard
                                    question={question}
                                    selectedIndex={answer.selectedIndex}
                                    selectedIndices={answer.selectedIndices ?? []}
                                    onSelect={() => { }}
                                    showResult={true}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ExamResult;
