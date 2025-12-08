import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, BarChart2, BookOpen, LogIn, LogOut, User } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../lib/supabase';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    const navItems = [
        { path: '/', label: 'Home', icon: LayoutDashboard },
        { path: '/history', label: 'History', icon: History },
        { path: '/stats', label: 'Stats', icon: BarChart2 },
        { path: '/practice/wrong', label: 'Review', icon: BookOpen },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background text-text flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden bg-surface border-b border-slate-700/50 p-4 flex items-center justify-between">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    MLA Booster
                </h1>
                {loading ? null : user ? (
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-sm text-muted hover:text-red-400"
                    >
                        <User size={16} className="text-primary" />
                        <LogOut size={16} />
                    </button>
                ) : (
                    <Link
                        to="/login"
                        className="flex items-center gap-2 text-sm bg-primary/20 text-primary px-3 py-1.5 rounded-lg"
                    >
                        <LogIn size={16} />
                        <span>Login</span>
                    </Link>
                )}
            </header>

            {/* Desktop Sidebar */}
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

                {/* User Section */}
                <div className="p-4 border-t border-slate-700/50">
                    {loading ? (
                        <div className="text-muted text-sm">Loading...</div>
                    ) : user ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <User size={16} className="text-primary" />
                                <span className="text-slate-300 truncate">{user.email}</span>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 text-sm text-muted hover:text-red-400 transition-colors w-full"
                            >
                                <LogOut size={16} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                            <LogIn size={16} />
                            <span>Sign In to Sync</span>
                        </Link>
                    )}
                </div>

                <div className="p-4 border-t border-slate-700/50">
                    <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-muted">
                        <p>v1.1.0</p>
                        <p>{user ? '☁️ Cloud Sync' : '💾 Local Only'}</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto pb-20 md:pb-0">
                <div className="max-w-5xl mx-auto p-4 md:p-10">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-slate-700/50 flex justify-around items-center py-2 px-1 z-50">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
                                isActive
                                    ? "text-primary"
                                    : "text-muted"
                            )}
                        >
                            <Icon size={20} />
                            <span className="text-xs">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default Layout;


