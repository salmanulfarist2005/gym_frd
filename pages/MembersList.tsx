import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Edit2, Trash2, FileDown, Eye } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI.tsx';
import api from '../services/api';

// Define Interface matching Backend Response
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

interface MemberProfile {
  id: number;
  user: User;
  membership_status: string;
  membership_end_date: string | null;
  gym_name: string;
}

const MembersList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Members from API
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/accounts/members/');
      setMembers(response.data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const fullName = `${member.user.first_name} ${member.user.last_name}`;
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.user.phone && member.user.phone.includes(searchTerm));

    // Map backend status to filter logic. 
    // Backend: 'active', 'inactive', 'suspended', 'expired'
    // Filter: 'All', 'Active', 'Expired', 'Frozen' (Suspended maps to Frozen?)
    const backendStatus = member.membership_status;
    let matchesStatus = true;

    if (statusFilter !== 'All') {
      if (statusFilter === 'Active' && backendStatus !== 'active') matchesStatus = false;
      if (statusFilter === 'Expired' && backendStatus !== 'expired') matchesStatus = false;
      if (statusFilter === 'Frozen' && backendStatus !== 'suspended') matchesStatus = false;
    }

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      try {
        await api.delete(`/accounts/member-profile/${id}/`);
        setMembers(members.filter(m => m.id !== id));
        // alert('Member deleted successfully');
      } catch (error) {
        console.error('Failed to delete member:', error);
        alert('Failed to delete member.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'expired': return 'Expired';
      case 'suspended': return 'Inactive'; // Using Inactive as badge for suspended/frozen
      case 'inactive': return 'Inactive';
      default: return 'Inactive';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-500 text-sm">Manage all gym members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileDown className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={() => navigate('/admin/members/add')}>
            <Plus className="w-4 h-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Frozen">Frozen</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Members Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Member Info</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Current Plan</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Expiry Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading members...</td></tr>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{member.user.first_name} {member.user.last_name}</div>
                        <div className="text-xs text-gray-500">{member.user.email}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">#{member.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {member.user.phone || '-'}
                    </td>
                    <td className="px-6 py-3 text-gray-600">-</td> {/* Plan Info not in Profile yet */}
                    <td className="px-6 py-3">
                      <Badge status={getStatusBadge(member.membership_status)} />
                    </td>
                    <td className="px-6 py-3 text-gray-600">{member.membership_end_date || 'N/A'}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                          title="View Profile"
                          onClick={() => navigate(`/admin/members/view/${member.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Member"
                          onClick={() => navigate(`/admin/members/edit/${member.id}`)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Member"
                          onClick={() => handleDelete(member.id)}
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
                    No members found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
          <span>Showing {filteredMembers.length} results</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-white disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MembersList;