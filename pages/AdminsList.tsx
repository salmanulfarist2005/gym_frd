import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ShieldCheck, Edit2, Trash2, Mail, Phone, Building2, UserCircle, Eye } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI.tsx';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_type: string;
  gym: number;
  gym_name: string;
}

const AdminsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/accounts/admins/');
      // Backend now filters for admins, so we don't need to filter on frontend, 
      // but keeping it safe or just setting directly
      setAdmins(response.data);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      try {
        await api.delete(`/accounts/admins/${id}/`);
        fetchAdmins();
      } catch (error) {
        console.error('Failed to delete admin:', error);
        alert('Failed to delete admin. Please try again.');
      }
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (admin.first_name && admin.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (admin.last_name && admin.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Administrators</h1>
          <p className="text-gray-500 text-base mt-0.5">Manage staff accounts and gym assignments</p>
        </div>
        <Button onClick={() => navigate('/superuser/admins/create')}>
          <Plus className="w-5 h-5" />
          Add Admin
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 pr-4 py-2.5 w-full border-2 border-gray-100 rounded-xl text-base font-medium focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-primary shadow-sm transition-all"
          />
        </div>
      </Card>

      <Card className="overflow-hidden p-0 border-none shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead className="bg-gray-50 text-gray-600 font-black uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-8 py-5">ID & Username</th>
                <th className="px-8 py-5">Admin Name</th>
                <th className="px-8 py-5">Contact Info</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Gym</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-6 text-center text-gray-500">Loading admins...</td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-6 text-center text-gray-500">No admins found.</td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-blue-50/20 group transition-all text-sm">
                    <td className="px-8 py-6">
                      <div className="font-mono text-[10px] text-gray-400 mb-0.5 font-bold uppercase">{admin.id}</div>
                      <div className="flex items-center gap-2 font-black text-primary">
                        <UserCircle className="w-5 h-5" />
                        @{admin.username}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-gray-900">{admin.first_name} {admin.last_name || '-'}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 text-gray-600 font-medium text-xs">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {admin.email}
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-600 font-medium text-xs">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {admin.phone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide bg-indigo-100 text-indigo-700">
                        {admin.user_type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5 text-gray-700 font-black">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {admin.gym_name || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-all"
                          title="View Profile"
                          onClick={() => navigate(`/superuser/admins/view/${admin.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-all"
                          title="Edit"
                          onClick={() => navigate(`/superuser/admins/edit/${admin.id}`)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-danger hover:bg-white rounded-lg transition-all"
                          title="Delete"
                          onClick={() => handleDelete(admin.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminsList;