"use client";

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, Calendar, Phone, Hash } from 'lucide-react';
import api from '@/lib/api';
import AddPartnerModal from '@/components/ui/components/AddPartnerModal';

export default function PartnersPage() {
    const [partners, setPartners] = useState([]);

    const fetchPartners = () => {
        api.get('/partners/').then(res => setPartners(res.data));
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Logistics Partners</h1>
                    <p className="text-slate-500 text-sm">Managing external hub integrations.</p>
                </div>
                <AddPartnerModal onPartnerCreated={fetchPartners} />
            </div>

            <div className="grid gap-6">
                <div className="bg-white rounded-md border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 text-center">ID</TableHead>
                                <TableHead>Partner Name</TableHead>
                                <TableHead>Contact Info</TableHead>
                                <TableHead>System Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partners.map((partner: any) => (
                                <TableRow key={partner.id}>
                                    <TableCell className="text-center text-slate-400 font-mono text-xs">
                                        {partner.id}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Truck size={18} className="text-blue-600" />
                                            </div>
                                            <span className="font-bold text-slate-700">{partner.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Phone size={14} /> {partner.contact_phone || 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Calendar size={14} /> {new Date(partner.created_at).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {partners.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-slate-400">
                                        No partners added yet. Click "Add Partner" to begin.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}