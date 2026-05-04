"use client";

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from '@/lib/api';
import AddStaffModal from '@/components/ui/components/AddStaffModal';

export default function StaffPage() {
    const [users, setUsers] = useState([]);

    const fetchUsers = () => {
        api.get('/users/').then(res => setUsers(res.data));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
                    <p className="text-slate-500 text-sm">Manage staff roles and access permissions.</p>
                </div>
                <AddStaffModal onUserCreated={fetchUsers} />
            </div>

            <div className="bg-white rounded-md border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Staff Member</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user: any) => (
                            <TableRow key={user.id}>
                                <TableCell className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                        {user.full_name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium">{user.full_name}</div>
                                        <div className="text-xs text-slate-500">{user.email}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <RoleBadge role={user.role} />
                                </TableCell>
                                <TableCell className="text-sm">{user.phone_number || 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                        Active
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

function RoleBadge({ role }: { role: string }) {
    const styles: any = {
        admin: "bg-purple-100 text-purple-700 border-purple-200",
        accountant: "bg-blue-100 text-blue-700 border-blue-200",
        ops_staff: "bg-orange-100 text-orange-700 border-orange-200",
        rider: "bg-green-100 text-green-700 border-green-200",
        foot_courier: "bg-teal-100 text-teal-700 border-teal-200",
    };

    return (
        <Badge variant="outline" className={styles[role] || ""}>
            {role.replace('_', ' ').toUpperCase()}
        </Badge>
    );
}