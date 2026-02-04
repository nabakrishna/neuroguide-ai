import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Profile Section */}
        <div className="p-6 rounded-xl border border-border bg-card mb-6">
          <h2 className="font-semibold mb-6">Profile</h2>
          
          <div className="flex items-center gap-6 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-lg">
                {getInitials(user?.user_metadata?.full_name || user?.email || 'U')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.user_metadata?.full_name || 'User'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                defaultValue={user?.user_metadata?.full_name || ''}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
              />
            </div>
          </div>

          <Button className="mt-6">Save changes</Button>
        </div>

        {/* Account Section */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="font-semibold mb-4">Account</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Manage your account settings and preferences.
          </p>
          
          <div className="space-y-4">
            <Button variant="outline">Change password</Button>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="destructive">Delete account</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
