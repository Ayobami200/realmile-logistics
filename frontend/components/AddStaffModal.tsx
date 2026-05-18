"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function AddStaffModal({ onUserCreated }: { onUserCreated: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        role: "staff",
        phone_number: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Calling the Admin-only create user route we built in FastAPI
            await api.post('/users/', formData);
            setOpen(false);
            onUserCreated();
            setFormData({ full_name: "", email: "", password: "", role: "staff", phone_number: "" });
        } catch (error: any) {
            alert(error.response?.data?.detail || "Failed to create staff member");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="mr-2 h-4 w-4" /> Add Team Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Staff Account</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="e.g. Musa Ibrahim" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="staff@realmile.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select onValueChange={(val) => setFormData({ ...formData, role: val })} defaultValue="staff">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ops_staff">Operations Staff</SelectItem>
                                    <SelectItem value="rider">Bike Rider</SelectItem>
                                    <SelectItem value="foot_courier">Foot Courier</SelectItem>
                                    <SelectItem value="accountant">Accountant</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} />
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}