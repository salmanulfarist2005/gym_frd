import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Search, Filter, Eye } from 'lucide-react';
import { Card, Button } from '../components/UI.tsx';
import api from '../services/api';

interface Plan {
  id: number;
  name: string;
  duration_days: number;
  price: number | string;
  perks: string;
  perks_list?: string[];
  is_active: boolean;
  gym: number;
}

const PlansList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/gyms/plans/');
      setPlans(response.data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await api.delete(`/gyms/plans/${id}/`);
        setPlans(plans.filter(p => p.id !== id));
      } catch (error) {
        console.error('Failed to delete plan:', error);
        alert('Failed to delete plan.');
      }
    }
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(plan.id).includes(searchTerm);

    const matchesStatus =
      activeFilter === 'All' ||
      (activeFilter === 'Active' && plan.is_active) ||
      (activeFilter === 'Inactive' && !plan.is_active);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membership Plans</h1>
          <p className="text-gray-500 text-sm">Configure gym membership packages</p>
        </div>
        <Button onClick={() => navigate('/admin/plans/add')}>
          <Plus className="w-4 h-4" />
          Create New Plan
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by plan name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as any)}
                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white"
              >
                <option value="All">All Status</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Plans Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Plan Name</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Perks</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading plans...</td></tr>
              ) : filteredPlans.length > 0 ? (
                filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{plan.name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">#{plan.id}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {plan.duration_days} Days
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ₹{Number(plan.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {plan.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs">
                      {plan.perks_list && plan.perks_list.length > 0 ? (
                        <span className="text-sm text-gray-600">
                          {plan.perks_list.map(p => p.replace(/['"\[\]]/g, '')).join(', ')}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-full transition-colors"
                          title="View Plan"
                          onClick={() => navigate(`/admin/plans/view/${plan.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-full transition-colors"
                          title="Edit Plan"
                          onClick={() => navigate(`/admin/plans/edit/${plan.id}`)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-full transition-colors"
                          title="Delete Plan"
                          onClick={() => handleDelete(plan.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No membership plans found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
          <span>Showing {filteredPlans.length} plans</span>
        </div>
      </Card>
    </div>
  );
};

export default PlansList;