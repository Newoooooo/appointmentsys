import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Github, Chrome } from 'lucide-react';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="min-h-screen flex bg-[#fdfcfc] dark:bg-[#141414] transition-colors duration-500">
            {/* Left Side: Dark Mode Minimalist Visuals */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#2f3035] dark:bg-[#1c1c1c] p-16 flex-col justify-between relative overflow-hidden">
                {/* Abstract Top Graphic */}
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

            {/* Right Side: High-Contrast Minimal Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
                <motion.div
                    key={isLogin ? 'login' : 'signup'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full space-y-10"
                >
                    <div className="space-y-3 text-center lg:text-left">
                        <p className="text-[10px] font-black text-[#F26389] uppercase tracking-[0.4em]">Get Started</p>
                        <h1 className="text-4xl font-black text-[#2f3035] dark:text-[#fdfcfc] tracking-tight">
                            {isLogin ? 'Welcome back' : 'Join the elite'}
                        </h1>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-3 px-4 py-4 border border-[#e6e4e6] dark:border-[#3f3835] rounded-2xl font-black text-[10px] uppercase tracking-widest text-[#2f3035] dark:text-[#b1b1b1] hover:bg-[#fdfcfc] dark:hover:bg-[#282828] transition-all">
                                <Chrome size={18} /> Google
                            </button>
                            <button className="flex items-center justify-center gap-3 px-4 py-4 border border-[#e6e4e6] dark:border-[#3f3835] rounded-2xl font-black text-[10px] uppercase tracking-widest text-[#2f3035] dark:text-[#b1b1b1] hover:bg-[#fdfcfc] dark:hover:bg-[#282828] transition-all">
                                <Github size={18} /> Github
                            </button>
                        </div>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#e6e4e6] dark:border-[#3f3835]" /></div>
                            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#fdfcfc] dark:bg-[#141414] px-4 text-[#b1b1b1] font-black tracking-[0.2em]">Or use email</span></div>
                        </div>

                        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#b1b1b1] uppercase tracking-widest ml-2">Studio Name</label>
                                    <input type="text" placeholder="The Wellness Lab" className="w-full px-5 py-4 bg-transparent rounded-2xl border border-[#e6e4e6] dark:border-[#3f3835] focus:border-[#F26389] outline-none transition-all text-[#2f3035] dark:text-[#fdfcfc]" />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#b1b1b1] uppercase tracking-widest ml-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#b1b1b1]" size={18} />
                                    <input type="email" placeholder="sarah@studio.com" className="w-full pl-14 pr-5 py-4 bg-transparent rounded-2xl border border-[#e6e4e6] dark:border-[#3f3835] focus:border-[#F26389] outline-none transition-all text-[#2f3035] dark:text-[#fdfcfc]" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between px-2">
                                    <label className="text-[10px] font-black text-[#b1b1b1] uppercase tracking-widest">Password</label>
                                    {isLogin && <button className="text-[10px] font-black text-[#F26389] uppercase tracking-widest">Forgot?</button>}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#b1b1b1]" size={18} />
                                    <input type="password" placeholder="••••••••" className="w-full pl-14 pr-5 py-4 bg-transparent rounded-2xl border border-[#e6e4e6] dark:border-[#3f3835] focus:border-[#F26389] outline-none transition-all text-[#2f3035] dark:text-[#fdfcfc]" />
                                </div>
                            </div>

                            <button className="w-full bg-[#2f3035] dark:bg-[#F26389] text-white py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-[#F26389]/10 mt-8">
                                {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-[10px] font-black text-[#b1b1b1] uppercase tracking-widest">
                        {isLogin ? "New to the platform?" : "Joined us before?"} {' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[#F26389] hover:underline underline-offset-4"
                        >
                            {isLogin ? 'Create Account' : 'Log in'}
                        </button>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;