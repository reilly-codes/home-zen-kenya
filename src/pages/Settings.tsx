// pages/Settings.tsx
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Shield } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function Settings() {
  // userProfile already exists in context — no fetch needed
  const { userProfile, isProfileLoading } = useUser();

  if (isProfileLoading) {
    return <p>Loading...</p>;
  }

  return (
    <DashboardLayout
      title="Settings"
      description="Manage your account and preferences"
    >
      <div className="max-w-2xl space-y-6">

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {/* userProfile?.name — safe even if profile hasn't loaded yet */}
              <Input id="name" defaultValue={userProfile?.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={userProfile?.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue={userProfile?.tel} />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg" disabled className="opacity-50 cursor-not-allowed">
            Save Changes
          </Button>
        </div>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Protect your account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full sm:w-auto">
              Change Password
            </Button>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}