import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserCircle, Shield, Mail, Phone, Building, Calendar } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI.tsx';
import api from '../services/api';

const ViewAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await api.get(`/accounts/admins/${id}/`);
        setAdmin(response.data);
      } catch (error) {
        console.error('Failed to fetch admin details:', error);
        alert('Admin not found');
        navigate('/superuser/admins');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAdmin();
  }, [id, navigate]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  if (!admin) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/superuser/admins')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-500 text-sm">System staff details</p>
        </div>
      </div>

      <Card className="overflow-hidden p-0 border-none shadow-xl">
        <div className="h-32 bg-gradient-to-r from-primary to-blue-700"></div>
        <div className="px-8 pb-8 -mt-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="bg-white p-2 rounded-2xl shadow-lg">
              <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center text-primary">
                <UserCircle className="w-16 h-16" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`/superuser/admins/edit/${id}`)}>Edit Profile</Button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-black text-gray-900">{admin.first_name} {admin.last_name}</h2>
            <div className="flex items-center gap-2 text-primary font-bold mt-1">
              <Shield className="w-4 h-4" />
              <span className="uppercase text-xs tracking-widest">{admin.user_type}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Contact Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{admin.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{admin.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">System Access</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <span className="font-bold text-gray-400 text-[10px] uppercase">Username:</span>
                    <span className="font-mono text-primary font-bold">@{admin.username}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Work Assignment</h4>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Building className="w-5 h-5 text-primary" />
                    <span className="font-bold text-gray-900">{admin.gym_name || 'Unassigned'}</span>
                  </div>
                  {(admin.gym_name != null) ?
                    <p className="text-xs text-gray-500">Authorized Access</p>
                    : <p className="text-xs text-red-400">No Gym Assigned</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ViewAdmin;