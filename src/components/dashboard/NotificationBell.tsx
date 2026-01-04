import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notificationService } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: number;
  notification_type?: string;
  type?: string; // PadelVar uses this
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  link?: string;
}

// Helper to get emoji icon for notification type (like PadelVar)
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'SUPPORT':
      return '💬';
    case 'VIDEO':
      return '🎥';
    case 'CREDIT':
      return '💰';
    case 'SYSTEM':
      return '⚙️';
    case 'SHARE':
      return '🔗';
    default:
      return '📢';
  }
};

// Helper to format relative time (like PadelVar)
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // en secondes

  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

export function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications on mount and every 30 seconds (like PadelVar)
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Also load when popover opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getMyNotifications();
      console.log('[NotificationBell] API Response:', response.data);
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.stats?.unread_count || 0);
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      if (error.response?.status !== 401) {
        // Silently fail for auth errors
      }
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications(); // Reload to update count
      toast.success('Toutes les notifications sont marquées comme lues');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await notificationService.markAsRead(notification.id.toString());
        await loadNotifications(); // Reload to update count
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate if link is provided (like PadelVar)
    if (notification.link) {
      try {
        const validPaths = ['/dashboard', '/my-clips', '/profile', '/credits'];
        if (validPaths.some(path => notification.link?.startsWith(path))) {
          navigate(notification.link);
          setIsOpen(false); // Close popover
        } else {
          console.warn('Invalid notification link:', notification.link);
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }
  };

  const deleteNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // For now just remove from local state
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => {
      const notif = notifications.find(n => n.id === id);
      return notif && !notif.is_read ? prev - 1 : prev;
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-primary/10"
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 glass border-border/50"
      >
        {/* Header (like PadelVar) */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-semibold">
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-primary hover:text-primary"
            >
              <Check className="h-3 w-3 mr-1" />
              Tout marquer lu
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-96">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notification) => {
                const notifType = notification.notification_type || notification.type || 'SYSTEM';
                const icon = getNotificationIcon(notifType);

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-3 hover:bg-card/50 transition-colors cursor-pointer group ${!notification.is_read ? "bg-primary/5" : ""
                      }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3 w-full">
                      <div className="text-2xl flex-shrink-0">
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm">
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notification.is_read && (
                              <span className="h-2 w-2 rounded-full bg-primary" />
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              onClick={(e) => deleteNotification(notification.id, e)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
