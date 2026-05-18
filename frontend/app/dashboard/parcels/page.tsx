"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Search,
    MapPin,
    Phone,
    Clock,
    CheckCircle,
    AlertTriangle,
    Truck,
    User,
    History,
    Calendar,
    Globe,
    RefreshCw,
    XCircle
} from 'lucide-react';
import api from '@/lib/api';
import ScanParcelModal from '@/components/ScanParcelModal';
import SLAIndicator from "@/components/SLAIndicator";

// Wrapper component for Suspense (Next.js requirement for useSearchParams)
export default function ParcelsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-slate-500 font-black">LOADING OPERATIONS...</div>}>
            <ParcelsContent />
        </Suspense>
    );
}

function ParcelsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get the filter from the URL (e.g., ?filter=in_warehouse)
    const activeFilter = searchParams.get('filter');

    const [parcels, setParcels] = useState([]);
    const [riders, setRiders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedParcel, setSelectedParcel] = useState<any>(null);

    const fetchParcels = () => {
        api.get('/parcels/').then(res => setParcels(res.data));
    };

    const fetchRiders = () => {
        api.get('/users/operations/riders').then(res => setRiders(res.data));
    };

    useEffect(() => {
        fetchParcels();
        fetchRiders();
    }, []);

    const handleDispatch = async (riderId: string) => {
        try {
            await api.patch('/parcels/dispatch', {
                waybill_number: selectedParcel.waybill_number,
                rider_id: parseInt(riderId)
            });
            fetchParcels();
            setSelectedParcel(null);
        } catch (error) {
            alert("Failed to dispatch.");
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            let notes = "";
            if (newStatus === 'delivered') notes = "Confirmed delivery to recipient";
            if (newStatus === 'delivery_failed') notes = "Delivery attempt failed - awaiting return";
            if (newStatus === 'returned') notes = "Parcel successfully returned to hub warehouse";

            await api.patch('/parcels/update-status', {
                waybill_number: selectedParcel.waybill_number,
                status: newStatus,
                notes: notes
            });
            fetchParcels();
            setSelectedParcel(null);
        } catch (error) {
            alert("Status update failed.");
        }
    };

    // --- LOGIC: FILTERING ---
    const filteredParcels = parcels.filter((p: any) => {
        // 1. Search term match
        const matchesSearch =
            p.waybill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.recipient_name.toLowerCase().includes(searchTerm.toLowerCase());

        // 2. Dashboard filter match
        if (activeFilter) {
            if (activeFilter === 'breached') {
                // Show only parcels that are overdue AND not finished
                const isOverdue = new Date() > new Date(p.delivery_deadline);
                const isNotFinished = p.status !== 'delivered' && p.status !== 'returned';
                return matchesSearch && isOverdue && isNotFinished;
            }
            // Otherwise match by status (e.g., filter=dispatched)
            return matchesSearch && p.status === activeFilter;
        }

        return matchesSearch;
    });

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen font-sans">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-[1000] tracking-tighter text-slate-900 leading-none">Operations</h1>
                    <p className="text-slate-500 font-bold text-sm ml-1 mt-1 uppercase tracking-widest opacity-60">
                        {activeFilter ? `Filtering by: ${activeFilter.replace('_', ' ')}` : 'Fleet & Parcel Control'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* SEARCH & CLEAR FILTER */}
                    <div className="relative flex items-center gap-2">
                        <div className="relative w-80">
                            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="SEARCH WAYBILL / NAME..."
                                className="h-12 pl-12 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus:ring-0 focus:border-slate-900 transition-all font-black text-xs tracking-widest"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {activeFilter && (
                            <Button
                                onClick={() => router.push('/dashboard/parcels')}
                                variant="outline"
                                className="h-12 rounded-2xl border-2 border-slate-200 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-100"
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Clear Filter
                            </Button>
                        )}
                    </div>
                    <ScanParcelModal onScanSuccess={fetchParcels} />
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 border-b-2 border-slate-50">
                            <TableHead className="h-14 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] pl-8 text-left">Waybill Identifier</TableHead>
                            <TableHead className="h-14 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] text-left">Consignee</TableHead>
                            <TableHead className="h-14 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] text-left">Status</TableHead>
                            <TableHead className="h-14 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] text-right pr-8">SLA Deadline</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredParcels.map((parcel: any) => (
                            <TableRow
                                key={parcel.id}
                                onClick={() => setSelectedParcel(parcel)}
                                className="cursor-pointer hover:bg-slate-50/80 transition-all group border-slate-50"
                            >
                                <TableCell className="font-mono font-black text-slate-900 text-[15px] pl-8 py-5 text-left">
                                    {parcel.waybill_number}
                                </TableCell>
                                <TableCell className="text-left">
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-[900] text-slate-900 tracking-tight">{parcel.recipient_name}</span>
                                        <span className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{parcel.recipient_phone}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-left">
                                    <StatusBadge status={parcel.status} />
                                </TableCell>
                                <TableCell className="text-right pr-8">
                                    <SLAIndicator deadline={parcel.delivery_deadline} status={parcel.status} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* DRAWER CODE (Kept identical to previous premium version) */}
            <Sheet open={!!selectedParcel} onOpenChange={() => setSelectedParcel(null)}>
                <SheetContent className="sm:max-w-xl bg-white p-0 flex flex-col border-l-2 border-slate-100 shadow-2xl">
                    {selectedParcel && (
                        <>
                            {(() => {
                                const partner = getPartnerDetails(selectedParcel.waybill_number);
                                return (
                                    <div className={`${partner.color} ${partner.text} pl-8 pr-16 py-4 flex justify-between items-center relative`}>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white/20 p-1.5 rounded-lg">
                                                <Globe className="h-4 w-4" />
                                            </div>
                                            <span className="text-xs font-black tracking-[0.3em] uppercase">{partner.name}</span>
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="p-10 space-y-10 flex-1 overflow-y-auto">
                                <section className="space-y-4 text-left">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <h2 className="text-5xl font-[1000] tracking-tighter text-slate-900 font-mono">
                                                {selectedParcel.waybill_number}
                                            </h2>
                                            <div className="flex items-center gap-4 pt-1">
                                                <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(selectedParcel.created_at).toLocaleDateString()}
                                                </div>
                                                <SLAIndicator deadline={selectedParcel.delivery_deadline} status={selectedParcel.status} />
                                            </div>
                                        </div>
                                        <StatusBadge status={selectedParcel.status} />
                                    </div>
                                </section>

                                <section className="space-y-4 text-left">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 ml-2">Recipient Data</h3>
                                    <div className="bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-6">
                                        <div>
                                            <p className="text-2xl font-[1000] text-slate-900 tracking-tighter">{selectedParcel.recipient_name}</p>
                                            <p className="text-base font-black text-slate-500 mt-2 flex items-center gap-2 uppercase tracking-widest">
                                                <Phone className="h-4 w-4 text-slate-300" /> {selectedParcel.recipient_phone}
                                            </p>
                                        </div>
                                        <div className="h-[2px] bg-white w-full" />
                                        <div className="flex gap-4">
                                            <div className="bg-white p-2.5 rounded-2xl border-2 border-slate-100 h-fit shadow-sm">
                                                <MapPin className="h-5 w-5 text-slate-900" />
                                            </div>
                                            <p className="text-lg font-bold text-slate-700 leading-tight">
                                                {selectedParcel.delivery_address}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-8 text-left">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 ml-2">Operational History</h3>
                                    <div className="relative space-y-12 before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-[3px] before:bg-slate-100">
                                        {selectedParcel.history.map((event: any, idx: number) => (
                                            <div key={idx} className="relative pl-12">
                                                <div className={`absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full border-[6px] border-white shadow-md
                                                    ${idx === 0 ? 'bg-slate-900 ring-8 ring-slate-50 scale-110' : 'bg-slate-300'}
                                                `} />
                                                <div className="space-y-1 text-left">
                                                    <p className={`text-base font-black uppercase tracking-tighter ${idx === 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                                                        {event.status.replaceAll("_", " ")}
                                                    </p>
                                                    <p className="text-sm font-bold text-slate-500 leading-snug">{event.notes || "System update processed."}</p>
                                                    <p className="text-[11px] font-black text-slate-300 mt-2 flex items-center gap-2 uppercase tracking-widest">
                                                        <Clock className="h-3.5 w-3.5" /> {new Date(event.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="p-8 bg-white border-t-4 border-slate-50 shadow-[0_-25px_60px_rgba(0,0,0,0.05)]">
                                {selectedParcel.status === "in_warehouse" && (
                                    <div className="space-y-5">
                                        <div className="flex flex-col gap-4">
                                            <Select onValueChange={handleDispatch}>
                                                <SelectTrigger className="h-16 border-2 border-slate-100 font-black text-sm rounded-[1.25rem] focus:border-slate-900 bg-slate-50 px-8 shadow-none transition-all text-left">
                                                    <SelectValue placeholder="ASSIGN DELIVERY RIDER" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-2 border-slate-100 shadow-2xl font-black uppercase text-[10px] tracking-widest">
                                                    {riders.map((r: any) => (
                                                        <SelectItem key={r.id} value={r.id.toString()} className="h-14 border-b border-slate-50 last:border-0 pl-8 cursor-pointer">
                                                            {r.full_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}

                                {selectedParcel.status === "dispatched" && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            className="h-16 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[11px] rounded-[1.25rem] shadow-xl shadow-slate-200 active:scale-95 transition-all"
                                            onClick={() => handleStatusUpdate("delivered")}
                                        >
                                            <CheckCircle className="mr-2 h-5 w-5" />
                                            Confirm Delivery
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-16 border-2 border-red-100 text-red-600 hover:bg-red-50 font-black uppercase tracking-widest text-[11px] rounded-[1.25rem] active:scale-95 transition-all"
                                            onClick={() => handleStatusUpdate("delivery_failed")}
                                        >
                                            <AlertTriangle className="mr-2 h-5 w-5" />
                                            Flag as Failed
                                        </Button>
                                    </div>
                                )}

                                {(selectedParcel.status === "delivery_failed" || selectedParcel.status === "return_overdue") && (
                                    <Button
                                        className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-[1000] uppercase tracking-widest text-[11px] rounded-[1.25rem] shadow-xl shadow-blue-100 active:scale-95 transition-all"
                                        onClick={() => handleStatusUpdate("returned")}
                                    >
                                        <RefreshCw className="mr-2 h-5 w-5" />
                                        Confirm Return to Hub
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

const getPartnerDetails = (waybill: string) => {
    const wb = waybill?.toUpperCase() || "";
    if (wb.startsWith("SPD")) return { name: "SPEEDAF", color: "bg-red-600", text: "text-white" };
    if (wb.startsWith("GIG")) return { name: "GIG LOGISTICS", color: "bg-orange-600", text: "text-white" };
    if (wb.startsWith("SHP")) return { name: "SHARP", color: "bg-blue-700", text: "text-white" };
    if (wb.startsWith("DNG")) return { name: "DANG", color: "bg-emerald-700", text: "text-white" };
    return { name: "EXTERNAL PARTNER", color: "bg-slate-900", text: "text-white" };
};

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        in_warehouse: "bg-slate-100 text-slate-600 border-slate-200",
        dispatched: "bg-amber-100 text-amber-800 border-amber-200 shadow-amber-100/50",
        delivered: "bg-emerald-100 text-emerald-800 border-emerald-200 shadow-emerald-100/50",
        delivery_failed: "bg-red-100 text-red-800 border-red-200 shadow-red-100/50",
        returned: "bg-blue-100 text-blue-800 border-blue-200 shadow-blue-100/50",
    };

    return (
        <Badge
            variant="outline"
            className={`uppercase text-[10px] font-[1000] tracking-[0.15em] px-3 py-1.5 rounded-lg shadow-none border-2 ${styles[status] || styles.in_warehouse}`}
        >
            {status?.replace("_", " ")}
        </Badge>
    );
}