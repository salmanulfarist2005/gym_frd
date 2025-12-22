import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, User, AlertCircle } from 'lucide-react';
import { Card, Button } from '../components/UI.tsx';
import api from '../services/api';

interface Member {
  id: number;
  full_name: string;
  email: string;
}

interface MembershipData {
  id: string;
  member: number;
  member_name: string;
  member_email: string;
  start_date: string;
  end_date: string;
  status: string;
  notes: string;
  days_remaining: number;
}

const EditMembership: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState('');
  const [membershipData, setMembershipData] = useState<MembershipData | null>(null);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    fetchMembershipData();
  }, [id]);

  const fetchMembershipData = async () => {
    try {
      setFetchingData(true);
      const response = await api.get(`/gyms/memberships/${id}/`);
      const data = response.data;

      setMembershipData(data);
      setFormData({
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status,
        notes: data.notes || ''
      });
      setError('');
    } catch (error: any) {
      console.error('Failed to fetch membership:', error);
      setError(error.response?.data?.error || 'Failed to load membership data');
    } finally {
      setFetchingData(false);
    }
  };

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
        start_date: formData.startDate,
        end_date: formData.endDate,
        status: formData.status,
        notes: formData.notes
      };

      await api.patch(`/gyms/memberships/${id}/`, payload);
      navigate('/admin/memberships');
    } catch (error: any) {
      console.error('Failed to update membership:', error);
      setError(error.response?.data?.error || 'Failed to update membership. Please check the inputs.');
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

  if (!membershipData) {
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
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/memberships')}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Membership Period</h1>
          <p className="text-gray-500 text-sm">
            Update membership for {membershipData.member_name}
          </p>
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
        <Card className="p-6 space-y-6">
          {/* Member Info (Read-only) */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 text-primary" />
              Member
            </label>
            <div className="text-gray-900 font-medium">{membershipData.member_name}</div>
            <div className="text-sm text-gray-600">{membershipData.member_email}</div>
            <p className="text-xs text-gray-500 mt-2">Member cannot be changed after creation</p>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="frozen">Frozen</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {membershipData.days_remaining > 0
                ? `${membershipData.days_remaining} days remaining`
                : 'Membership has expired'}
            </p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 text-primary" />
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 text-primary" />
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Any additional notes or remarks..."
            />
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/memberships')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4" />
            {loading ? 'Updating...' : 'Update Membership'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditMembership;