import { useLocation, useNavigate } from 'react-router';
import { Link } from '../ui/link';
import { Button } from '../ui/button';
import { Menu, Bell, MessageSquare, User, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { chatService, notificationService } from '../../services';
import { subscribeToCountsRefresh } from '../../utils/appEvents';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  const loadCounts = useCallback(async () => {
    if (!isAuthenticated) {
      setNotificationCount(0);
      setMessageCount(0);
      return;
    }

    try {
      const [unreadNotifications, conversations] = await Promise.all([
        notificationService.getUnreadCount(),
        chatService.getConversations(),
      ]);
      setNotificationCount(unreadNotifications);
      setMessageCount(conversations.reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0));
    } catch (_error) {
      setNotificationCount(0);
      setMessageCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const refreshOnFocus = () => {
      void loadCounts();
    };

    void loadCounts();
    const unsubscribe = subscribeToCountsRefresh(() => {
      void loadCounts();
    });
    const intervalId = window.setInterval(() => {
      void loadCounts();
    }, 10000);

    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnFocus);

    return () => {
      unsubscribe();
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnFocus);
    };
  }, [loadCounts, location.pathname, user?.id]);

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'Innovator') return '/innovator-dashboard';
    if (user.role === 'Investor') return '/investor-dashboard';
    if (user.role === 'Manufacturer') return '/manufacturer-dashboard';
    if (user.role === 'Admin') return '/admin';
    return '/';
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Browse Patents', path: '/browse' },
    { name: 'AI Assistant', path: '/ai-chatbot' },
    ...(isAuthenticated ? [{ name: 'People', path: '/people' }] : []),
    ...(user?.role === 'Admin' ? [{ name: 'Admin Panel', path: '/admin' }] : []),
    { name: 'About', path: '/about' },
  ];

  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl shadow-lg border-b border-slate-200/70'
          : 'bg-white/95 backdrop-blur-md border-b border-slate-200/50'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 lg:h-[70px] items-center justify-between gap-3 lg:gap-5">
          <Link to="/" className="group shrink-0">
            <motion.div className="rounded-2xl px-2 py-1.5 hover:bg-slate-50 transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <img
                src="/logo.png"
                alt="InnovateLK logo"
                className="!h-11 sm:!h-12 !w-auto max-w-[280px] object-contain"
              />
            </motion.div>
          </Link>

          <div className="hidden lg:flex items-center rounded-2xl border border-slate-200/80 bg-white/90 px-2 py-1 shadow-sm">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="relative rounded-xl px-4 py-2 group">
                {isLinkActive(link.path) ? (
                  <motion.span
                    layoutId="navbar-pill"
                    className="absolute inset-0 rounded-xl bg-blue-50 border border-blue-100"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                ) : null}
                <span className={`relative z-10 text-sm font-semibold transition-colors duration-200 ${isLinkActive(link.path) ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-700'}`}>
                  {link.name}
                </span>
                {!isLinkActive(link.path) ? (
                  <span className="absolute inset-0 rounded-xl bg-blue-50/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                ) : null}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="icon" className="relative hover:bg-blue-50 transition-colors hidden sm:flex rounded-xl border border-transparent hover:border-blue-100" asChild>
                    <Link to="/notifications">
                      <Bell className="h-5 w-5 text-gray-700" />
                      {notificationCount > 0 ? (
                        <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-red-600 border-2 border-white text-xs">
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </Badge>
                      ) : null}
                    </Link>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="icon" className="relative hover:bg-blue-50 transition-colors hidden sm:flex rounded-xl border border-transparent hover:border-blue-100" asChild>
                    <Link to="/messages">
                      <MessageSquare className="h-5 w-5 text-gray-700" />
                      {messageCount > 0 ? (
                        <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 bg-gradient-to-r from-blue-500 to-blue-600 border-2 border-white text-xs">
                          {messageCount > 9 ? '9+' : messageCount}
                        </Badge>
                      ) : null}
                    </Link>
                  </Button>
                </motion.div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="ghost" size="icon" className="hover:bg-blue-50 transition-colors rounded-xl border border-transparent hover:border-blue-100">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 shadow-xl">
                    <div className="px-3 py-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-t-lg">
                      <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-blue-600 font-medium">{user?.role}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()} className="cursor-pointer">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile-settings" className="cursor-pointer">Profile Settings</Link>
                    </DropdownMenuItem>
                    {user?.role !== 'Admin' ? (
                      <>
                        {user?.role === 'Innovator' ? (
                          <DropdownMenuItem asChild>
                            <Link to="/my-patents" className="cursor-pointer">My Patents</Link>
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem asChild>
                          <Link to="/favorites" className="cursor-pointer">Favorites</Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">Admin Panel</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300" asChild><Link to="/login">Login</Link></Button>
                <Button className="shadow-sm bg-blue-600 hover:bg-blue-700" asChild><Link to="/register">Get Started</Link></Button>
              </div>
            )}

            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl border border-gray-200 bg-white/80 hover:bg-blue-50">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] p-0">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b">
                      <img src="/logo.png" alt="InnovateLK logo" className="!h-11 !w-auto max-w-[220px] object-contain shrink-0" />
                      <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="rounded-xl">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      <div className="space-y-2">
                        {navLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block rounded-xl px-4 py-3 text-sm font-medium ${isLinkActive(link.path) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                          >
                            {link.name}
                          </Link>
                        ))}
                      </div>
                      {isAuthenticated ? (
                        <div className="space-y-2 border-t pt-4">
                          <Link to="/notifications" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <span>Notifications</span>
                            {notificationCount > 0 ? <Badge>{notificationCount}</Badge> : null}
                          </Link>
                          <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <span>Messages</span>
                            {messageCount > 0 ? <Badge>{messageCount}</Badge> : null}
                          </Link>
                          <Link to="/favorites" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Favorites</Link>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
