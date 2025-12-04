import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, BarChart2, BookOpen } from 'lucide-react';
import { cn } from '../utils/cn';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/history', label: 'History', icon: History },
        { path: '/stats', label: 'Stats', icon: BarChart2 },
        { path: '/practice/wrong', label: 'Review', icon: BookOpen },
    ];

    return (
        <div className="min-h-screen bg-background text-text flex">
            {/* Sidebar */}
            <aside className="w-64 bg-surface border-r border-slate-700/50 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-700/50">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        MLA Booster
                    </h1>
                    <p className="text-xs text-muted mt-1">AWS Machine Learning Associate</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "text-muted hover:bg-slate-700/50 hover:text-text"
                                )}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-700/50">
                    <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-muted">
                        <p>v1.0.0 MVP</p>
                        <p>Ready for Exam</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-5xl mx-auto p-6 md:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
