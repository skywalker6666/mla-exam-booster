import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useHistoryStore } from '../store/historyStore';
import questionsData from '../data/questions.json';
import { Question } from '../types';

const Stats: React.FC = () => {
    const { sessions } = useHistoryStore();

    // Aggregate stats by topic
    const topicStats = sessions.reduce((acc, session) => {
        session.answers.forEach(answer => {
            const question = (questionsData as Question[]).find(q => q.id === answer.questionId);
            if (!question) return;

            question.topics.forEach(topic => {
                if (!acc[topic]) {
                    acc[topic] = { name: topic, correct: 0, total: 0, percentage: 0 };
                }
                acc[topic].total += 1;
                if (answer.isCorrect) {
                    acc[topic].correct += 1;
                }
            });
        });
        return acc;
    }, {} as Record<string, { name: string; correct: number; total: number; percentage: number }>);

    // Calculate percentages
    const data = Object.values(topicStats).map(stat => ({
        ...stat,
        percentage: Math.round((stat.correct / stat.total) * 100)
    })).sort((a, b) => a.percentage - b.percentage); // Sort by weakness (lowest first)

    if (sessions.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-4">No Data Available</h2>
                <p className="text-muted">Take some exams to generate statistics.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Weakness Analysis</h1>

            <div className="card p-6 h-[400px]">
                <h3 className="text-lg font-semibold text-white mb-6">Topic Performance</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                        <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" fontSize={12} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                            itemStyle={{ color: '#f8fafc' }}
                            cursor={{ fill: '#334155', opacity: 0.4 }}
                        />
                        <Legend />
                        <Bar dataKey="percentage" name="Correct %" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Strongest Areas</h3>
                    <div className="space-y-4">
                        {data.slice().reverse().slice(0, 3).map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <span className="text-slate-300">{item.name}</span>
                                <span className="text-green-400 font-bold">{item.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Areas for Improvement</h3>
                    <div className="space-y-4">
                        {data.slice(0, 3).map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <span className="text-slate-300">{item.name}</span>
                                <span className="text-orange-400 font-bold">{item.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
