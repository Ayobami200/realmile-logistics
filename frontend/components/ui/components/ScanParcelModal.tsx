"use client";

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { PlusCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function ScanParcelModal({ onScanSuccess }: { onScanSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [partners, setPartners] = useState<{ id: number, name: string }[]>([]);

    // Form State
    const [waybill, setWaybill] = useState("");
    const [partnerId, setPartnerId] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [recipientPhone, setRecipientPhone] = useState("");
    const [address, setAddress] = useState("");

    useEffect(() => {
        if (open) {
            api.get('/partners/').then(res => setPartners(res.data));
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/parcels/scan-in', {
                waybill_number: waybill,
                partner_id: parseInt(partnerId),
                recipient_name: recipientName,
                recipient_phone: recipientPhone,
                delivery_address: address
            });
            setOpen(false);
            onScanSuccess(); // Refresh the list
            // Reset Form
            setWaybill(""); setRecipientName(""); setRecipientPhone(""); setAddress("");
        } catch (error) {
            alert("Error scanning parcel. Check if waybill already exists.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <PlusCircle className="mr-2 h-4 w-4" /> Scan New Parcel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Scan Inbound Parcel</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Logistics Partner</Label>
                        <Select onValueChange={setPartnerId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Partner (Speedaf, GIG...)" />
                            </SelectTrigger>
                            <SelectContent>
                                {partners.map(p => (
                                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="waybill">Waybill Number</Label>
                        <Input id="waybill" value={waybill} onChange={(e) => setWaybill(e.target.value)} placeholder="Enter or scan barcode" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Recipient Name</Label>
                            <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Recipient Phone</Label>
                            <Input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Delivery Address</Label>
                        <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm Scan In"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}