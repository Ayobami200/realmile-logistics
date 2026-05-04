"use client";

import React from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    Users,
    Truck,
    LogOut,
    Settings
} from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-100">
            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                        <Truck className="h-6 w-6" /> Realmile
                    </h2>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
                    <NavItem href="/dashboard/parcels" icon={<Package size={20} />} label="Parcels" />
                    <NavItem href="/dashboard/staff" icon={<Users size={20} />} label="Team" />
                    <NavItem href="/dashboard/partners" icon={<Truck size={20} />} label="Partners" />
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <NavItem href="/login" icon={<LogOut size={20} />} label="Logout" />
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Realmile Admin</span>
                        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                            RA
                        </div>
                    </div>
                </header>

                {/* This is where the actual page content will appear */}
                {children}
            </main>
        </div>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
        >
            {icon}
            <span className="font-medium text-sm">{label}</span>
        </Link>
    );
}