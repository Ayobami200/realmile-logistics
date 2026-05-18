"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Package,
    AlertTriangle,
    CheckCircle,
    Truck,
    Users,
    TrendingUp,
    BarChart3,
    RefreshCw,
    ArrowUpRight
} from 'lucide-react';
import api from '@/lib/api';

interface DashboardStats {
    total_by_status: Record<string, number>;
    delivery_sla_breaches: number;
    rider_workload: Record<string, number>;
    efficiency_score: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 bg-slate-50/50 font-sans">
            <div className="h-10 w-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Initializing Command Center...</p>
        </div>
    );

    return (
        <div className="p-8 space-y-10 bg-slate-50/50 min-h-screen font-sans">

            {/* 1. PREMIUM BRANDED BANNER */}
            <div className="relative h-64 w-full rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent z-10" />
                <div className="absolute right-0 top-0 h-full w-2/3 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-1000">
                    <div className="bg-[url('https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2075')] bg-cover bg-center h-full w-full" />
                </div>

                <div className="relative z-20 p-12 flex flex-col justify-center h-full">
                    <Badge className="w-fit bg-yellow-400 text-black border-none font-black text-[10px] px-3 py-1 mb-4 uppercase tracking-widest shadow-xl shadow-yellow-400/20">
                        Live Hub Status
                    </Badge>
                    <h2 className="text-6xl font-[1000] tracking-tighter text-white">
                        Realmile <span className="text-yellow-400 italic font-black">Express</span>
                    </h2>
                    <p className="text-slate-400 max-w-sm mt-4 font-bold text-xs leading-relaxed uppercase tracking-[0.25em] opacity-80">
                        Operations & Last-Mile Dispatch System
                    </p>
                </div>
            </div>

            {/* 2. PAGE HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-[1000] tracking-tighter text-slate-900">Hub Overview</h1>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60 mt-1">Real-time logistics performance</p>
                </div>
            </div>

            {/* 3. CORE STATS GRID - FIXED LAYOUT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                    title="Warehouse"
                    value={stats?.total_by_status.in_warehouse || 0}
                    icon={<Package />}
                    accentColor="bg-blue-600"
                    description="Ready for Dispatch"
                    onClick={() => router.push('/dashboard/parcels?filter=in_warehouse')}
                />
                <StatCard
                    title="Dispatched"
                    value={stats?.total_by_status.dispatched || 0}
                    icon={<Truck />}
                    accentColor="bg-amber-500"
                    description="Out for Delivery"
                    onClick={() => router.push('/dashboard/parcels?filter=dispatched')}
                />
                <StatCard
                    title="Delivered"
                    value={stats?.total_by_status.delivered || 0}
                    icon={<CheckCircle />}
                    accentColor="bg-emerald-500"
                    description="SLA Completed"
                    onClick={() => router.push('/dashboard/parcels?filter=delivered')}
                />
                <StatCard
                    title="Returned"
                    value={stats?.total_by_status.returned || 0}
                    icon={<RefreshCw />}
                    accentColor="bg-indigo-600"
                    description="Back in Hub"
                    onClick={() => router.push('/dashboard/parcels?filter=returned')}
                />
                <StatCard
                    title="SLA Breaches"
                    value={stats?.delivery_sla_breaches || 0}
                    icon={<AlertTriangle />}
                    accentColor="bg-red-600"
                    isUrgent={true}
                    description="Immediate Action"
                    onClick={() => router.push('/dashboard/parcels?filter=breached')}
                />
            </div>

            {/* 4. PERFORMANCE & WORKLOAD SECTION */}
            <div className="grid gap-8 lg:grid-cols-3">

                {/* RIDER WORKLOAD */}
                <Card className="lg:col-span-2 border-2 border-slate-100 rounded-[3rem] shadow-sm bg-white overflow-hidden">
                    <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-[1000] tracking-tight">Rider Workload</CardTitle>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 text-left">Active parcel distribution</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl">
                            <Users className="text-slate-400" size={20} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(stats?.rider_workload || {}).map(([name, count]) => (
                                <div key={name} className="flex items-center justify-between p-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] hover:border-slate-200 transition-all group cursor-default">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-xs font-black text-white shadow-lg group-hover:scale-110 transition-transform">
                                            {name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{name}</span>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div>
                                            <p className="text-xl font-black text-slate-900 leading-none">{count}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Parcels</p>
                                        </div>
                                        <div className="h-8 w-8 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-slate-900 transition-colors">
                                            <ArrowUpRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {Object.keys(stats?.rider_workload || {}).length === 0 && (
                                <div className="col-span-2 text-center py-10">
                                    <BarChart3 className="mx-auto text-slate-200 mb-2" size={32} />
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No active dispatches</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* HUB HEALTH SCORE */}
                <Card className="border-2 border-slate-100 rounded-[3rem] shadow-sm bg-white p-10 flex flex-col justify-between">
                    <div className="space-y-6 text-left">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${(stats?.efficiency_score || 0) > 80 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                            }`}>
                            <TrendingUp size={28} />
                        </div>
                        <h3 className="text-2xl font-[1000] tracking-tighter text-slate-900">System Integrity</h3>
                        <p className="text-sm font-bold text-slate-500 leading-relaxed">
                            Hub is operating at <span className="text-slate-900 font-black">{(stats?.efficiency_score || 0).toFixed(1)}%</span>.
                            This is the real-time success rate of all finalized operations.
                        </p>
                    </div>

                    <div className="pt-10">
                        <div className="flex justify-between items-end mb-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Health Score</span>
                                <span className="text-3xl font-[1000] text-slate-900 tracking-tighter">
                                    {(stats?.efficiency_score || 0).toFixed(1)}%
                                </span>
                            </div>
                            <Badge className={`font-black text-[9px] uppercase tracking-widest px-2 py-1 shadow-md border-none ${(stats?.efficiency_score || 0) > 80 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                }`}>
                                {(stats?.efficiency_score || 0) > 80 ? 'Optimal' : 'Needs Action'}
                            </Badge>
                        </div>

                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${(stats?.efficiency_score || 0) > 80 ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`}
                                style={{ width: `${stats?.efficiency_score || 0}%` }}
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, description, accentColor, isUrgent, onClick }: any) {
    return (
        <Card
            onClick={onClick}
            className={`border-2 border-slate-100 shadow-sm bg-white transition-all duration-300 rounded-[2.5rem] p-2 overflow-hidden group cursor-pointer active:scale-95 ${isUrgent ? 'hover:border-red-600' : 'hover:border-slate-900'
                }`}
        >
            <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 transition-colors">
                    {title}
                </CardTitle>
                <div className={`p-3 rounded-2xl transition-all duration-300 ${accentColor} text-white group-hover:scale-110 shadow-lg`}>
                    {React.cloneElement(icon, { size: 18 })}
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-8 pt-2">
                <div className={`text-6xl font-[1000] tracking-tighter leading-none transition-transform duration-500 group-hover:scale-105 origin-left ${isUrgent ? 'text-red-600' : 'text-slate-900'
                    }`}>
                    {value}
                </div>
                <div className="flex items-center gap-2 mt-6">
                    <div className={`h-2 w-2 rounded-full ${isUrgent ? 'bg-red-600 animate-ping' : 'bg-slate-900 animate-pulse'}`} />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}