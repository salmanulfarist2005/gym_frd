import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, CreditCard, AlertCircle } from 'lucide-react';
import { Card, Button } from '../components/UI.tsx';
import api from '../services/api';

interface PaymentData {
    id: string;
    member: number;
    member_name: string;
    payment_status: string;
    transaction_id: string | null;
    notes: string;
}

const EditPayment: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        payment_status: 'completed',
        transaction_id: '',
        notes: ''
    });

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                setFetchingData(true);
                const response = await api.get(`/gyms/payments/${id}/`);
                const data = response.data;

                setPaymentData(data);
                setFormData({
                    payment_status: data.payment_status,
                    transaction_id: data.transaction_id || '',
                    notes: data.notes || ''
                });
            } catch (error: any) {
                console.error('Failed to fetch payment:', error);
                setError(error.response?.data?.error || 'Failed to load payment data');
            } finally {
                setFetchingData(false);
            }
        };

        if (id) fetchPayment();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                payment_status: formData.payment_status,
                transaction_id: formData.transaction_id || null,
                notes: formData.notes
            };

            await api.patch(`/gyms/payments/${id}/`, payload);
            navigate('/admin/payments');
        } catch (error: any) {
            console.error('Failed to update payment:', error);
            setError(error.response?.data?.error || 'Failed to update payment.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading payment data...</p>
                </div>
            </div>
        );
    }

    if (!paymentData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="p-6 max-w-md">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Not Found</h2>
                        <p className="text-gray-600 mb-4">{error || 'The requested payment could not be found.'}</p>
                        <Button onClick={() => navigate('/admin/payments')}>
                            Back to Payments
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
                    onClick={() => navigate('/admin/payments')}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Payment Record</h1>
                    <p className="text-gray-500 text-sm">Update transaction details for {paymentData.member_name}</p>
                </div>
            </div>

            {error && (
                <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-gray-900">Payment Details</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Member Info (Read-only) */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Member</label>
                            <div className="text-gray-900 font-medium">{paymentData.member_name}</div>
                            <p className="text-xs text-gray-500 mt-1">Member information cannot be changed after payment creation</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                            <select
                                name="payment_status"
                                value={formData.payment_status}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                            >
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID / Reference</label>
                            <input
                                type="text"
                                name="transaction_id"
                                value={formData.transaction_id}
                                onChange={handleChange}
                                placeholder="Optional"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                            <textarea
                                name="notes"
                                rows={3}
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Any additional notes..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate('/admin/payments')}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Update Record'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditPayment;