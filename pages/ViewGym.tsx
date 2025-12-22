import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building, MapPin, Users, TrendingUp, Calendar, User, Mail, Phone, Clock } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI.tsx';
import api from '../services/api';

interface GymDetails {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  owner_name: string;
  is_active: boolean;
  created_at: string;
  logo: string | null;
  membersCount?: number; // These might be 0 for now until backend aggregates them
  revenue?: number;
}

const ViewGym: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [gym, setGym] = useState<GymDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGymDetails = async () => {
      try {
        const response = await api.get(`/gyms/${id}/`);
        setGym(response.data);
      } catch (err: any) {
        console.error('Failed to fetch gym details:', err);
        setError('Failed to load gym details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGymDetails();
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading gym details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!gym) return <div className="p-8 text-center">Gym not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/superuser/gyms')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{gym.name}</h1>
          <p className="text-gray-500 text-sm">Gym Branch Overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="space-y-6 p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-primary rounded-xl">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">General Information</h3>
                  <p className="text-sm text-gray-500">Details about this location</p>
                </div>
              </div>
              <Badge status={gym.is_active ? 'Active' : 'Inactive'} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><User className="w-3 h-3" /> Owner</span>
                <p className="font-medium text-gray-900">{gym.owner_name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Calendar className="w-3 h-3" /> Founded</span>
                <p className="font-medium text-gray-900">{new Date(gym.created_at).toLocaleDateString()}</p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</span>
                <p className="font-medium text-gray-900 break-words">{gym.address}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</span>
                <p className="font-medium text-gray-900">{gym.phone || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>
                <p className="font-medium text-gray-900 break-words">{gym.email || 'N/A'}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</span>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">{gym.description || 'No description provided.'}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-primary to-blue-600 text-white border-none shadow-xl shadow-blue-200">
            <div className="p-3 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <Users className="w-8 h-8" />
            </div>
            <h4 className="text-4xl font-black tracking-tight">{gym.membersCount || 0}</h4>
            <p className="text-sm opacity-90 font-medium">Active Members</p>
          </Card>

          <Card className="flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-xl shadow-emerald-200">
            <div className="p-3 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h4 className="text-4xl font-black tracking-tight">₹{(gym.revenue || 0).toLocaleString()}</h4>
            <p className="text-sm opacity-90 font-medium">Monthly Revenue</p>
          </Card>

          <div className="pt-2">
            <Button className="w-full justify-center shadow-lg" onClick={() => navigate(`/superuser/gyms/edit/${gym.id}`)}>Edit Gym Details</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewGym;