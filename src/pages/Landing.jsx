import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Shield, Smartphone } from 'lucide-react';

const LandingPage = () => (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-black text-xl">B</div>
                <span className="text-2xl font-bold tracking-tight text-slate-900">Bookly.</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
                <a href="#" className="hover:text-amber-600">Features</a>
                <a href="#" className="hover:text-amber-600">Pricing</a>
                <a href="#" className="hover:text-amber-600">Solutions</a>
            </div>
            <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform">
                Get Started Free
            </button>
        </nav>

        {/* Hero Section */}
        <section className="pt-20 pb-32 px-8">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                >
          <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-bold">
            v2.0 is now live! 🚀
          </span>
                    <h1 className="text-6xl font-black text-slate-900 leading-[1.1]">
                        Booking management <br />
                        <span className="text-amber-600 italic">simplified.</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
                        The all-in-one platform for service businesses. Manage staff, slots, and customers with a warm, modern interface.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-amber-200 hover:bg-amber-700 transition-all">
                            Start Your Free Trial
                        </button>
                        <button className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
                            Book a Demo
                        </button>
                    </div>
                    <div className="flex items-center gap-6 pt-4">
                        <div className="flex -space-x-3">
                            {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200" />)}
                        </div>
                        <p className="text-sm text-slate-500 font-medium">Join 2,000+ businesses growing with Bookly</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                >
                    <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 p-4 relative z-10">
                        <div className="bg-slate-50 rounded-[24px] overflow-hidden border border-slate-100">
                            {/* Mockup Dashboard Image/Graphic */}
                            <div className="h-[400px] w-full bg-gradient-to-br from-slate-100 to-white p-8">
                                <div className="w-full h-8 bg-white rounded-lg mb-4 flex items-center px-3 gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400" />
                                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2 h-48 bg-white rounded-2xl shadow-sm border border-slate-50" />
                                    <div className="h-48 bg-white rounded-2xl shadow-sm border border-slate-50" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
                </motion.div>
            </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-24 px-8 border-t border-slate-100">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl font-bold text-slate-900">Everything you need to scale</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">Focus on your craft while we handle the logistics of your business growth.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: Zap, title: "Instant Booking", desc: "Clients can book in 3 clicks from any device." },
                        { icon: Smartphone, title: "Mobile Ready", desc: "Manage your entire studio from your smartphone." },
                        { icon: Shield, title: "Secure Payments", desc: "Integrated Stripe and PayPal processing." },
                        { icon: CheckCircle, title: "Auto Reminders", desc: "Reduce no-shows by 40% with SMS alerts." }
                    ].map((feat, i) => (
                        <div key={i} className="p-8 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                                <feat.icon size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    </div>
);

export default LandingPage;