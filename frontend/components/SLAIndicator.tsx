"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";

interface SLAIndicatorProps {
    deadline: string;
    status: string; // Add status as a prop
}

export default function SLAIndicator({ deadline, status }: SLAIndicatorProps) {
    const isOverdue = new Date() > new Date(deadline);

    // 1. If the parcel is finished, the SLA is MET (even if it was late)
    const isFinished = status === 'delivered' || status === 'returned';

    if (isFinished) {
        return (
            <Badge className="bg-emerald-50 text-emerald-700 border-2 border-emerald-100 font-black text-[10px] uppercase tracking-widest px-3 py-1 shadow-none">
                SLA COMPLETED
            </Badge>
        );
    }

    // 2. If it's cancelled, we don't track SLA
    if (status === 'cancelled') {
        return (
            <Badge variant="outline" className="text-slate-400 border-slate-200 font-black text-[10px] uppercase tracking-widest px-3 py-1 shadow-none">
                Inactive
            </Badge>
        );
    }

    // 3. If it's still active and overdue
    if (isOverdue || status === 'return_overdue') {
        return (
            <Badge className="bg-red-50 text-red-700 border-2 border-red-100 font-black text-[10px] uppercase tracking-widest px-3 py-1 shadow-none animate-pulse">
                SLA BREACHED
            </Badge>
        );
    }

    // 4. Otherwise, it's on track
    return (
        <Badge className="bg-blue-50 text-blue-700 border-2 border-blue-100 font-black text-[10px] uppercase tracking-widest px-3 py-1 shadow-none">
            On Track
        </Badge>
    );
}