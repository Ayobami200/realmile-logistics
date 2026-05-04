"use client";

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Search,
    Package,
    MapPin,
    Phone,
    Clock,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
import api from '@/lib/api';

// IMPORTANT: Ensure this path matches your folder structure
import ScanParcelModal from '@/components/ui/components/ScanParcelModal';

export default function ParcelsPage() {
    const [parcels, setParcels] = useState([]);
    const [riders, setRiders] = useState([]); // To hold the list of riders
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedParcel, setSelectedParcel] = useState<any>(null);

    // 1. Function to fetch parcels
    const fetchParcels = () => {
        api.get('/parcels/').then(res => setParcels(res.data));
    };

    // 2. Function to fetch riders (only riders and foot couriers)
    const fetchRiders = () => {
        api.get('/users/operations/riders').then(res => setRiders(res.data));
    };

    useEffect(() => {
        fetchParcels();
        fetchRiders();
    }, []);

    // 3. Logic to Assign a Rider (Dispatch)
    const handleDispatch = async (riderId: string) => {
        try {
            await api.patch('/parcels/dispatch', {
                waybill_number: selectedParcel.waybill_number,
                rider_id: parseInt(riderId)
            });
            fetchParcels(); // Refresh table
            setSelectedParcel(null); // Close drawer
            alert("Parcel dispatched to rider!");
        } catch (error) {
            alert("Failed to dispatch parcel.");
        }
    };

    // 4. Logic to Update Status (Delivered/Failed)
    const handleStatusUpdate = async (newStatus: string) => {
        try {
            const notes = newStatus === 'delivered' ? "Successfully delivered to recipient" : "Delivery failed - returned to warehouse";
            await api.patch('/update-status', {
                waybill_number: selectedParcel.waybill_number,
                status: newStatus,
                notes: notes
            });
            fetchParcels();
            setSelectedParcel(null);
            alert(`Parcel marked as ${newStatus.toUpperCase()}`);
        } catch (error) {
            alert("Failed to update status.");
        }
    };

    const filteredParcels = parcels.filter((p: any) =>
        p.waybill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.recipient_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-4">
            {/* HEADER AREA */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Parcel Management</h1>
                <div className="flex items-center gap-4">
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search waybill..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <ScanParcelModal onScanSuccess={fetchParcels} />
                </div>
            </div>

            {/* TABLE AREA */}
            <div className="bg-white rounded-md border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Waybill</TableHead>
                            <TableHead>Recipient</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Delivery SLA</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredParcels.map((parcel: any) => (
                            <TableRow
                                key={parcel.id}
                                className="cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => setSelectedParcel(parcel)}
                            >
                                <TableCell className="font-medium text-blue-600 underline">
                                    {parcel.waybill_number}
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm font-medium">{parcel.recipient_name}</div>
                                    <div className="text-xs text-slate-500">{parcel.recipient_phone}</div>
                                </TableCell>
                                <TableCell><StatusBadge status={parcel.status} /></TableCell>
                                <TableCell className="text-sm text-slate-600">
                                    {new Date(parcel.delivery_deadline).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* DETAILS DRAWER */}
            <Sheet open={!!selectedParcel} onOpenChange={() => setSelectedParcel(null)}>
                <SheetContent className="sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="text-xl flex items-center gap-2">
                            <Package className="text-blue-600" /> {selectedParcel?.waybill_number}
                        </SheetTitle>
                        <SheetDescription>Track and manage this parcel</SheetDescription>
                    </SheetHeader>

                    {selectedParcel && (
                        <div className="mt-8 space-y-8">
                            {/* Recipient Info */}
                            <div className="bg-slate-50 p-4 rounded-lg space-y-3 border text-sm">
                                <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Recipient Details</h3>
                                <div className="flex items-center gap-3"><Package size={16} /> <span>{selectedParcel.recipient_name}</span></div>
                                <div className="flex items-center gap-3"><Phone size={16} /> <span>{selectedParcel.recipient_phone}</span></div>
                                <div className="flex items-center gap-3"><MapPin size={16} /> <span>{selectedParcel.delivery_address}</span></div>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Tracking History</h3>
                                <div className="relative space-y-6 pl-6 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-[2px] before:bg-slate-200">
                                    {selectedParcel.history.map((event: any, idx: number) => (
                                        <div key={idx} className="relative">
                                            <div className={`absolute -left-[21px] mt-1 h-3 w-3 rounded-full border-2 border-white ${idx === 0 ? 'bg-blue-600 scale-125' : 'bg-slate-400'}`} />
                                            <div className="text-sm font-medium uppercase">{event.status.replace('_', ' ')}</div>
                                            <div className="text-xs text-slate-500">{event.notes}</div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                                                <Clock size={10} /> {new Date(event.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ACTIONS: DISPATCH (Only if in Warehouse) */}
                            {selectedParcel.status === 'in_warehouse' && (
                                <div className="pt-6 border-t space-y-3">
                                    <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Assign to Rider</h3>
                                    <Select onValueChange={handleDispatch}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a rider..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {riders.map((r: any) => (
                                                <SelectItem key={r.id} value={r.id.toString()}>{r.full_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* ACTIONS: UPDATE (Only if Dispatched) */}
                            {selectedParcel.status === 'dispatched' && (
                                <div className="pt-6 border-t space-y-3">
                                    <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Update Result</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => handleStatusUpdate('delivered')}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" /> Delivered
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleStatusUpdate('delivery_failed')}
                                        >
                                            <AlertTriangle className="mr-2 h-4 w-4" /> Failed
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        in_warehouse: "bg-blue-100 text-blue-700 border-blue-200",
        dispatched: "bg-orange-100 text-orange-700 border-orange-200",
        delivered: "bg-green-100 text-green-700 border-green-200",
        delivery_failed: "bg-red-100 text-red-700 border-red-200",
    };
    return (
        <Badge variant="outline" className={styles[status] || ""}>
            {status.replace('_', ' ').toUpperCase()}
        </Badge>
    );
}