import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CreditCard, User } from 'lucide-react';
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
    price: string;
}

const AddPayment: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);

    const [formData, setFormData] = useState({
        member: '',
        applied_plan: '',
        amount: '',
        payment_method: 'cash',
        payment_status: 'completed',
        transaction_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    useEffect(() => {
        fetchMembers();
        fetchPlans();
    }, []);

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

        // Auto-fill amount if plan is selected
        if (name === 'applied_plan' && value) {
            const selectedPlan = plans.find(p => p.id.toString() === value);
            if (selectedPlan) {
                setFormData(prev => ({ ...prev, amount: selectedPlan.price }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                member: parseInt(formData.member),
                applied_plan: formData.applied_plan ? parseInt(formData.applied_plan) : null,
                amount: parseFloat(formData.amount),
                payment_method: formData.payment_method,
                payment_status: formData.payment_status,
                transaction_id: formData.transaction_id || null,
                payment_date: formData.payment_date,
                notes: formData.notes
            };

            await api.post('/gyms/payments/create/', payload);
            navigate('/admin/payments');
        } catch (error: any) {
            console.error('Failed to record payment:', error);
            alert(error.response?.data?.error || 'Failed to record payment. Please check the inputs.');
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
                    <p className="text-gray-500 text-sm">Manually record a transaction</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-gray-900">Payment Details</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Member *</label>
                            <select
                                name="member"
                                value={formData.member}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                            >
                                <option value="">-- Select Member --</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>{m.user.full_name} ({m.user.email})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Plan (Optional)</label>
                            <select
                                name="applied_plan"
                                value={formData.applied_plan}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                            >
                                <option value="">-- No Plan --</option>
                                {plans.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (₹{parseFloat(p.price).toLocaleString()})</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Selecting a plan will auto-fill the amount</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                <input
                                    type="date"
                                    name="payment_date"
                                    required
                                    value={formData.payment_date}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                                <input
                                    type="number"
                                    name="amount"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                                <select
                                    name="payment_method"
                                    value={formData.payment_method}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="credit_card">Credit Card</option>
                                    <option value="debit_card">Debit Card</option>
                                    <option value="net_banking">Net Banking</option>
                                    <option value="upi">UPI</option>
                                    <option value="check">Check</option>
                                    <option value="wallet">Digital Wallet</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                                <select
                                    name="payment_status"
                                    value={formData.payment_status}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                                >
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID / Reference (Optional)</label>
                            <input
                                type="text"
                                name="transaction_id"
                                value={formData.transaction_id}
                                onChange={handleChange}
                                placeholder="Optional"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        {loading ? 'Recording...' : 'Record Payment'}
                    </Button>
                </div>
            </form>
        </div >
    );
};

export default AddPayment;