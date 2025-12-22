import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, Button } from '../components/UI.tsx';
import api from '../services/api';

interface Plan {
  id: number;
  name: string;
  duration_days: number;
  price: number | string;
  perks: string;
  is_active: boolean;
}

const ViewPlan: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await api.get(`/gyms/plans/${id}/`);
        setPlan(response.data);
      } catch (error) {
        console.error('Failed to fetch plan:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPlan();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading plan details...</div>;
  if (!plan) return <div className="p-8 text-center text-red-500">Plan not found</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/plans')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{plan.name}</h1>
            <p className="text-gray-500 text-sm">Plan ID: {plan.id}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/admin/plans/edit/${id}`)}>
          <Edit2 className="w-4 h-4" />
          Edit Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="md:col-span-2 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pricing</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-gray-900">₹{Number(plan.price).toLocaleString()}</span>
              <span className="text-gray-500">/ {plan.duration_days} days</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Perks & Benefits</span>
            <div className="mt-2 space-y-2">
              {plan.perks ? (
                plan.perks.split('\n').map((perk, index) => (
                  <div key={index} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic">No specific perks listed.</p>
              )}
            </div>
          </div>
        </Card>

        {/* Sidebar Info */}
        <Card className="space-y-4 h-fit">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Status</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {plan.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {plan.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Duration</span>
            <div className="flex items-center gap-2 text-gray-900">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{plan.duration_days} Days</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ViewPlan;