import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { motion } from "motion/react";
import { Camera, Mail, Save, Shield, Trash2, User as UserIcon, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services";
import { toast } from "sonner";

export function ProfileSettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    bio: "",
    company: "",
    avatar: "",
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    marketingEmails: false,
  });

  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || "",
      country: user.country || "",
      bio: user.bio || "",
      company: user.company || "",
      avatar: user.avatar || "",
    });
  }, [user]);

  const initials = useMemo(
    () => (user?.name || "U").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    [user?.name],
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await userService.updateMe({
        name: formData.name,
        country: formData.country,
        bio: formData.bio,
        company: formData.company,
        avatar: formData.avatar,
        preferences: notifications,
      });

      updateUser({
        id: updated._id || user?.id || "",
        name: updated.name,
        email: updated.email,
        role: updated.role,
        country: updated.country,
        avatar: updated.avatar,
        bio: updated.bio,
        company: updated.company,
        verified: updated.verified,
      });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm("Delete your account permanently?");
    if (!confirmed) return;

    try {
      await userService.deleteAccount(user.id);
      await logout();
      toast.success("Your account has been deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-gray-50 pt-24 text-center">Please login to manage your profile.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update how other users see you on the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={formData.avatar} alt={formData.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 w-full">
                    <Button variant="outline" size="sm" disabled>
                      <Camera className="mr-2 h-4 w-4" />
                      Avatar URL below
                    </Button>
                    <Input
                      value={formData.avatar}
                      onChange={(e) => setFormData((prev) => ({ ...prev, avatar: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="https://example.com/avatar.png"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={user.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={formData.country} onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Organization</Label>
                    <Input value={formData.company} onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))} disabled={!isEditing} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>User Role</Label>
                  <div><Badge className="text-base py-2 px-4">{user.role}</Badge></div>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea rows={5} value={formData.bio} onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))} disabled={!isEditing} />
                </div>

                <div className="flex gap-2 pt-4">
                  {isEditing ? (
                    <>
                      <Button onClick={() => void handleSave()} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Reference details for your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Account ID</p>
                      <p className="text-sm text-gray-600">{user.id}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Primary Email</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{user.verified ? "Verified" : "Unverified"}</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose which updates you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Email notifications</p>
                    <p className="text-sm text-gray-600">Messages, interest alerts, and system updates</p>
                  </div>
                  <Switch checked={notifications.emailNotifications} onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, emailNotifications: checked }))} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Marketing emails</p>
                    <p className="text-sm text-gray-600">Product updates and featured opportunities</p>
                  </div>
                  <Switch checked={notifications.marketingEmails} onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, marketingEmails: checked }))} />
                </div>
                <Button onClick={() => void handleSave()} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Security actions for your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <p className="font-medium">JWT Authentication Enabled</p>
                  </div>
                  <p className="text-sm text-gray-600">Your session is protected with access and refresh tokens.</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="font-medium text-red-700 mb-2">Danger Zone</p>
                  <p className="text-sm text-red-600 mb-4">Delete your account and remove your access permanently.</p>
                  <Button variant="destructive" onClick={() => void handleDeleteAccount()}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
