import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, Button } from '../components/UI.tsx';
import api from '../services/api';

const EditPlan: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    duration_days: '30',
    price: '',
    perks: '',
    is_active: true
  });

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await api.get(`/gyms/plans/${id}/`);
        const data = response.data;
        setFormData({
          name: data.name,
          duration_days: data.duration_days.toString(),
          price: data.price,
          perks: data.perks,
          is_active: data.is_active
        });
      } catch (error) {
        console.error('Failed to fetch plan:', error);
        alert('Failed to load plan details.');
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchPlan();
  }, [id]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, is_active: e.target.checked }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert perks string to array, splitting by newlines or commas
      const perksArray = formData.perks
        .split(/[\n,]+/)
        .map(perk => perk.trim())
        .filter(perk => perk.length > 0);

      const payload = {
        ...formData,
        perks: perksArray
      };

      await api.put(`/gyms/plans/${id}/`, payload);
      navigate('/admin/plans');
    } catch (error) {
      console.error('Failed to update plan:', error);
      alert('Failed to update plan.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center">Loading plan details...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/plans')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Plan</h1>
          <p className="text-gray-500 text-sm">Update membership package details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days) *</label>
              <input
                type="number"
                name="duration_days"
                required
                value={formData.duration_days}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perks & Benefits</label>
            <textarea
              name="perks"
              rows={4}
              value={formData.perks}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active Plan</label>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/plans')}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Update Plan'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditPlan;