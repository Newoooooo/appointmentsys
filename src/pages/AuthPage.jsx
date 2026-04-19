import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Chrome, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthPage = () => {
    const { signInWithGoogle, authError, setAuthError, loading } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleGoogleSignIn = async () => {
        setAuthError('');
        setIsSigningIn(true);
        try {
            await signInWithGoogle();
            // Navigation handled by App.jsx ProtectedRoute after auth state resolves
        } catch {
            // authError is set inside signInWithGoogle if needed
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#fdfcfc] dark:bg-[#141414] transition-colors duration-500">
            {/* Left Side */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#2f3035] dark:bg-[#1c1c1c] p-16 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full border-[1px] border-[#f9b095]" />
                    <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full border-[1px] border-[#F26389]" />
                </div>

                <div className="relative z-10">
                    <div className="w-14 h-14 bg-[#F26389] rounded-[20px] flex items-center justify-center text-white font-black text-2xl mb-12 shadow-2xl shadow-[#F26389]/30">
                        B
                    </div>
                    <h2 className="text-5xl font-black text-[#fdfcfc] leading-[1.1] tracking-tighter max-w-md">
                        The new standard <br />
                        <span className="text-[#f9b095]">for modern studios.</span>
                    </h2>
                </div>

                <div className="relative z-10 max-w-sm">
                    <div className="h-[1px] w-12 bg-[#F26389] mb-6" />
                    <p className="text-[#b1b1b1] text-lg font-medium leading-relaxed italic mb-8">
                        "Finally, a booking engine that values design as much as functionality. Our conversion rate doubled in a month."
                    </p>
                    <div className="flex items-center gap-4">
                        <img src="https://i.pravatar.cc/150?u=marcus" className="w-12 h-12 rounded-2xl grayscale border border-[#4e4e4e]" alt="" />
                        <div>
                            <p className="text-[#fdfcfc] font-bold text-sm">Marcus Thorne</p>
                            <p className="text-[#b1b1b1] text-[10px] uppercase font-black tracking-widest">Founder, Bloom Wellness</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full space-y-10"
                >
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#F26389] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                            B
                        </div>
                        <span className="text-xl font-black tracking-tighter text-[#2f3035] dark:text-[#fdfcfc]">bookly</span>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-[#F26389] uppercase tracking-[0.4em]">Staff Portal</p>
                        <h1 className="text-4xl font-black text-[#2f3035] dark:text-[#fdfcfc] tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-[#b1b1b1]">Sign in with your authorised Google account to continue.</p>
                    </div>

                    {authError && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl text-red-600 dark:text-red-400"
                        >
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{authError}</p>
                        </motion.div>
                    )}

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isSigningIn || loading}
                        className="w-full flex items-center justify-center gap-4 px-6 py-5 border-2 border-[#e6e4e6] dark:border-[#3f3835] rounded-2xl font-black text-sm uppercase tracking-widest text-[#2f3035] dark:text-[#fdfcfc] hover:border-[#F26389] hover:bg-[#F26389]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
                    >
                        {isSigningIn ? (
                            <div className="w-5 h-5 border-2 border-[#F26389] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Chrome size={20} className="text-[#F26389]" />
                        )}
                        <span>{isSigningIn ? 'Signing in…' : 'Continue with Google'}</span>
                        {!isSigningIn && (
                            <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </button>

                    <p className="text-center text-[10px] font-bold text-[#b1b1b1] tracking-wider">
                        Access is restricted to authorised admin and staff accounts only.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;