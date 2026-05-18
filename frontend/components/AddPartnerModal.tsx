"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function AddPartnerModal({ onPartnerCreated }: { onPartnerCreated: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/partners/', { name, contact_phone: phone });
            setOpen(false);
            onPartnerCreated();
            setName(""); setPhone("");
        } catch (error: any) {
            alert("Failed to add partner. They might already exist.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Partner
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Add Logistics Partner</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Partner Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Speedaf Express" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Contact Phone (Optional)</Label>
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0800-PARTNER" />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Partner"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}