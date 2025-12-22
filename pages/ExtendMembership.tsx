import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, Save } from 'lucide-react';
import { Card, Button } from '../components/UI.tsx';
import api from '../services/api';

interface Membership {
    member_name: string;
    end_date: string;
}

const ExtendMembership: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [membership, setMembership] = useState<Membership | null>(null);
    const [formData, setFormData] = useState({
        additional_days: '30',
        notes: ''
    });

    useEffect(() => {
        const fetchMembership = async () => {
            try {
                const response = await api.get(`/gyms/memberships/${id}/`);
                setMembership(response.data);
            } catch (error) {
                console.error('Failed to fetch membership:', error);
            }
        };
        if (id) fetchMembership();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                additional_days: parseInt(formData.additional_days),
                notes: formData.notes
            };

            await api.post(`/gyms/memberships/${id}/extend/`, payload);
            navigate('/admin/memberships');
        } catch (error) {
            console.error('Failed to extend membership:', error);
            alert('Failed to extend membership.');
        } finally {
            setLoading(false);
        }
    };

    if (!membership) return <div className="p-8 text-center">Loading...</div>;

    const calculateNewEndDate = () => {
        if (membership && formData.additional_days) {
            const currentEnd = new Date(membership.end_date);
            const newEnd = new Date(currentEnd);
            newEnd.setDate(currentEnd.getDate() + parseInt(formData.additional_days));
            return newEnd.toLocaleDateString();
        }
        return '';
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/memberships')}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Extend Membership</h1>
                    <p className="text-gray-500 text-sm">Add more days to {membership.member_name}'s subscription</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6 space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-blue-600 font-medium">Current End Date:</span>
                            <span className="font-bold text-gray-900">{new Date(membership.end_date).toLocaleDateString()}</span>
                        </div>
                        {formData.additional_days && (
                            <div className="flex justify-between text-sm">
                                <span className="text-blue-600 font-medium">New End Date:</span>
                                <span className="font-bold text-primary">{calculateNewEndDate()}</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                            <CalendarPlus className="w-4 h-4 text-primary" />
                            Additional Days *
                        </label>
                        <input
                            type="number"
                            name="additional_days"
                            value={formData.additional_days}
                            onChange={handleChange}
                            required
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Notes (Optional)</label>
                        <textarea
                            name="notes"
                            rows={3}
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Reason for extension..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="secondary" onClick={() => navigate('/admin/memberships')}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        <Save className="w-4 h-4" />
                        {loading ? 'Extending...' : 'Extend Membership'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ExtendMembership;