import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Settings, 
  Target, 
  BookOpen, 
  Users, 
  Shield,
  AlertCircle,
  X,
} from 'lucide-react';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'funding' | 'course' | 'community' | 'system' | 'security';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

const iconMap = {
  funding: Target,
  course: BookOpen,
  community: Users,
  system: AlertCircle,
  security: Shield,
};

const colorMap = {
  funding: 'text-primary bg-primary/10',
  course: 'text-primary bg-primary/10',
  community: 'text-success bg-success/10',
  system: 'text-warning bg-warning/10',
  security: 'text-destructive bg-destructive/10',
};

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'funding',
      title: 'New funding match',
      message: 'Indigenous Business Development Program - 85% match',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      link: '/dashboard/funding',
    },
    {
      id: '2',
      type: 'course',
      title: 'Course reminder',
      message: 'Complete Module 3 of Business Fundamentals',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      link: '/learning',
    },
    {
      id: '3',
      type: 'community',
      title: 'Community update',
      message: 'Elder wisdom session scheduled for next week',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: false,
      link: '/dashboard/forum',
    },
    {
      id: '4',
      type: 'funding',
      title: 'Application deadline',
      message: 'NACCA Micro-Loan application closes in 3 days',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      read: true,
      link: '/dashboard/funding',
    },
    {
      id: '5',
      type: 'security',
      title: 'New login detected',
      message: 'Login from a new device in Toronto, ON',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTimestamp = (date: Date) => {
    if (isToday(date)) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-white/80 hover:text-white hover:bg-white/10"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Link to="/dashboard/settings">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = iconMap[notification.type];
                return (
                  <div 
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-muted/50 transition-colors relative group",
                      !notification.read && "bg-primary/5"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                        colorMap[notification.type]
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={cn(
                              "text-sm",
                              !notification.read && "font-medium"
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => markAsRead(notification.id)}
                                title="Mark as read"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => dismissNotification(notification.id)}
                              title="Dismiss"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {notification.link && (
                      <Link 
                        to={notification.link}
                        className="absolute inset-0"
                        onClick={() => {
                          markAsRead(notification.id);
                          setOpen(false);
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <Separator />
        <div className="p-2">
          <Link to="/dashboard/notifications">
            <Button variant="ghost" className="w-full text-sm">
              View all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
