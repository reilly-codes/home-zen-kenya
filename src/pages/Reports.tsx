import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { monthlyRentData, formatKES } from '@/lib/mock-data';

export default function Reports() {
  // Utility bill mock data
  const utilityData = [
    { month: 'Jul', water: 45000, electricity: 82000, garbage: 15000 },
    { month: 'Aug', water: 48000, electricity: 78000, garbage: 15000 },
    { month: 'Sep', water: 42000, electricity: 85000, garbage: 15000 },
    { month: 'Oct', water: 50000, electricity: 90000, garbage: 15000 },
    { month: 'Nov', water: 47000, electricity: 88000, garbage: 15000 },
    { month: 'Dec', water: 52000, electricity: 95000, garbage: 15000 },
  ];

  return (
    <DashboardLayout
      title="Reports & Analytics"
      description="Visual insights into your property portfolio"
    >
      <div className="grid gap-6">
        {/* Rent Collection Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Rent Collection Overview</CardTitle>
            <CardDescription>Monthly comparison of collected vs unpaid rent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRentData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="month" 
                    className="text-muted-foreground"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    className="text-muted-foreground"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatKES(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="collected" 
                    name="Collected" 
                    fill="hsl(var(--chart-1))" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="unpaid" 
                    name="Unpaid" 
                    fill="hsl(var(--chart-4))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Utility Tracking Table */}
        <Card>
          <CardHeader>
            <CardTitle>Utility Bill Trends</CardTitle>
            <CardDescription>Monthly utility expenses across all properties</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Month</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Water</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Electricity</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Garbage</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {utilityData.map((row, index) => {
                    const total = row.water + row.electricity + row.garbage;
                    return (
                      <tr key={row.month} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                        <td className="p-4 font-medium">{row.month} 2024</td>
                        <td className="p-4 text-right text-primary">{formatKES(row.water)}</td>
                        <td className="p-4 text-right text-warning">{formatKES(row.electricity)}</td>
                        <td className="p-4 text-right text-muted-foreground">{formatKES(row.garbage)}</td>
                        <td className="p-4 text-right font-semibold">{formatKES(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {utilityData.map((row) => {
                const total = row.water + row.electricity + row.garbage;
                return (
                  <div key={row.month} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">{row.month} 2024</span>
                      <span className="font-bold">{formatKES(total)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Water</p>
                        <p className="font-medium text-primary">{formatKES(row.water)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Electric</p>
                        <p className="font-medium text-warning">{formatKES(row.electricity)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Garbage</p>
                        <p className="font-medium">{formatKES(row.garbage)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
