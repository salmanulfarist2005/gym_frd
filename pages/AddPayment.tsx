import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CreditCard, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, Button } from '../components/UI.tsx';
import api from '../services/api';

interface Member {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
}

interface Membership {
    id: string;
    member: number;
    member_name: string;
    member_email: string;
    start_date: string;
    end_date: string;
    status: string;
}

const AddPayment: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [loadingMemberships, setLoadingMemberships] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        member: '',
        applied_membership: '',
        amount: '',
        payment_method: 'cash',
        payment_status: 'completed',
        transaction_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    useEffect(() => {
        fetchMembers(); // Still fetching members in case we need context, but primary is memberships
        fetchMemberships();
    }, []);

    // Removed the member-dependent useEffect since we load all now

    const refreshData = () => {
        setErrorMessage('');
        fetchMembers();
        if (formData.member) {
            fetchMemberships(formData.member);
        }
    };

    const debugData = () => {
        console.log('=== DEBUG INFO ===');
        console.log('Members loaded:', members.length);
        console.log('Memberships loaded:', memberships.length);
        console.log('Form data:', formData);
        console.log('Selected member ID:', formData.member);
        console.log('Selected membership ID:', formData.applied_membership);

        console.log('\n--- All Members ---');
        members.forEach(m => {
            console.log(`ID: ${m.id}, Name: ${m.user.first_name} ${m.user.last_name}, Email: ${m.user.email}`);
        });

        console.log('\n--- All Memberships ---');
        memberships.forEach(m => {
            console.log(`ID: ${m.id}, Member ID: ${m.member}, Name: ${m.member_name}, Status: ${m.status}, Period: ${m.start_date} to ${m.end_date}`);
        });

        if (formData.member) {
            const memberExists = members.find(m => m.id.toString() === formData.member);
            console.log('\nSelected member exists:', !!memberExists);
            if (memberExists) {
                console.log('Selected member:', memberExists);
            }

            const memberMemberships = memberships.filter(m => m.member.toString() === formData.member);
            console.log(`\nMemberships for member ${formData.member}:`, memberMemberships.length);
            memberMemberships.forEach(m => {
                console.log(`  - ${m.id}: ${m.member_name} (${m.status})`);
            });
        }

        if (formData.applied_membership) {
            const membershipExists = memberships.find(m => m.id === formData.applied_membership);
            console.log('\nSelected membership exists:', !!membershipExists);
            if (membershipExists) {
                console.log('Selected membership:', membershipExists);
            }
        }
    };

    const fetchMembers = async () => {
        setLoadingMembers(true);
        try {
            const response = await api.get('/accounts/members/');
            console.log('Members response:', response.data);

            const validMembers = Array.isArray(response.data)
                ? response.data.filter((m: any) => m && m.id && m.user && m.user.id)
                : [];

            setMembers(validMembers);
            setErrorMessage('');

            if (validMembers.length === 0) {
                setErrorMessage('⚠️ No members found. Please ensure members are registered in the system.');
                console.warn('No valid members found');
            }
        } catch (error: any) {
            console.error('Failed to fetch members:', error);
            const errorMsg = error.response?.data?.detail || 'Failed to load members. Please refresh the page.';
            setErrorMessage(errorMsg);
        } finally {
            setLoadingMembers(false);
        }
    };

    const fetchMemberships = async (memberId?: string) => {
        setLoadingMemberships(true);
        try {
            const endpoint = memberId
                ? `/gyms/memberships/member/${memberId}/`
                : '/gyms/memberships/';

            const response = await api.get(endpoint);
            console.log(`Memberships response (${memberId ? 'filtered' : 'all'}):`, response.data);

            let validMemberships: Membership[] = [];

            if (Array.isArray(response.data)) {
                validMemberships = response.data;
            } else if (response.data && typeof response.data === 'object') {
                if (Array.isArray(response.data.results)) {
                    validMemberships = response.data.results;
                } else if (Array.isArray(response.data.data)) {
                    validMemberships = response.data.data;
                }
            }

            setMemberships(validMemberships);
        } catch (error: any) {
            console.error('Failed to fetch memberships:', error);
            setMemberships([]);
        } finally {
            setLoadingMemberships(false);
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrorMessage('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            // Validation
            if (!formData.member) {
                setErrorMessage('❌ Please select a membership to associate with a member.');
                setLoading(false);
                return;
            }

            if (!formData.amount || parseFloat(formData.amount) <= 0) {
                setErrorMessage('❌ Please enter a valid amount greater than 0.');
                setLoading(false);
                return;
            }

            if (!formData.payment_date) {
                setErrorMessage('❌ Please select a payment date.');
                setLoading(false);
                return;
            }

            // Verify membership linked member
            if (formData.applied_membership && !formData.member) {
                setErrorMessage('❌ System Error: Selected membership does not have a valid member associated.');
                setLoading(false);
                return;
            }

            // Check if membership exists and belongs to member (if selected)
            if (formData.applied_membership) {
                const selectedMembership = memberships.find(m => m.id === formData.applied_membership);
                if (!selectedMembership) {
                    setErrorMessage('❌ Selected membership does not exist. Please refresh and try again.');
                    setLoading(false);
                    return;
                }

                if (selectedMembership.member.toString() !== formData.member) {
                    setErrorMessage('❌ Selected membership does not belong to the selected member.');
                    setLoading(false);
                    return;
                }
            }

            const payload = {
                member: parseInt(formData.member),
                applied_membership: formData.applied_membership || null,
                amount: parseFloat(formData.amount),
                payment_method: formData.payment_method,
                payment_status: formData.payment_status,
                transaction_id: formData.transaction_id || null,
                payment_date: formData.payment_date,
                notes: formData.notes
            };

            console.log('Sending payload:', payload);
            console.log('Member ID being sent:', payload.member, 'Type:', typeof payload.member);
            const response = await api.post('/gyms/payments/create/', payload);
            console.log('Payment created:', response.data);

            alert('✅ Payment recorded successfully!');
            navigate('/admin/payments');
        } catch (error: any) {
            console.error('Failed to create payment:', error);
            console.error('Error response:', error.response?.data);

            if (error.response?.data) {
                const errorData = error.response.data;
                let errorMessage = 'Failed to record payment:\n\n';

                if (errorData.member) {
                    errorMessage += `❌ Member: ${Array.isArray(errorData.member) ? errorData.member.join(', ') : errorData.member}\n`;
                }
                if (errorData.applied_membership) {
                    errorMessage += `❌ Membership: ${Array.isArray(errorData.applied_membership) ? errorData.applied_membership.join(', ') : errorData.applied_membership}\n`;
                }
                if (errorData.amount) {
                    errorMessage += `❌ Amount: ${Array.isArray(errorData.amount) ? errorData.amount.join(', ') : errorData.amount}\n`;
                }
                if (errorData.payment_method) {
                    errorMessage += `❌ Payment Method: ${Array.isArray(errorData.payment_method) ? errorData.payment_method.join(', ') : errorData.payment_method}\n`;
                }
                if (errorData.non_field_errors) {
                    errorMessage += `❌ General: ${Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors.join(', ') : errorData.non_field_errors}\n`;
                }
                if (errorData.detail) {
                    errorMessage = `❌ ${errorData.detail}`;
                }

                setErrorMessage(errorMessage);
            } else {
                setErrorMessage(error.response?.data?.error || '❌ Failed to record payment. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-12 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
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
                <div className="flex items-center gap-2">
                    <button
                        onClick={refreshData}
                        disabled={loadingMembers || loadingMemberships}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refresh data"
                    >
                        <RefreshCw className={`w-4 h-4 ${(loadingMembers || loadingMemberships) ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={debugData}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                        title="Debug data in console"
                    >
                        Debug
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700 whitespace-pre-wrap">{errorMessage}</div>
                </div>
            )}

            {/* Loading State */}
            {(loadingMembers || loadingMemberships) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">⏳ Loading data...</p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">Payment Details</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Membership Selection (Primary) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Membership * {loadingMemberships && <span className="text-xs text-gray-500">(Loading...)</span>}
                            </label>

                            <select
                                name="applied_membership"
                                value={formData.applied_membership}
                                onChange={(e) => {
                                    const membershipId = e.target.value;
                                    const membership = memberships.find(m => m.id === membershipId);

                                    if (membership) {
                                        setFormData(prev => ({
                                            ...prev,
                                            applied_membership: membershipId,
                                            member: membership.member.toString()
                                        }));
                                    } else {
                                        setFormData(prev => ({
                                            ...prev,
                                            applied_membership: '',
                                            member: ''
                                        }));
                                    }
                                }}
                                disabled={loadingMemberships}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100"
                            >
                                <option value="">
                                    {loadingMemberships
                                        ? 'Loading memberships...'
                                        : memberships.length === 0
                                            ? '-- No memberships found --'
                                            : '-- Select Membership --'}
                                </option>
                                {memberships.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.member_name} - {m.start_date} to {m.end_date} ({m.status})
                                    </option>
                                ))}
                            </select>
                            {memberships.length === 0 && !loadingMemberships && (
                                <p className="text-xs text-orange-600 mt-1">No memberships found. Please create a membership first.</p>
                            )}
                        </div>

                        {/* Selected Member Display */}
                        {formData.member && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <span className="text-xs text-gray-500 uppercase font-semibold">Associated Member</span>
                                <div className="text-gray-900 font-medium">
                                    {memberships.find(m => m.id === formData.applied_membership)?.member_name || 'Unknown'}
                                </div>
                            </div>
                        )}

                        {/* Date & Amount */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                <input
                                    type="date"
                                    name="payment_date"
                                    required
                                    value={formData.payment_date}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Payment Method & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                                <select
                                    name="payment_method"
                                    value={formData.payment_method}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                        </div>

                        {/* Transaction ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID / Reference (Optional)</label>
                            <input
                                type="text"
                                name="transaction_id"
                                value={formData.transaction_id}
                                onChange={handleChange}
                                placeholder="e.g., TXN123456789"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                            <textarea
                                name="notes"
                                rows={3}
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Any additional notes..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </Card>

                {/* Actions */}
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
                        disabled={loading || loadingMemberships}
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Recording...' : 'Record Payment'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddPayment;