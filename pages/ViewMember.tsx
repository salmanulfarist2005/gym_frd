import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar, Clock, Award } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI.tsx';
import api from '../services/api';

interface MemberProfile {
    id: number;
    user: {
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        phone: string;
    };
    gym_name: string;
    membership_status: string;
    membership_start_date: string;
    membership_end_date: string;
    created_at: string;
    updated_at: string;
}

const ViewMember: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [member, setMember] = useState<MemberProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const response = await api.get(`/accounts/member-profile/${id}/`);
                setMember(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load member details');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchMember();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading member details...</div>;
    if (error || !member) return <div className="p-8 text-center text-red-500">{error || 'Member not found'}</div>;

    const fullName = `${member.user.first_name} ${member.user.last_name}`.trim() || member.user.username;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/members')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                        <p className="text-gray-500 text-sm">Member ID: {member.id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate(`/admin/members/edit/${id}`)}>Edit Member</Button>
                    <Button disabled>Check In Manual</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Stats & Status */}
                <div className="space-y-6">
                    <Card className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-4">
                            <User className="w-12 h-12" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>
                        <p className="text-sm text-gray-500 mb-4">{member.user.email}</p>
                        <Badge status={member.membership_status} />
                    </Card>

                    <Card className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight mb-2">Current Membership</h4>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-primary">Standard Plan</span>
                                <span className="text-xs font-bold text-gray-400 uppercase">{member.membership_status}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Expires: {member.membership_end_date || 'N/A'}</span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full text-sm" onClick={() => navigate('/admin/memberships/add')}>
                            Renew / Upgrade
                        </Button>
                    </Card>
                </div>

                {/* Center/Right: Details & History */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Profile Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</span>
                                <div className="flex items-center gap-2 text-gray-900">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{member.user.email}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone</span>
                                <div className="flex items-center gap-2 text-gray-900">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{member.user.phone || 'Not provided'}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Join Date</span>
                                <div className="flex items-center gap-2 text-gray-900">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{new Date(member.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Updated</span>
                                <div className="flex items-center gap-2 text-gray-900">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{new Date(member.updated_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
                            <h3 className="text-lg font-bold text-gray-900">Recent Attendance</h3>
                            <Award className="w-5 h-5 text-warning" />
                        </div>
                        <div className="p-4 text-center text-gray-500 text-sm bg-gray-50 rounded-lg">
                            Attendance history integration coming soon.
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ViewMember;