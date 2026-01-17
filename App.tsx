import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import api from './services/api';
import Sidebar from './components/Sidebar.tsx';
import Login from './pages/Login.tsx';
import SuperUserDashboard from './pages/SuperUserDashboard.tsx';
import GymsList from './pages/GymsList.tsx';
import CreateGym from './pages/CreateGym.tsx';
import EditGym from './pages/EditGym.tsx';
import ViewGym from './pages/ViewGym.tsx';
import AdminsList from './pages/AdminsList.tsx';
import CreateAdmin from './pages/CreateAdmin.tsx';
import EditAdmin from './pages/EditAdmin.tsx';
import ViewAdmin from './pages/ViewAdmin.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import MemberDashboard from './pages/MemberDashboard.tsx';
import MembersList from './pages/MembersList.tsx';
import AddMember from './pages/AddMember.tsx';
import EditMember from './pages/EditMember.tsx';
import ViewMember from './pages/ViewMember.tsx';
import PlansList from './pages/PlansList.tsx';
import AddPlan from './pages/AddPlan.tsx';
import EditPlan from './pages/EditPlan.tsx';
import ViewPlan from './pages/ViewPlan.tsx';
import MembershipsList from './pages/MembershipsList.tsx';
import AddMembership from './pages/AddMembership.tsx';
import EditMembership from './pages/EditMembership.tsx';
import ViewMembership from './pages/ViewMembership.tsx';
import ExtendMembership from './pages/ExtendMembership.tsx';
import FreezeMembership from './pages/FreezeMembership.tsx';
import UnfreezeMembership from './pages/UnfreezeMembership.tsx';
import PaymentsList from './pages/PaymentsList.tsx';
import AddPayment from './pages/AddPayment.tsx';
import EditPayment from './pages/EditPayment.tsx';
import ViewPayment from './pages/ViewPayment.tsx';
import { UserRole } from './types.ts';
import { Menu, Construction } from 'lucide-react';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole: UserRole;
  currentRole: UserRole | null
}> = ({ children, allowedRole, currentRole }) => {
  if (!currentRole) {
    return <Navigate to="/login" replace />;
  }
  if (currentRole !== allowedRole) {
    return <Navigate to={`/${currentRole}`} replace />;
  }
  return <>{children}</>;
};

const Layout: React.FC<{ role: UserRole; onLogout: () => void; children: React.ReactNode }> = ({ role, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        role={role}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md hover:bg-gray-100">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <span className="font-bold text-gray-800 tracking-tight">GymPro Nexus</span>
          <div className="w-10" />
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col">
          <main className="flex-grow p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-4">
        <Construction className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
      <p className="text-gray-500 max-w-md">
        The <span className="font-medium text-gray-900">{title}</span> module is currently under development. Check back later for updates.
      </p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(
    (localStorage.getItem('user_role') as UserRole) || null
  );

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/accounts/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem('user_role');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUserRole(null);
    }
  };

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/login"
          element={userRole ? <Navigate to={`/${userRole}`} replace /> : <Login onLogin={handleLogin} />}
        />

        <Route
          path="/superuser/*"
          element={
            <ProtectedRoute allowedRole="superuser" currentRole={userRole}>
              <Layout role="superuser" onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<SuperUserDashboard />} />
                  <Route path="gyms" element={<GymsList />} />
                  <Route path="gyms/create" element={<CreateGym />} />
                  <Route path="gyms/view/:id" element={<ViewGym />} />
                  <Route path="gyms/edit/:id" element={<EditGym />} />
                  <Route path="admins" element={<AdminsList />} />
                  <Route path="admins/create" element={<CreateAdmin />} />
                  <Route path="admins/view/:id" element={<ViewAdmin />} />
                  <Route path="admins/edit/:id" element={<EditAdmin />} />
                  <Route path="reports" element={<PlaceholderPage title="System Reports" />} />
                  <Route path="settings" element={<PlaceholderPage title="System Settings" />} />
                  <Route path="*" element={<Navigate to="/superuser" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="admin" currentRole={userRole}>
              <Layout role="admin" onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="members" element={<MembersList />} />
                  <Route path="members/add" element={<AddMember />} />
                  <Route path="members/view/:id" element={<ViewMember />} />
                  <Route path="members/edit/:id" element={<EditMember />} />
                  <Route path="memberships" element={<MembershipsList />} />
                  <Route path="memberships/add" element={<AddMembership />} />
                  <Route path="memberships/view/:id" element={<ViewMembership />} />
                  <Route path="memberships/edit/:id" element={<EditMembership />} />
                  <Route path="memberships/extend/:id" element={<ExtendMembership />} />
                  <Route path="memberships/freeze/:id" element={<FreezeMembership />} />
                  <Route path="memberships/unfreeze/:id" element={<UnfreezeMembership />} />
                  <Route path="plans" element={<PlansList />} />
                  <Route path="plans/add" element={<AddPlan />} />
                  <Route path="plans/view/:id" element={<ViewPlan />} />
                  <Route path="plans/edit/:id" element={<EditPlan />} />
                  <Route path="payments" element={<PaymentsList />} />
                  <Route path="payments/add" element={<AddPayment />} />
                  <Route path="payments/view/:id" element={<ViewPayment />} />
                  <Route path="payments/edit/:id" element={<EditPayment />} />
                  <Route path="attendance" element={<PlaceholderPage title="Attendance" />} />
                  <Route path="broadcasts" element={<PlaceholderPage title="Broadcasts" />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/member/*"
          element={
            <ProtectedRoute allowedRole="member" currentRole={userRole}>
              <Layout role="member" onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<MemberDashboard />} />
                  <Route path="profile" element={<PlaceholderPage title="My Profile" />} />
                  <Route path="attendance" element={<PlaceholderPage title="My Attendance History" />} />
                  <Route path="*" element={<Navigate to="/member" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={userRole ? <Navigate to={`/${userRole}`} replace /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;