import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Edit2, Trash2, FileText, Download, Eye } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI.tsx';
import api from '../services/api';

interface Payment {
  id: string;
  member: number;
  member_name: string;
  member_email: string;
  applied_plan: number | null;
  plan_name: string | null;
  amount: string;
  payment_method: string;
  payment_status: string;
  receipt_no: string;
  transaction_id: string | null;
  payment_date: string;
  notes: string;
}

const PaymentsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/gyms/payments/');
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await api.delete(`/gyms/payments/${id}/`);
        setPayments(payments.filter(p => p.id !== id));
      } catch (error) {
        console.error('Failed to delete payment:', error);
        alert('Failed to delete payment.');
      }
    }
  };

  const filteredPayments = payments.filter((p) =>
    p.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.receipt_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.transaction_id && p.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPaymentMethodDisplay = (method: string) => {
    const methodMap: Record<string, string> = {
      'cash': 'Cash',
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card',
      'net_banking': 'Net Banking',
      'upi': 'UPI',
      'check': 'Check',
      'wallet': 'Digital Wallet'
    };
    return methodMap[method] || method;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Invoices</h1>
          <p className="text-gray-500 text-sm">Track revenue and payment history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={() => navigate('/admin/payments/add')}>
            <Plus className="w-4 h-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by member, payment ID or transaction ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Receipt No</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Member</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading payments...</td></tr>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">{payment.receipt_no}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{payment.member_name}</td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]">{payment.plan_name || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">₹{parseFloat(payment.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{getPaymentMethodDisplay(payment.payment_method)}</td>
                    <td className="px-6 py-4">
                      <Badge status={payment.payment_status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                          title="View Receipt"
                          onClick={() => navigate(`/admin/payments/view/${payment.id}`)}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Payment"
                          onClick={() => navigate(`/admin/payments/edit/${payment.id}`)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Record"
                          onClick={() => handleDelete(payment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">No payments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
          <span>Showing {filteredPayments.length} payments</span>
        </div>
      </Card>
    </div>
  );
};

export default PaymentsList;