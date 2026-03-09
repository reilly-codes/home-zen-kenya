import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatKES } from '@/lib/mock-data';
import { usePayments } from '@/hooks/usePayments';
import { useRentInvoices } from '@/hooks/useRentInvoices';
import { useReports } from '@/hooks/useReports';

const UTILITY_COLOURS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
];

export default function Reports() {
  const { rentInvoices } = useRentInvoices();
  const { payments } = usePayments();
  const { monthlyRentData, monthlyUtilityData, utilityTypes } = useReports(rentInvoices, payments);


  return (
    <DashboardLayout
      title="Reports & Analytics"
      description="Visual insights into your property portfolio"
    >
      <div className="grid gap-6">

        {/* ===== Rent Collection Chart ===== */}
        <Card>
          <CardHeader>
            <CardTitle>Rent Collection Overview</CardTitle>
            <CardDescription>
              Monthly comparison of collected vs unpaid rent
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyRentData.length === 0 ? (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground text-sm">
                No invoice data yet.
              </div>
            ) : (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRentData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      tickFormatter={(v) =>
                        v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v
                      }
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
            )}
          </CardContent>
        </Card>

        {/* ===== Utility Bill Trends ===== */}
        <Card>
          <CardHeader>
            <CardTitle>Utility Bill Trends</CardTitle>
            <CardDescription>
              Monthly utility expenses derived from rent invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyUtilityData.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No utility data yet — utility bills appear here once invoices are generated.
              </div>
            ) : (
              <>
                {/* Chart */}
                <div className="h-[300px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyUtilityData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis
                        tickFormatter={(v) =>
                          v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v
                        }
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
                      {utilityTypes.map((type, index) => (
                        <Bar
                          key={type}
                          dataKey={type}
                          name={type.charAt(0) + type.slice(1).toLowerCase()}
                          fill={UTILITY_COLOURS[index % UTILITY_COLOURS.length]}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-medium text-muted-foreground">
                          Month
                        </th>
                        {utilityTypes.map(type => (
                          <th
                            key={type}
                            className="text-right p-4 font-medium text-muted-foreground"
                          >
                            {type.charAt(0) + type.slice(1).toLowerCase()}
                          </th>
                        ))}
                        <th className="text-right p-4 font-medium text-muted-foreground">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyUtilityData.map((row, index) => {
                        const total = utilityTypes.reduce(
                          (sum, type) => sum + (Number(row[type]) || 0),
                          0
                        );
                        return (
                          <tr
                            key={row.month}
                            className={index % 2 === 0 ? 'bg-muted/30' : ''}
                          >
                            <td className="p-4 font-medium">{row.month}</td>
                            {utilityTypes.map(type => (
                              <td key={type} className="p-4 text-right">
                                {formatKES(Number(row[type]) || 0)}
                              </td>
                            ))}
                            <td className="p-4 text-right font-semibold">
                              {formatKES(total)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden space-y-3">
                  {monthlyUtilityData.map((row) => {
                    const total = utilityTypes.reduce(
                      (sum, type) => sum + (Number(row[type]) || 0),
                      0
                    );
                    return (
                      <div key={row.month} className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex justify-between mb-3">
                          <span className="font-semibold">{row.month}</span>
                          <span className="font-bold">{formatKES(total)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {utilityTypes.map(type => (
                            <div key={type}>
                              <p className="text-muted-foreground">
                                {type.charAt(0) + type.slice(1).toLowerCase()}
                              </p>
                              <p className="font-medium">
                                {formatKES(Number(row[type]) || 0)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
