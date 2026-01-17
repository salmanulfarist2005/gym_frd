import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '../components/UI.tsx';
import api from '../services/api';
// Keeping chart data static for now as backend might not support full historical breakdown yet
import { REVENUE_DATA, MEMBER_STATUS_DATA } from '../constants.ts';
import { Users, AlertCircle, CreditCard, UserPlus, Search, ArrowRight, Edit2, Trash2, RefreshCw } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

interface Member {
    id: number;
    user: {
        first_name: string;
        last_name: string;
        email: string;
    };
    created_at: string;
    user_type: string;
}

interface ExpiringMembership {
    id: string;
    member_name: string;
    user_email: string;
    plan_name: string;
    end_date: string;
    days_remaining: number;
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const COLORS = ['#28A745', '#DC3545', '#17A2B8'];

    const [loading, setLoading] = useState(true);
    const [expiringMembers, setExpiringMembers] = useState<ExpiringMembership[]>([]);
    const [recentMembers, setRecentMembers] = useState<Member[]>([]);
    const [stats, setStats] = useState({
        activeUsers: 0,
        newSignups: 0,
        revenue: 0,
        expiringCount: 0
    });

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Parallel fetches for efficiency
            const [expiringRes, membersRes, paymentsRes] = await Promise.all([
                api.get('/gyms/memberships/expiring/soon/').catch(err => ({ data: [] })),
                api.get('/accounts/members/').catch(err => ({ data: [] })),
                // Assuming we can get some payment totals, or we calculate locally. 
                // If analytics endpoint exists, use it. Otherwise 0.
                api.get('/gyms/payments/analytics/').catch(err => ({ data: { total_revenue: 0 } }))
            ]);

            console.log('Expiring:', expiringRes.data);
            console.log('Members:', membersRes.data);

            // Process Expiring
            let expiringData = [];
            if (Array.isArray(expiringRes.data)) {
                expiringData = expiringRes.data;
            } else if (expiringRes.data.memberships) {
                expiringData = expiringRes.data.memberships;
            } else if (expiringRes.data.results) {
                expiringData = expiringRes.data.results;
            }
            setExpiringMembers(expiringData);

            // Process Members
            const allMembers = Array.isArray(membersRes.data) ? membersRes.data : [];
            // Sort by created_at desc if possible, otherwise take last or first
            // Assuming API returns unspecified order, let's sort locally if date available
            const sortedMembers = [...allMembers].sort((a, b) =>
                new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            );
            setRecentMembers(sortedMembers.slice(0, 5)); // Top 5 recent

            // Calculate Stats
            const revenue = paymentsRes.data?.total_revenue || 0;
            // Simple heuristic: Members created in last 30 days = New Signups
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const newSignupsCount = allMembers.filter((m: any) => new Date(m.created_at) > thirtyDaysAgo).length;

            setStats({
                activeUsers: allMembers.length, // Simplified: Total members
                newSignups: newSignupsCount,
                revenue: revenue,
                expiringCount: expiringData.length
            });

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-8">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 text-base mt-0.5">Overview of your gym's performance</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button variant="secondary" onClick={fetchDashboardData} disabled={loading} className="!p-2.5">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={() => navigate('/admin/members/add')}>
                        <UserPlus className="w-5 h-5" />
                        Add Member
                    </Button>
                </div>
            </div>

            {/* Expiring Members Alert Section */}
            <div className={`bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 text-orange-900 shadow-sm transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 rounded-xl">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl">Expiring Soon</h3>
                            <p className="text-base text-orange-700">Memberships expiring within 7 days</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/admin/memberships?filter=expiring')}
                        className="flex items-center gap-2 text-sm font-bold bg-white border-2 border-orange-200 px-4 py-2 rounded-xl hover:bg-orange-50 transition-all shadow-sm active:scale-95"
                    >
                        View All
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {expiringMembers.length === 0 ? (
                    <p className="text-center text-orange-700 py-4 font-medium italic">No memberships expiring soon. Everyone is covered! 🎉</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {expiringMembers.slice(0, 3).map((item) => (
                            <div key={item.id} className="bg-white/80 border border-orange-100 p-4 rounded-xl flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="font-bold text-base text-gray-900">{item.member_name}</p>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{item.plan_name || 'Membership'}</p>
                                </div>
                                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-md">
                                    {item.days_remaining} days left
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black bg-green-50 text-green-600 px-2 py-0.5 rounded-md">Total</span>
                    </div>
                    <p className="text-base text-gray-500 font-medium">Total Members</p>
                    <h3 className="text-3xl font-black mt-1">{loading ? '...' : stats.activeUsers}</h3>
                </Card>
                <Card className="p-6">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black bg-green-50 text-green-600 px-2 py-0.5 rounded-md">Last 30 Days</span>
                    </div>
                    <p className="text-base text-gray-500 font-medium">New Signups</p>
                    <h3 className="text-3xl font-black mt-1">{loading ? '...' : stats.newSignups}</h3>
                </Card>
                <Card className="p-6 border border-red-100">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-base text-gray-500 font-medium">Expiring Soon</p>
                    <h3 className="text-3xl font-black mt-1 text-red-600">{loading ? '...' : stats.expiringCount}</h3>
                </Card>
                <Card className="p-6">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <CreditCard className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-base text-gray-500 font-medium">Total Revenue</p>
                    <h3 className="text-3xl font-black mt-1">{loading ? '...' : formatCurrency(stats.revenue)}</h3>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6">
                    <h3 className="text-xl font-black text-gray-900 mb-6">Revenue Trend</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={REVENUE_DATA}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0052CC" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0052CC" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 12px -3px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="value" stroke="#0052CC" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="text-xl font-black text-gray-900 mb-6">Member Status</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={MEMBER_STATUS_DATA}
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={6}
                                    dataKey="value"
                                >
                                    {MEMBER_STATUS_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 700, fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Recent Members Table */}
            <Card className="overflow-hidden p-0">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-black text-gray-900">Recent Members</h3>
                    <Button variant="outline" className="text-xs px-3 py-1.5" onClick={() => navigate('/admin/members')}>View All</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-base">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading members...</td>
                                </tr>
                            ) : recentMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No members found.</td>
                                </tr>
                            ) : (
                                recentMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 text-sm">
                                                {member.user.first_name} {member.user.last_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium text-sm">{member.user.email}</td>
                                        <td className="px-6 py-4 text-gray-600 font-medium text-sm">
                                            {new Date(member.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 transition-opacity">
                                                <button
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit"
                                                    onClick={() => navigate(`/admin/members/edit/${member.id}`)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboard;