import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Snowflake, Save, AlertCircle } from 'lucide-react';
import { Card, Button } from '../components/UI.tsx';
import api from '../services/api';

interface Membership {
    id: string;
    member_name: string;
    member_email: string;
    end_date: string;
    status: string;
}

const FreezeMembership: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [membership, setMembership] = useState<Membership | null>(null);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        freeze_reason: ''
    });

    useEffect(() => {
        const fetchMembership = async () => {
            try {
                setFetchingData(true);
                const response = await api.get(`/gyms/memberships/${id}/`);
                setMembership(response.data);

                // Check if membership can be frozen
                if (response.data.status !== 'active') {
                    setError(`Cannot freeze a ${response.data.status} membership. Only active memberships can be frozen.`);
                }
            } catch (error: any) {
                console.error('Failed to fetch membership:', error);
                setError(error.response?.data?.error || 'Failed to load membership data');
            } finally {
                setFetchingData(false);
            }
        };
        if (id) fetchMembership();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post(`/gyms/memberships/${id}/freeze/`, {
                freeze_reason: formData.freeze_reason
            });
            navigate('/admin/memberships');
        } catch (error: any) {
            console.error('Failed to freeze membership:', error);
            setError(error.response?.data?.error || 'Failed to freeze membership.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading membership data...</p>
                </div>
            </div>
        );
    }

    if (!membership) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="p-6 max-w-md">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Membership Not Found</h2>
                        <p className="text-gray-600 mb-4">{error || 'The requested membership could not be found.'}</p>
                        <Button onClick={() => navigate('/admin/memberships')}>
                            Back to Memberships
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/memberships')}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Freeze Membership</h1>
                    <p className="text-gray-500 text-sm">Temporarily pause {membership.member_name}'s subscription</p>
                </div>
            </div>

            {error && membership.status !== 'active' && (
                <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6 space-y-6">
                    {/* Member Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-blue-600 font-medium">Member:</span>
                            <span className="font-bold text-gray-900">{membership.member_name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-blue-600 font-medium">Email:</span>
                            <span className="text-gray-700">{membership.member_email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-blue-600 font-medium">Current End Date:</span>
                            <span className="font-bold text-gray-900">
                                {new Date(membership.end_date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* Info Message */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex gap-3">
                            <Snowflake className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-gray-700">
                                <p className="font-medium mb-1">What happens when you freeze a membership?</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>The membership will be marked as "frozen"</li>
                                    <li>The end date will automatically extend when unfrozen</li>
                                    <li>Member won't have access during the freeze period</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Freeze Reason */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Freeze Reason (Optional)
                        </label>
                        <textarea
                            name="freeze_reason"
                            rows={3}
                            value={formData.freeze_reason}
                            onChange={handleChange}
                            placeholder="e.g., Medical leave, Travel, Personal reasons..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Optional: Provide a reason for freezing this membership
                        </p>
                    </div>
                </Card>

                {error && membership.status === 'active' && (
                    <Card className="p-4 bg-red-50 border-red-200">
                        <div className="flex items-center gap-2 text-red-800">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    </Card>
                )}

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate('/admin/memberships')}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || membership.status !== 'active'}
                    >
                        <Snowflake className="w-4 h-4" />
                        {loading ? 'Freezing...' : 'Freeze Membership'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default FreezeMembership;
