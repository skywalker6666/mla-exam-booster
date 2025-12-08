import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { signIn, signUp } from '../lib/supabase';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (isSignUp && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await signUp(email, password);
                if (error) throw error;
                setSuccessMessage('Check your email for the confirmation link!');
            } else {
                const { error } = await signIn(email, password);
                if (error) throw error;
                navigate('/');
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent mb-2">
                        MLA Exam Booster
                    </h1>
                    <p className="text-slate-400">
                        {isSignUp ? 'Create your account' : 'Welcome back! Sign in to continue'}
                    </p>
                </div>

                {/* Form Card */}
                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-white placeholder-slate-500"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-white placeholder-slate-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Confirm Password (Sign Up only) */}
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-white placeholder-slate-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-lg">
                                <span className="text-sm">{successMessage}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : isSignUp ? (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Create Account
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Sign In / Sign Up */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                                setSuccessMessage('');
                            }}
                            className="text-primary hover:text-primary/80 text-sm transition-colors"
                        >
                            {isSignUp
                                ? 'Already have an account? Sign in'
                                : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </div>

                {/* Continue as Guest */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-500 hover:text-slate-400 text-sm transition-colors"
                    >
                        Continue as guest (progress won't sync)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
