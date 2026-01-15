import { useUser } from '@/contexts/UserContext';
import LandlordDashboard from './LandlordDashboard';
import TenantDashboard from './TenantDashboard';

const Index = () => {
  const { role } = useUser();

  return role === 'landlord' ? <LandlordDashboard /> : <TenantDashboard />;
};

export default Index;
