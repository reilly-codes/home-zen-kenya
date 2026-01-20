import { useUser } from '@/contexts/UserContext';
import { Navigate } from 'react-router-dom';
import LandlordDashboard from './LandlordDashboard';
import TenantDashboard from './TenantDashboard';

const Index = () => {
  const { user, isLoading } = useUser();

  if(isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if(!user) {
    return <Navigate to="/login" replace />;
  }

  return Number(user.role) === 1 ? <LandlordDashboard /> : <TenantDashboard />
};

export default Index;
