import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, FileDown, CheckCircle, CreditCard, User, Building, ExternalLink } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI.tsx';
import api from '../services/api';

interface Payment {
  id: string;
  member: number;
  member_name: string;
  member_email: string;
  applied_plan: number | null;
  plan_name: string | null;
  plan_price: string | null;
  amount: string;
  payment_method: string;
  payment_status: string;
  receipt_no: string;
  transaction_id: string | null;
  payment_date: string;
  notes: string;
  created_by_name: string;
}

const ViewPayment: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await api.get(`/gyms/payments/${id}/`);
        setPayment(response.data);
      } catch (error) {
        console.error('Failed to fetch payment:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPayment();
  }, [id]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment receipt...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return <div className="p-8 text-center">Payment record not found</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* CSS for specialized Print styling */}
      <style>
        {`
          @media print {
            /* Hide everything except the receipt card */
            body * {
              visibility: hidden;
            }
            .receipt-printable, .receipt-printable * {
              visibility: visible;
            }
            .receipt-printable {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              box-shadow: none !important;
              border: 1px solid #eee !important;
            }
            /* Force background colors to show in print */
            .print-bg-dark {
              background-color: #111827 !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-bg-primary {
              background-color: #0052CC !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            /* Hide the back button and action bar */
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="flex justify-between items-center no-print">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/payments')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Receipt</h1>
            <p className="text-gray-500 text-sm">Receipt: {payment.receipt_no}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-xs px-3"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button
            variant="outline"
            className="text-xs px-3"
            onClick={() => window.print()}
          >
            <FileDown className="w-4 h-4" /> PDF
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-2xl border-none receipt-printable">
        {/* Receipt Header */}
        <div className="bg-gray-900 text-white p-8 flex justify-between items-start print-bg-dark">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg print-bg-primary">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight">GymPro Nexus</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Official Receipt</p>
            </div>
          </div>
          <div className="text-right">
            <Badge status={payment.payment_status} />
            <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">Transaction ID</p>
            <p className="text-xs font-mono font-bold text-gray-300">{payment.transaction_id || payment.receipt_no}</p>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-8 space-y-8 bg-white">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Billed To</h4>
              <div className="space-y-1">
                <p className="font-black text-gray-900">{payment.member_name}</p>
                <p className="text-sm text-gray-500 font-medium">{payment.member_email}</p>
              </div>
            </div>
            <div className="text-right">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Payment Date</h4>
              <p className="font-bold text-gray-900">{new Date(payment.payment_date).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500 font-medium">{getPaymentMethodDisplay(payment.payment_method)} Transaction</p>
            </div>
          </div>

          <div className="border-t border-b border-gray-100 py-6">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="pb-4">Description</th>
                  <th className="pb-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-gray-900 font-bold">
                  <td className="py-2">{payment.plan_name || 'General Payment'}</td>
                  <td className="py-2 text-right">₹{parseFloat(payment.amount).toLocaleString()}</td>
                </tr>
                {payment.notes && (
                  <tr>
                    <td colSpan={2} className="pt-2 text-xs text-gray-500 italic">{payment.notes}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex justify-between w-48 border-t-2 border-gray-900 pt-3">
              <span className="font-black text-gray-400 text-xs uppercase tracking-widest">Total</span>
              <span className="font-black text-gray-900 text-xl">₹{parseFloat(payment.amount).toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-gray-400 italic">Inclusive of all applicable taxes</p>
          </div>

          <div className="pt-10 flex flex-col items-center justify-center text-center no-print-section">
            <div className="p-3 bg-green-50 text-success rounded-full mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="font-black text-gray-900">Payment Successful</h4>
            <p className="text-sm text-gray-500 mt-1">Thank you for being part of the GymPro community.</p>
            {payment.created_by_name && (
              <p className="text-xs text-gray-400 mt-2">Processed by: {payment.created_by_name}</p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Nexus Verification • Protected by 256-bit Encryption</p>
        </div>
      </Card>

      <div className="flex justify-end gap-3 pt-4 no-print">
        <Button variant="outline" onClick={() => navigate(`/admin/payments/edit/${id}`)}>Edit Record</Button>
      </div>
    </div>
  );
};

export default ViewPayment;