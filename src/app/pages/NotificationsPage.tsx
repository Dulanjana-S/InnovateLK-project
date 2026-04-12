import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Bell, CheckCheck, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { notificationService, Notification } from "../services";
import { toast } from "sonner";

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const handleMarkRead = async (notificationId: string) => {
    try {
      const updated = await notificationService.markAsRead(notificationId);
      setNotifications((prev) => prev.map((item) => (item._id === notificationId ? updated : item)));
    } catch (error: any) {
      toast.error(error.message || "Failed to update notification");
    }
  };

  const handleOpen = async (item: Notification) => {
    if (!item.link) return;

    try {
      setOpeningId(item._id);
      if (!item.read) {
        const updated = await notificationService.markAsRead(item._id);
        setNotifications((prev) => prev.map((entry) => (entry._id === item._id ? updated : entry)));
      }
      navigate(item.link);
    } catch (error: any) {
      toast.error(error.message || "Failed to open notification");
    } finally {
      setOpeningId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true, readAt: item.readAt || new Date().toISOString() })));
      toast.success("All notifications marked as read");
    } catch (error: any) {
      toast.error(error.message || "Failed to mark all as read");
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((item) => item._id !== notificationId));
      toast.success("Notification deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete notification");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-gray-600">Stay up to date with messages, patent interest, detail requests, and platform activity</p>
          </div>
          <Button onClick={() => void handleMarkAllRead()} disabled={!notifications.length || unreadCount === 0}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Activity Feed
            </CardTitle>
            <CardDescription>{unreadCount} unread notification{unreadCount === 1 ? "" : "s"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="py-16 text-center text-gray-500">
                <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <Bell className="mx-auto mb-4 h-10 w-10 text-gray-300" />
                No notifications yet.
              </div>
            ) : (
              notifications.map((item) => (
                <motion.div key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl border p-4 ${item.read ? "bg-white" : "bg-blue-50 border-blue-200"}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{item.title}</h3>
                        <Badge variant={item.read ? "secondary" : "default"}>{item.read ? "Read" : "Unread"}</Badge>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-700">{item.message}</p>
                      <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.link ? (
                        <Button variant="outline" size="sm" onClick={() => void handleOpen(item)} disabled={openingId === item._id}>
                          {openingId === item._id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                          Open
                        </Button>
                      ) : null}
                      {!item.read ? (
                        <Button variant="outline" size="sm" onClick={() => void handleMarkRead(item._id)}>
                          Mark read
                        </Button>
                      ) : null}
                      <Button variant="outline" size="sm" onClick={() => void handleDelete(item._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
