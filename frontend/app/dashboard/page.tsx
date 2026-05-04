"use client";
import ScanParcelModal from '@/components/ui/components/ScanParcelModal';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, CheckCircle, Truck, Clock } from 'lucide-react';
import api from '@/lib/api';

interface DashboardStats {
    total_by_status: Record<string, number>;
    delivery_sla_breaches: number;
    rider_workload: Record<string, number>;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return <div className="p-8">Loading Dashboard...</div>;

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Logistics Overview</h1>
                <p className="text-slate-500">Real-time status of Realmile operations.</p>
            </div>

            {/* STATS GRID */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                {/* Total Parcels */}
                <StatCard
                    title="In Warehouse"
                    value={stats?.total_by_status.in_warehouse || 0}
                    icon={<Package className="text-blue-600" />}
                    description="Awaiting dispatch"
                />

                {/* Dispatched */}
                <StatCard
                    title="Out for Delivery"
                    value={stats?.total_by_status.dispatched || 0}
                    icon={<Truck className="text-orange-600" />}
                    description="On the road"
                />

                {/* Delivered */}
                <StatCard
                    title="Delivered"
                    value={stats?.total_by_status.delivered || 0}
                    icon={<CheckCircle className="text-green-600" />}
                    description="Successfully completed"
                />

                {/* SLA BREACHES - Highlighted Red */}
                <Card className="border-red-200 bg-red-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-900">SLA Breaches</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">{stats?.delivery_sla_breaches}</div>
                        <p className="text-xs text-red-600 mt-1">Parcels exceeding 5 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* RIDER PERFORMANCE PREVIEW */}
            <Card>
                <CardHeader>
                    <CardTitle>Rider Workload</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(stats?.rider_workload || {}).map(([name, count]) => (
                            <div key={name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                        {name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium">{name}</span>
                                </div>
                                <Badge variant="secondary">{count} Parcels</Badge>
                            </div>
                        ))}
                        {Object.keys(stats?.rider_workload || {}).length === 0 && (
                            <p className="text-sm text-slate-500">No riders currently assigned.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ title, value, icon, description }: any) {
    return (
        <Card className="shadow-sm"> {/* Fixed: shadow-sm moved into className */}
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-slate-500 mt-1">{description}</p>
            </CardContent>
        </Card>
    );
}