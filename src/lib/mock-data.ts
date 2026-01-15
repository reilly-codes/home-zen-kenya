// Mock data for Kenyan Rental Management System

export interface Property {
  id: string;
  name: string;
  location: string;
  totalUnits: number;
  occupiedUnits: number;
  monthlyRevenue: number;
  image?: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  type: string;
  rent: number;
  status: 'occupied' | 'vacant' | 'maintenance';
  tenantId?: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  unitId: string;
  unitNumber: string;
  propertyName: string;
  status: 'active' | 'moving-out' | 'pending';
  leaseStart: string;
  leaseEnd: string;
  balance: number;
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  date: string;
  method: string;
  status: 'reconciled' | 'pending';
  reference: string;
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  unitNumber: string;
  propertyName: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in-progress' | 'completed';
  createdAt: string;
  assignedTo?: string;
}

export interface Activity {
  id: string;
  type: 'payment' | 'maintenance' | 'tenant' | 'notice';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

// Properties
export const properties: Property[] = [
  {
    id: 'prop-1',
    name: 'Nairobi Heights Apartments',
    location: 'Kilimani, Nairobi',
    totalUnits: 24,
    occupiedUnits: 21,
    monthlyRevenue: 1260000,
  },
  {
    id: 'prop-2',
    name: 'Mombasa Breeze Flats',
    location: 'Nyali, Mombasa',
    totalUnits: 16,
    occupiedUnits: 14,
    monthlyRevenue: 560000,
  },
  {
    id: 'prop-3',
    name: 'Kisumu Lakeside Homes',
    location: 'Milimani, Kisumu',
    totalUnits: 12,
    occupiedUnits: 10,
    monthlyRevenue: 350000,
  },
  {
    id: 'prop-4',
    name: 'Eldoret Gardens',
    location: 'Elgon View, Eldoret',
    totalUnits: 8,
    occupiedUnits: 8,
    monthlyRevenue: 240000,
  },
];

// Units
export const units: Unit[] = [
  { id: 'unit-1', propertyId: 'prop-1', unitNumber: 'A101', type: '2 Bedroom', rent: 45000, status: 'occupied', tenantId: 'tenant-1' },
  { id: 'unit-2', propertyId: 'prop-1', unitNumber: 'A102', type: '1 Bedroom', rent: 35000, status: 'occupied', tenantId: 'tenant-2' },
  { id: 'unit-3', propertyId: 'prop-1', unitNumber: 'A103', type: 'Studio', rent: 25000, status: 'vacant' },
  { id: 'unit-4', propertyId: 'prop-1', unitNumber: 'A104', type: '3 Bedroom', rent: 65000, status: 'maintenance' },
  { id: 'unit-5', propertyId: 'prop-1', unitNumber: 'B101', type: '2 Bedroom', rent: 48000, status: 'occupied', tenantId: 'tenant-3' },
  { id: 'unit-6', propertyId: 'prop-1', unitNumber: 'B102', type: '1 Bedroom', rent: 35000, status: 'occupied', tenantId: 'tenant-4' },
];

// Tenants
export const tenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'James Mwangi',
    email: 'james.mwangi@email.com',
    phone: '+254 712 345 678',
    unitId: 'unit-1',
    unitNumber: 'A101',
    propertyName: 'Nairobi Heights Apartments',
    status: 'active',
    leaseStart: '2024-01-15',
    leaseEnd: '2025-01-14',
    balance: 0,
  },
  {
    id: 'tenant-2',
    name: 'Mary Wanjiku',
    email: 'mary.wanjiku@email.com',
    phone: '+254 723 456 789',
    unitId: 'unit-2',
    unitNumber: 'A102',
    propertyName: 'Nairobi Heights Apartments',
    status: 'active',
    leaseStart: '2024-03-01',
    leaseEnd: '2025-02-28',
    balance: 35000,
  },
  {
    id: 'tenant-3',
    name: 'Peter Ochieng',
    email: 'peter.ochieng@email.com',
    phone: '+254 734 567 890',
    unitId: 'unit-5',
    unitNumber: 'B101',
    propertyName: 'Nairobi Heights Apartments',
    status: 'moving-out',
    leaseStart: '2023-06-01',
    leaseEnd: '2024-12-31',
    balance: 48000,
  },
  {
    id: 'tenant-4',
    name: 'Grace Akinyi',
    email: 'grace.akinyi@email.com',
    phone: '+254 745 678 901',
    unitId: 'unit-6',
    unitNumber: 'B102',
    propertyName: 'Nairobi Heights Apartments',
    status: 'active',
    leaseStart: '2024-02-01',
    leaseEnd: '2025-01-31',
    balance: 0,
  },
  {
    id: 'tenant-5',
    name: 'John Kamau',
    email: 'john.kamau@email.com',
    phone: '+254 756 789 012',
    unitId: 'unit-7',
    unitNumber: 'C101',
    propertyName: 'Mombasa Breeze Flats',
    status: 'active',
    leaseStart: '2024-04-01',
    leaseEnd: '2025-03-31',
    balance: 0,
  },
];

