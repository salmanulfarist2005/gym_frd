import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '../components/UI.tsx';
import api from '../services/api';
import { Building, Users, TrendingUp, Edit2, Trash2, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Gym {
    id: number;
    name: string;
    address: string;
    owner_name: string;
    is_active: boolean;
    created_at: string;
    membersCount?: number;
    revenue?: number;
}

const SuperUserDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/gyms/');
            setGyms(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const STATIC_CHART_DATA = [
        { name: 'Iron Paradise', members: 120, revenue: 50000 },
        { name: 'Gold\'s Gym', members: 200, revenue: 75000 },
        { name: 'Metro Flex', members: 150, revenue: 60000 },
        { name: 'Planet Fitness', members: 300, revenue: 45000 },
    ];
    // Use static data for charts as requested, but calculate totals from real data
    const chartData = STATIC_CHART_DATA;

    /* 
    // Dynamic data logic hidden for now as per user request to keep graphs static
    const chartData = gyms.map(gym => ({
        name: gym.name,
        members: gym.membersCount || 0,
        revenue: gym.revenue || 0
    }));
    */

    const totalGyms = gyms.length;
    // Fallback to 0 if fields are missing
    const totalMembers = gyms.reduce((acc, gym) => acc + (gym.membersCount || 0), 0);
    const totalRevenue = gyms.reduce((acc, gym) => acc + (gym.revenue || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
                <Button onClick={() => navigate('/superuser/gyms/create')}>
                    <Plus className="w-4 h-4" />
                    Create Gym
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-full text-primary">
                        <Building className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Gyms</p>
                        <h3 className="text-2xl font-bold text-gray-900">{totalGyms}</h3>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-full text-success">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Members</p>
                        <h3 className="text-2xl font-bold text-gray-900">{totalMembers}</h3>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</h3>
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue by Gym</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                <Tooltip />
                                <Bar dataKey="revenue" fill="#0052CC" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Members Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="members" fill="#28A745" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Gym List Table */}
            <Card className="overflow-hidden p-0">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">All Gyms</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Gym Name</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Owner</th>
                                <th className="px-6 py-4">Members</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : gyms.map((gym) => (
                                <tr key={gym.id} className="hover:bg-gray-50 group">
                                    <td className="px-6 py-4 font-medium text-gray-900">{gym.name}</td>
                                    <td className="px-6 py-4">{gym.address}</td>
                                    <td className="px-6 py-4">{gym.owner_name}</td>
                                    <td className="px-6 py-4">{gym.membersCount || 0}</td>
                                    <td className="px-6 py-4">
                                        <Badge status={gym.is_active ? 'Active' : 'Inactive'} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                                                title="Edit"
                                                onClick={() => navigate(`/superuser/gyms/edit/${gym.id}`)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && gyms.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-4 text-center">No gyms found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default SuperUserDashboard;