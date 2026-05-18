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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Search,
    ShieldCheck,
    Bike,
    Briefcase,
    Users,
    Mail,
    Phone,
    UserCircle2
} from 'lucide-react';
import api from '@/lib/api';

// FIXED PATH: Assumes AddStaffModal.tsx is in the components/ folder
import AddStaffModal from '@/components/AddStaffModal';

export default function StaffPage() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = () => {
        api.get('/users/').then(res => setUsers(res.data));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user: any) =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-10 bg-slate-50/50 min-h-screen font-sans">

            {/* 1. OPERATIONS HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-[1000] tracking-tighter text-slate-900 leading-none">Personnel</h1>
                    <p className="text-slate-500 font-bold text-sm mt-2 uppercase tracking-widest opacity-60 ml-1">
                        Access Control & Staff Distribution
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-80">
                        <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="SEARCH BY NAME OR EMAIL..."
                            className="h-12 pl-12 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus:ring-0 focus:border-slate-900 transition-all font-black text-[10px] tracking-widest"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Component uses onUserCreated based on your original code */}
                    <AddStaffModal onUserCreated={fetchUsers} />
                </div>
            </div>

            {/* 2. OPERATIONAL OVERVIEW CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatMiniCard
                    label="Active Staff"
                    value={users.length}
                    icon={<Users size={20} />}
                    color="bg-slate-900"
                />
                <StatMiniCard
                    label="Logistics Fleet"
                    value={users.filter((u: any) => u.role === 'rider' || u.role === 'foot_courier').length}
                    icon={<Bike size={20} />}
                    color="bg-amber-500"
                />
                <StatMiniCard
                    label="Control & Admin"
                    value={users.filter((u: any) => u.role === 'admin').length}
                    icon={<ShieldCheck size={20} />}
                    color="bg-blue-600"
                />
            </div>

            {/* 3. PREMIUM STAFF TABLE */}
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 border-b-2 border-slate-50">
                            <TableHead className="h-16 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] pl-10">Team Member</TableHead>
                            <TableHead className="h-16 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Designation</TableHead>
                            <TableHead className="h-16 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Contact Node</TableHead>
                            <TableHead className="h-16 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] text-right pr-10">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user: any) => (
                            <TableRow key={user.id} className="group border-slate-50 hover:bg-slate-50/80 transition-all duration-300">
                                <TableCell className="pl-10 py-6">
                                    <div className="flex items-center gap-5">
                                        <Avatar className="h-12 w-12 border-4 border-white shadow-lg shadow-slate-200 ring-1 ring-slate-100">
                                            <AvatarFallback className="bg-slate-900 text-white font-black text-xs uppercase">
                                                {user.full_name?.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-base font-[900] text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                                                {user.full_name}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                                                RM-UID-{user.id.toString().padStart(3, '0')}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <RoleBadge role={user.role} />
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <Mail className="h-3.5 w-3.5 text-slate-300" />
                                            {user.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                            <Phone className="h-3 w-3 text-slate-300" />
                                            {user.phone_number || 'CONTACT NOT ASSIGNED'}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-10">
                                    <Badge className="bg-emerald-50 text-emerald-700 border-2 border-emerald-100 font-black text-[9px] px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-none">
                                        Verified
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

// PREMIUM MINI STAT COMPONENT
function StatMiniCard({ label, value, icon, color }: any) {
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

// PREMIUM ROLE BADGE COMPONENT
function RoleBadge({ role }: { role: string }) {
    const roles: any = {
        admin: { style: "bg-slate-900 text-white border-slate-900", icon: ShieldCheck },
        rider: { style: "bg-amber-50 text-amber-700 border-amber-200", icon: Bike },
        accountant: { style: "bg-blue-50 text-blue-700 border-blue-200", icon: Briefcase },
        ops_staff: { style: "bg-purple-50 text-purple-700 border-purple-200", icon: UserCircle2 },
        foot_courier: { style: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Users },
    };

    const config = roles[role?.toLowerCase()] || roles.ops_staff;
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={`${config.style} border-2 font-black text-[10px] px-4 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-2 w-fit shadow-none`}>
            <Icon size={12} strokeWidth={3} />
            {role?.replace('_', ' ')}
        </Badge>
    );
}