// Recent Payments
export const recentPayments: Payment[] = [
  {
    id: 'pay-1',
    tenantId: 'tenant-1',
    tenantName: 'James Mwangi',
    amount: 45000,
    date: '2024-12-05',
    method: 'M-Pesa',
    status: 'reconciled',
    reference: 'MPESA1234567',
  },
  {
    id: 'pay-2',
    tenantId: 'tenant-4',
    tenantName: 'Grace Akinyi',
    amount: 35000,
    date: '2024-12-04',
    method: 'Bank Transfer',
    status: 'pending',
    reference: 'BANK987654',
  },
  {
    id: 'pay-3',
    tenantId: 'tenant-5',
    tenantName: 'John Kamau',
    amount: 42000,
    date: '2024-12-03',
    method: 'M-Pesa',
    status: 'reconciled',
    reference: 'MPESA7654321',
  },
];

// Maintenance Requests
export const maintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'maint-1',
    tenantId: 'tenant-2',
    tenantName: 'Mary Wanjiku',
    unitNumber: 'A102',
    propertyName: 'Nairobi Heights',
    description: 'Leaking kitchen sink tap needs replacement',
    priority: 'medium',
    status: 'new',
    createdAt: '2024-12-10',
  },
  {
    id: 'maint-2',
    tenantId: 'tenant-1',
    tenantName: 'James Mwangi',
    unitNumber: 'A101',
    propertyName: 'Nairobi Heights',
    description: 'Bathroom door handle broken',
    priority: 'low',
    status: 'in-progress',
    createdAt: '2024-12-08',
    assignedTo: 'Kamau Hardware & Services',
  },
  {
    id: 'maint-3',
    tenantId: 'tenant-3',
    tenantName: 'Peter Ochieng',
    unitNumber: 'B101',
    propertyName: 'Nairobi Heights',
    description: 'Electrical outlet not working in bedroom',
    priority: 'high',
    status: 'new',
    createdAt: '2024-12-09',
  },
  {
    id: 'maint-4',
    tenantId: 'tenant-4',
    tenantName: 'Grace Akinyi',
    unitNumber: 'B102',
    propertyName: 'Nairobi Heights',
    description: 'Air conditioning unit making noise',
    priority: 'low',
    status: 'completed',
    createdAt: '2024-12-01',
    assignedTo: 'CoolAir Kenya Ltd',
  },
];

// Recent Activity
export const recentActivity: Activity[] = [
  {
    id: 'act-1',
    type: 'payment',
    title: 'Payment Received',
    description: 'James Mwangi paid KES 45,000 for Unit A101',
    timestamp: '2 hours ago',
    icon: 'banknote',
  },
  {
    id: 'act-2',
    type: 'maintenance',
    title: 'New Repair Request',
    description: 'Mary Wanjiku submitted a repair request for Unit A102',
    timestamp: '5 hours ago',
    icon: 'wrench',
  },
  {
    id: 'act-3',
    type: 'tenant',
    title: 'Move-out Notice',
    description: 'Peter Ochieng submitted move-out notice for Unit B101',
    timestamp: '1 day ago',
    icon: 'user-minus',
  },
  {
    id: 'act-4',
    type: 'payment',
    title: 'Payment Received',
    description: 'Grace Akinyi paid KES 35,000 for Unit B102',
    timestamp: '2 days ago',
    icon: 'banknote',
  },
  {
    id: 'act-5',
    type: 'notice',
    title: 'Lease Expiring Soon',
    description: 'Lease for Unit A101 expires in 30 days',
    timestamp: '3 days ago',
    icon: 'calendar',
  },
];

// Dashboard Stats
export const dashboardStats = {
  totalRevenue: 2410000,
  pendingRent: 183000,
  occupancyRate: 88,
  openRepairs: 3,
  totalProperties: 4,
  totalUnits: 60,
  totalTenants: 53,
};

// Helper function to format KES currency
export const formatKES = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Chart data for reports
export const monthlyRentData = [
  { month: 'Jul', collected: 2100000, unpaid: 150000 },
  { month: 'Aug', collected: 2250000, unpaid: 120000 },
  { month: 'Sep', collected: 2180000, unpaid: 180000 },
  { month: 'Oct', collected: 2320000, unpaid: 90000 },
  { month: 'Nov', collected: 2280000, unpaid: 130000 },
  { month: 'Dec', collected: 2410000, unpaid: 183000 },
];
