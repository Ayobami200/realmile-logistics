"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users, Truck, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
            {/* SIDEBAR - THE "LUXURY" GOLD & BLACK DRAWER */}
            <motion.aside
                initial={{ x: -80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-72 bg-brand-black flex flex-col m-5 rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-white/5"
            >
                {/* BRAND LOGO AREA */}
                <div className="p-10 pb-12">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary p-2.5 rounded-2xl shadow-[0_0_20px_rgba(250,204,21,0.4)]">
                                <Truck className="h-6 w-6 text-black" strokeWidth={2.5} />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white">REALMILE</span>
                        </div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1 mt-2">
                            Logistics Hub v1.0
                        </span>
                    </div>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 px-6 space-y-3">
                    <NavItem href="/dashboard" icon={<LayoutDashboard />} label="Overview" active={pathname === '/dashboard'} />
                    <NavItem href="/dashboard/parcels" icon={<Package />} label="Parcels" active={pathname === '/dashboard/parcels'} />
                    <NavItem href="/dashboard/staff" icon={<Users />} label="Team" active={pathname === '/dashboard/staff'} />
                    <NavItem href="/dashboard/partners" icon={<Truck />} label="Partners" active={pathname === '/dashboard/partners'} />
                </nav>

                {/* LOGOUT FOOTER */}
                <div className="p-8 mt-auto border-t border-white/5">
                    <motion.button
                        whileHover={{ x: 5 }}
                        onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                        className="flex items-center gap-4 w-full px-5 py-4 text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 rounded-2xl transition-all duration-300 font-bold text-sm"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </motion.button>
                </div>
            </motion.aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col overflow-hidden py-5 pr-5">
                {/* GLASS TOPBAR */}
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="h-20 flex items-center justify-between px-10 bg-white/70 backdrop-blur-2xl rounded-4xl mb-5 border border-white shadow-sm"
                >
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            System Status: <span className="text-emerald-500">Live</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-black text-slate-800 uppercase">Realmile Admin</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Master Operations</div>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-brand-black text-primary border border-slate-800 flex items-center justify-center font-black shadow-lg">
                            RA
                        </div>
                    </div>
                </motion.header>

                {/* CONTENT CANVAS */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 overflow-y-auto rounded-4xl bg-white/40 backdrop-blur-md border border-white p-2"
                >
                    <AnimatePresence mode="wait">
                        {children}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}

// FANCY NAV ITEM COMPONENT
function NavItem({ href, icon, label, active }: { href: string, icon: React.ReactElement<any>, label: string, active: boolean }) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 group relative ${active
                        ? 'bg-primary text-black shadow-[0_15px_35px_rgba(250,204,21,0.3)]'
                        : 'text-slate-500 hover:bg-white/5 hover:text-primary'
                    }`}
            >
                {/* Active Indicator Dot */}
                {active && (
                    <motion.div
                        layoutId="active-pill"
                        className="absolute left-2 w-1 h-6 bg-black rounded-full"
                    />
                )}

                {React.cloneElement(icon, {
                    size: 20,
                    strokeWidth: 2.5,
                    className: active ? 'text-black' : 'text-slate-600 group-hover:text-primary transition-colors'
                })}

                <span className={`font-black text-xs uppercase tracking-widest ${active ? 'text-black' : 'group-hover:text-primary'}`}>
                    {label}
                </span>
            </motion.div>
        </Link>
    );
}