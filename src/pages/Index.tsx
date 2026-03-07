import { useUser } from '@/contexts/UserContext';
import LandlordDashboard from './Landlord/LandlordDashboard';
import TenantDashboard from './Tenant/TenantDashboard';

const Index = () => {
  const { user, isLoading } = useUser();

  // role === 1 → Landlord, anything else → Tenant
  // ProtectedRoute guarantees user is never null here
  return Number(user.role) === 1 ? <LandlordDashboard /> : <TenantDashboard />
};

export default Index;
