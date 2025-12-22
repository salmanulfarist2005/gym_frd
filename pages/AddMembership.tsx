import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, User } from 'lucide-react';
import { Card, Button } from '../components/UI.tsx';
import api from '../services/api';

interface Member {
    id: number;
    user: {
        full_name: string;
        email: string;
    };
}

interface Plan {
    id: number;
    name: string;
    duration_days: number;
}

const AddMembership: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState('');

    const [formData, setFormData] = useState({
        member: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: ''
    });

    useEffect(() => {
        fetchMembers();
        fetchPlans();
    }, []);

    // Update End Date when Plan or Start Date changes
    useEffect(() => {
        const selectedPlan = plans.find(p => p.id.toString() === selectedPlanId);
        if (selectedPlan && formData.startDate) {
            const start = new Date(formData.startDate);
            const end = new Date(start);
            end.setDate(start.getDate() + selectedPlan.duration_days);

            setFormData(prev => ({ ...prev, endDate: end.toISOString().split('T')[0] }));
        }
    }, [selectedPlanId, formData.startDate, plans]);

    const fetchMembers = async () => {
        try {
            const response = await api.get('/accounts/members/');
            setMembers(response.data);
        } catch (error) {
            console.error('Failed to fetch members:', error);
        }
    };

    const fetchPlans = async () => {
        try {
            const response = await api.get('/gyms/plans/');
            setPlans(response.data);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                member: parseInt(formData.member),
                start_date: formData.startDate,
                end_date: formData.endDate,
                notes: formData.notes
            };

            await api.post('/gyms/memberships/create/', payload);
            navigate('/admin/memberships');
        } catch (error) {
            console.error('Failed to create membership:', error);
            alert('Failed to create membership. Please check the inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/memberships')}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add Membership Period</h1>
                    <p className="text-gray-500 text-sm">Create a new subscription record for a member</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6 space-y-6">
                    {/* Member Selection */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                            <User className="w-4 h-4 text-primary" />
                            Member *
                        </label>
                        <select
                            name="member"
                            value={formData.member}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                        >
                            <option value="">-- Select Member --</option>
                            {members.map(m => (
                                <option key={m.id} value={m.user.id}>
                                    {m.user.full_name} ({m.user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Plan Helper (optional, to auto-calculate end date) */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Plan (Helper - optional)
                        </label>
                        <select
                            value={selectedPlanId}
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                        >
                            <option value="">-- Select Plan to auto-fill dates --</option>
                            {plans.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.duration_days} days)
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Selecting a plan will auto-calculate the end date</p>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                <Calendar className="w-4 h-4 text-primary" />
                                Start Date *
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                <Calendar className="w-4 h-4 text-primary" />
                                End Date *
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Notes (Optional)</label>
                        <textarea
                            name="notes"
                            rows={3}
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Any additional notes..."
                        />
                    </div>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="secondary" onClick={() => navigate('/admin/memberships')}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        <Save className="w-4 h-4" />
                        {loading ? 'Creating...' : 'Create Membership'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddMembership;