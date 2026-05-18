"use client";

import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Truck,
    Calendar,
    Phone,
    Building2,
    Search,
    Globe,
    Activity,
    ExternalLink
} from 'lucide-react';
import api from '@/lib/api';
import AddPartnerModal from '@/components/AddPartnerModal';

export default function PartnersPage() {
    const [partners, setPartners] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchPartners = () => {
        api.get('/partners/').then(res => setPartners(res.data));
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const filteredPartners = partners.filter((p: any) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-10 bg-slate-50/50 min-h-screen font-sans">

            {/* 1. OPERATIONS HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-[1000] tracking-tighter text-slate-900 leading-none">Partners</h1>
                    <p className="text-slate-500 font-bold text-sm mt-2 uppercase tracking-widest opacity-60 ml-1">
                        Logistics Hub & Third-Party Integrations
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-80">
                        <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="SEARCH PARTNER NAME..."
                            className="h-12 pl-12 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus:ring-0 focus:border-slate-900 transition-all font-black text-[10px] tracking-widest"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <AddPartnerModal onPartnerCreated={fetchPartners} />
                </div>
            </div>

            {/* 2. OPERATIONAL OVERVIEW CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PartnerStatCard
                    label="Active Hubs"
                    value={partners.length}
                    icon={<Building2 size={20} />}
                    color="bg-slate-900"
                />
                <PartnerStatCard
                    label="Total Consignments"
                    value="--"
                    icon={<Activity size={20} />}
                    color="bg-blue-600"
                />
                <PartnerStatCard
                    label="Global Network"
                    value="Stable"
                    icon={<Globe size={20} />}
                    color="bg-emerald-600"
                />
            </div>

            {/* 3. PREMIUM PARTNERS TABLE */}
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 border-b-2 border-slate-50">
                            <TableHead className="h-16 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] pl-10">Internal Code</TableHead>
                            <TableHead className="h-16 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Logistics Partner</TableHead>
                            <TableHead className="h-16 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Operational Contact</TableHead>
                            <TableHead className="h-16 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] text-right pr-10">Integration Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPartners.map((partner: any) => (
                            <TableRow key={partner.id} className="group border-slate-50 hover:bg-slate-50/80 transition-all duration-300">
                                <TableCell className="pl-10 py-6">
                                    <span className="font-mono font-black text-slate-400 text-xs tracking-tighter">
                                        ID-HUB-{partner.id.toString().padStart(3, '0')}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                                            <Truck size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-base font-[900] text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                                                {partner.name}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1">
                                                <ExternalLink size={10} /> Live Integration
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2.5 text-sm font-bold text-slate-700">
                                        <div className="h-8 w-8 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                            <Phone size={14} className="text-slate-400" />
                                        </div>
                                        {partner.contact_phone || 'NO CONTACT ASSIGNED'}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-10">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-bold text-slate-900">
                                            {new Date(partner.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                                            <Calendar size={10} /> Hub Joined
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredPartners.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-60 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="p-4 bg-slate-50 rounded-full text-slate-200">
                                            <Building2 size={40} />
                                        </div>
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                                            No External Partners Registered
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

// PREMIUM MINI STAT COMPONENT
function PartnerStatCard({ label, value, icon, color }: any) {
    return (
        <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] flex items-center justify-between shadow-sm group hover:border-slate-900 transition-all duration-300">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                <p className="text-4xl font-[1000] text-slate-900 tracking-tighter">{value}</p>
            </div>
            <div className={`p-4 ${color} text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
        </div>
    );
}