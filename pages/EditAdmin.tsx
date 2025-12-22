import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Shield, Mail, Phone, Building, Eye, EyeOff } from 'lucide-react';
import { Card, Button } from '../components/UI.tsx';
import api from '../services/api';

const EditAdmin: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [gyms, setGyms] = useState<{ id: number, name: string }[]>([]);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        user_type: 'Gym Admin',
        gym_id: '',
        password: '', // New optional field
        confirm_password: '' // New optional field
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        try {
            const [gymsRes, adminRes] = await Promise.all([
                api.get('/gyms/'),
                api.get(`/accounts/admins/${id}/`)
            ]);

            setGyms(gymsRes.data);

            const admin = adminRes.data;
            setFormData({
                username: admin.username,
                email: admin.email,
                first_name: admin.first_name || '',
                last_name: admin.last_name || '',
                phone: admin.phone || '',
                user_type: admin.user_type, // Maintain existing type
                gym_id: admin.gym || '', // User serializer returns gym ID in 'gym' field
                password: '', // Reset password fields
                confirm_password: ''
            });

        } catch (error) {
            console.error('Failed to load data:', error);
            alert('Failed to load admin data');
            navigate('/superuser/admins');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Password validation if provided
        if (formData.password && formData.password !== formData.confirm_password) {
            alert("Passwords do not match!");
            return;
        }

        setLoading(true);

        try {
            const payload: any = {
                username: formData.username,
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                gym: formData.gym_id
            };

            // Only include password if user entered one
            if (formData.password) {
                payload.password = formData.password;
            }

            await api.put(`/accounts/admins/${id}/`, payload); // Use PUT for full update with optional password

            console.log('Admin Updated Successfully');
            navigate('/superuser/admins');
        } catch (error) {
            console.error('Failed to update admin:', error);
            alert('Failed to update admin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/superuser/admins')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Admin</h1>
                    <p className="text-gray-500 text-sm">Update staff credentials</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                        <Shield className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-gray-900">Admin Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username *</label>
                            <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email *</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name *</label>
                            <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name *</label>
                            <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assigned Gym *</label>
                            <select name="gym_id" required value={formData.gym_id} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white">
                                <option value="">Select a Gym</option>
                                {gyms.map(gym => <option key={gym.id} value={gym.id}>{gym.name}</option>)}
                            </select>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                        <Shield className="w-5 h-5 text-red-500" />
                        <h3 className="text-lg font-bold text-gray-900">Change Password (Optional)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm New Password</label>
                            <div className="relative">
                                <input type={showConfirmPassword ? "text" : "password"} name="confirm_password" value={formData.confirm_password} onChange={handleChange} placeholder="Retype new password" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="secondary" onClick={() => navigate('/superuser/admins')}>Cancel</Button>
                    <Button type="submit" disabled={loading} className="shadow-lg shadow-blue-200">
                        <Save className="w-4 h-4" />{loading ? 'Saving...' : 'Update Admin'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditAdmin;