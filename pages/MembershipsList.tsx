import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Edit2, Trash2, CalendarPlus, Eye, Snowflake } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI.tsx';
import api from '../services/api';

interface Membership {
  id: string;
  member: number;
  member_name: string;
  member_email: string;
  start_date: string;
  end_date: string;
  status: string;
  source_payment: string | null;
  payment_receipt: string | null;
  days_remaining: number;
  is_expiring_soon: boolean;
}

const MembershipsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const response = await api.get('/gyms/memberships/');
      setMemberships(response.data);
    } catch (error) {
      console.error('Failed to fetch memberships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this membership?')) {
      try {
        await api.delete(`/gyms/memberships/${id}/`);
        setMemberships(memberships.filter(m => m.id !== id));
      } catch (error) {
        console.error('Failed to delete membership:', error);
        alert('Failed to delete membership.');
      }
    }
  };



  const filteredMemberships = memberships.filter((m) =>
    m.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.payment_receipt && m.payment_receipt.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Memberships</h1>
          <p className="text-gray-500 text-sm">Manage member subscriptions and periods</p>
        </div>
        <Button onClick={() => navigate('/admin/memberships/add')}>
          <Plus className="w-4 h-4" />
          Add Membership
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Member, ID or Payment Ref..."
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
                <th className="px-6 py-3">Member Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Start Date</th>
                <th className="px-6 py-3">End Date</th>
                <th className="px-6 py-3">Days Left</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading memberships...</td></tr>
              ) : filteredMemberships.length > 0 ? (
                filteredMemberships.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{sub.member_name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{sub.member_email}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(sub.start_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(sub.end_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${sub.is_expiring_soon ? 'text-orange-600' : 'text-gray-900'}`}>
                        {sub.days_remaining} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={sub.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                          title="View Details"
                          onClick={() => navigate(`/admin/memberships/view/${sub.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-all"
                          title="Extend Membership"
                          onClick={() => navigate(`/admin/memberships/extend/${sub.id}`)}
                        >
                          <CalendarPlus className="w-4 h-4" />
                        </button>
                        {sub.status === 'frozen' ? (
                          <button
                            className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                            title="Unfreeze Membership"
                            onClick={() => navigate(`/admin/memberships/unfreeze/${sub.id}`)}
                          >
                            <Snowflake className="w-4 h-4 fill-current" />
                          </button>
                        ) : sub.status === 'active' ? (
                          <button
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                            title="Freeze Membership"
                            onClick={() => navigate(`/admin/memberships/freeze/${sub.id}`)}
                          >
                            <Snowflake className="w-4 h-4" />
                          </button>
                        ) : null}
                        <button
                          className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Membership"
                          onClick={() => navigate(`/admin/memberships/edit/${sub.id}`)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Membership"
                          onClick={() => handleDelete(sub.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No memberships found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
          <span>Showing {filteredMemberships.length} memberships</span>
        </div>
      </Card>
    </div>
  );
};

export default MembershipsList;
