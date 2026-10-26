import React, { useEffect, useState } from 'react';
import '../dashboard-refinement.css';
import {
  NavLink,
  Link,
  useNavigate,
  useLocation
} from 'react-router-dom';

import Logo from './Logo';
import {
  load,
  logout
} from '../lib/store';
import { supabase } from '../lib/supabase';
import { subscribeToClientMessages } from '../lib/messageRealtime';
import { useStaffAccess } from '../lib/staffAccess';
import ProfileAvatar from './ProfileAvatar';

/* =========================================================
   NAVIGATION
========================================================= */

const userNav = [
  {
    to: '/dashboard',
    label: 'Overview',
    icon: 'grid'
  },
  {
    to: '/dashboard/profile',
    label: 'My Profile',
    icon: 'user'
  },
  {
    to: '/dashboard/orders',
    label: 'My Orders',
    icon: 'orders'
  },
  {
    to: '/dashboard/messages',
    label: 'Messages',
    icon: 'message'
  },
  {
    to: '/dashboard/files',
    label: 'Files',
    icon: 'file'
  },
  {
    to: '/dashboard/payments',
    label: 'Payments',
    icon: 'card'
  },
  {
    to: '/dashboard/notifications',
    label: 'Notifications',
    icon: 'bell'
  },
  {
    to: '/dashboard/settings',
    label: 'Settings',
    icon: 'settings'
  }
];

const adminNav = [
  {
    to: '/admin',
    label: 'Overview',
    icon: 'grid'
  },
  {
    to: '/admin/workspace',
    label: 'Workspace',
    icon: 'briefcase'
  },
  {
    to: '/admin/users',
    label: 'Users',
    icon: 'users'
  },

  // NEW: Lead assessment / qualification responses
  {
    to: '/admin/leads',
    label: 'Lead Assessments',
    icon: 'users'
  },

  {
    to: '/admin/orders',
    label: 'Orders',
    icon: 'orders'
  },
  {
    to: '/admin/projects',
    label: 'Projects',
    icon: 'folder'
  },
  {
    to: '/admin/services',
    label: 'Services',
    icon: 'layers'
  },
  {
    to: '/admin/showcase',
    label: 'Showcase',
    icon: 'file'
  },
  {
    to: '/admin/payments',
    label: 'Payments',
    icon: 'card'
  },
  {
    to: '/admin/messages',
    label: 'Messages',
    icon: 'message'
  },
  {
    to: '/admin/files',
    label: 'Files',
    icon: 'file'
  },
  {
    to: '/admin/reviews',
    label: 'Reviews',
    icon: 'star'
  },
  {
    to: '/admin/coupons',
    label: 'Coupons',
    icon: 'tag'
  },
  {
    to: '/admin/notifications',
    label: 'Notifications',
    icon: 'bell'
  },
  {
    to: '/admin/settings',
    label: 'Settings',
    icon: 'settings'
  }
];

/* =========================================================
   ICONS
========================================================= */

function Icon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true
  };

  switch (name) {
    case 'grid':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.2" />
          <rect x="14" y="3" width="7" height="7" rx="1.2" />
          <rect x="3" y="14" width="7" height="7" rx="1.2" />
          <rect x="14" y="14" width="7" height="7" rx="1.2" />
        </svg>
      );

    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.4" />
          <path d="M5 20c.8-3.5 3.1-5.2 7-5.2s6.2 1.7 7 5.2" />
        </svg>
      );

    case 'orders':
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );

    case 'message':
      return (
        <svg {...common}>
          <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.6 8.6 0 0 1-3.4-.7L4 20l1.7-4A7.1 7.1 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7Z" />
        </svg>
      );

    case 'file':
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v14H7z" />
          <path d="M14 3v5h4M10 13h5M10 17h5" />
        </svg>
      );

    case 'card':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18M7 15h4" />
        </svg>
      );

    case 'bell':
      return (
        <svg {...common}>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
          <path d="M10 21h4" />
        </svg>
      );

    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.8 1.8 0 0 0 .3 2l.1.1-1.8 1.8-.1-.1a1.8 1.8 0 0 0-2-.3 1.8 1.8 0 0 0-1.1 1.7V21h-2.6v-.8a1.8 1.8 0 0 0-1.1-1.7 1.8 1.8 0 0 0-2 .3l-.1.1-1.8-1.8.1-.1a1.8 1.8 0 0 0 .3-2 1.8 1.8 0 0 0-1.7-1.1H4v-2.6h.8a1.8 1.8 0 0 0 1.7-1.1 1.8 1.8 0 0 0-.3-2l-.1-.1 1.8-1.8.1.1a1.8 1.8 0 0 0 2 .3A1.8 1.8 0 0 0 11.1 5V4h2.6v1a1.8 1.8 0 0 0 1.1 1.6 1.8 1.8 0 0 0 2-.3l.1-.1 1.8 1.8-.1.1a1.8 1.8 0 0 0-.3 2 1.8 1.8 0 0 0 1.7 1.1h.8v2.6H20a1.8 1.8 0 0 0-1.6 1.2Z" />
        </svg>
      );

    case 'briefcase':
      return (
        <svg {...common}>
          <rect x="4" y="7" width="16" height="13" rx="2" />
          <path d="M9 7V5h6v2M4 12h16M10 12v2h4v-2" />
        </svg>
      );

    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="3" />
          <circle cx="17" cy="10" r="2.5" />
          <path d="M3.5 19c.7-3 2.5-4.5 5.5-4.5s4.8 1.5 5.5 4.5M14.5 15.2c.9-.8 1.9-1.2 3.2-1.2 1.9 0 3.2.9 3.8 2.7" />
        </svg>
      );

    case 'folder':
      return (
        <svg {...common}>
          <path d="M3 6h7l2 2h9v10H3z" />
        </svg>
      );

    case 'layers':
      return (
        <svg {...common}>
          <path d="m12 3 8 4-8 4-8-4 8-4Z" />
          <path d="m4 12 8 4 8-4M4 17l8 4 8-4" />
        </svg>
      );

    case 'star':
      return (
        <svg {...common}>
          <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
        </svg>
      );

    case 'tag':
      return (
        <svg {...common}>
          <path d="M4 5v6l9 9 6-6-9-9H4Z" />
          <circle cx="8" cy="9" r="1" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================================
   DASHBOARD SHELL
========================================================= */

export default function DashboardShell({
  children,
  admin = false,
  className = ''
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const staffAccess = useStaffAccess(location.pathname);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [storeSnapshot, setStoreSnapshot] = useState(() => load());
  const mobileMenuButtonRef = React.useRef(null);
  const sidebarRef = React.useRef(null);

  const [unreadCounts, setUnreadCounts] = useState({
    messages: 0,
    notifications: 0
  });

  const s = storeSnapshot;

  const items = admin
    ? adminNav
    : userNav;

  const firstLetter =
    s.user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U';

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const refreshStoreSnapshot = () => setStoreSnapshot(load());
    window.addEventListener('careerlyst-store', refreshStoreSnapshot);
    return () => window.removeEventListener('careerlyst-store', refreshStoreSnapshot);
  }, []);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 901px)');
    const closeOnDesktop = (event) => {
      if (event.matches) setMobileNavOpen(false);
    };

    desktopQuery.addEventListener('change', closeOnDesktop);
    return () => desktopQuery.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const getFocusableItems = () => Array.from(
      sidebarRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) || []
    ).filter((element) => element.getClientRects().length > 0);

    const firstNavLink = sidebarRef.current?.querySelector('.sidebar-nav a[href]');
    (firstNavLink || getFocusableItems()[0])?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileNavOpen(false);
        mobileMenuButtonRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableItems = getFocusableItems();
      if (!focusableItems.length) {
        event.preventDefault();
        return;
      }

      const firstItem = focusableItems[0];
      const lastItem = focusableItems[focusableItems.length - 1];

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  const closeMobileNav = (restoreFocus = false) => {
    setMobileNavOpen(false);
    if (restoreFocus) mobileMenuButtonRef.current?.focus();
  };

  const toggleMobileNav = () => {
    if (mobileNavOpen) {
      closeMobileNav(true);
    } else {
      setMobileNavOpen(true);
    }
  };

  useEffect(() => {
    let mounted = true;
    let notificationChannel = null;
    let unsubscribeMessageChannel = null;
    let unreadRefreshPromise = null;
    let refreshRequested = false;

    function loadUnreadCounts() {
      if (unreadRefreshPromise) {
        refreshRequested = true;
        return unreadRefreshPromise;
      }
      unreadRefreshPromise = refreshUnreadCounts().finally(() => {
        unreadRefreshPromise = null;
        if (refreshRequested && mounted) {
          refreshRequested = false;
          void loadUnreadCounts();
        }
      });
      return unreadRefreshPromise;
    }

    async function refreshUnreadCounts() {
      if (!supabase) {
        if (!mounted) return;

        const local = load();

        setUnreadCounts({
          messages: Array.isArray(local.messages)
            ? local.messages.filter((message) => !message.read).length
            : 0,
          notifications: Array.isArray(local.notifications)
            ? local.notifications.filter(
                (notification) => !notification.read && !notification.read_at
              ).length
            : 0
        });

        return;
      }

      try {
        const {
          data: sessionData,
          error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const user = sessionData?.session?.user;

        if (!user) {
          if (mounted) {
            setUnreadCounts({
              messages: 0,
              notifications: 0
            });
          }
          return;
        }

        // These badges are for the client sidebar.
        if (admin) {
          if (mounted) {
            setUnreadCounts({
              messages: 0,
              notifications: 0
            });
          }
          return;
        }

        // Register each realtime handler once, synchronously before the first
        // count-query await. Concurrent focus/visibility refreshes can then
        // never race into registering a callback on an already-subscribed channel.
        if (!notificationChannel) {
          notificationChannel = supabase
            .channel(`sidebar-notifications-${user.id}`)
            .on('postgres_changes', {
              event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}`
            }, () => { void loadUnreadCounts(); })
            .subscribe();
        }
        if (!location.pathname.startsWith('/dashboard/messages') && !unsubscribeMessageChannel) {
          unsubscribeMessageChannel = subscribeToClientMessages(user.id, {
            onMessage: () => { void loadUnreadCounts(); }
          });
        }

        const [
          notificationResult,
          ordersResult
        ] = await Promise.all([
          supabase
            .from('notifications')
            .select('id', {
              count: 'exact',
              head: true
            })
            .eq('user_id', user.id)
            .is('read_at', null),

          supabase
            .from('orders')
            .select('id')
            .eq('user_id', user.id)
        ]);

        if (notificationResult.error) {
          console.error(
            'Sidebar notification count error:',
            notificationResult.error
          );
        }

        if (ordersResult.error) {
          throw ordersResult.error;
        }

        const orderIds = (ordersResult.data || [])
          .map((order) => order.id)
          .filter(Boolean);

        let messageCount = 0;

        if (orderIds.length) {
          const { data: summaries, error: messageError } = await supabase.rpc(
            'list_message_summaries_v1',
            { p_order_ids: orderIds }
          );
          if (messageError) {
            console.error('Sidebar message count error:', messageError);
          } else {
            messageCount = (summaries || []).reduce(
              (count, summary) => count + Number(summary.unread_count || 0),
              0
            );
          }
        }

        if (!mounted) return;

        setUnreadCounts({
          messages: messageCount,
          notifications: notificationResult.count || 0
        });

      } catch (error) {
        console.error(
          'Sidebar unread count error:',
          error
        );
      }
    }

    loadUnreadCounts();

    const handleVisibilityRefresh = () => {
      if (document.visibilityState === 'visible') {
        loadUnreadCounts();
      }
    };

    const handleStoreChange = () => {
      if (!supabase) {
        loadUnreadCounts();
      }
    };

    window.addEventListener(
      'careerlyst-store',
      handleStoreChange
    );

    document.addEventListener(
      'visibilitychange',
      handleVisibilityRefresh
    );

    window.addEventListener(
      'focus',
      loadUnreadCounts
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        'careerlyst-store',
        handleStoreChange
      );

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityRefresh
      );

      window.removeEventListener(
        'focus',
        loadUnreadCounts
      );

      if (notificationChannel) {
        supabase.removeChannel(notificationChannel);
      }

      unsubscribeMessageChannel?.();
    };
  }, [admin, location.pathname]);

  const handleSignOut = async () => {
    setIsLoggingOut(true);

    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      logout();
      navigate('/');
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={`app-shell${admin ? '' : ' client-dashboard-shell'}${className ? ` ${className}` : ''}`}>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        ref={sidebarRef}
        id="dashboard-sidebar-navigation"
        className={`dashboard-sidebar ${mobileNavOpen ? 'is-open' : ''}`}
        role={mobileNavOpen ? 'dialog' : undefined}
        aria-modal={mobileNavOpen ? 'true' : undefined}
        aria-label={admin ? 'Admin navigation drawer' : 'Client navigation drawer'}
      >

        <button
          type="button"
          className="sidebar-close-button"
          onClick={() => closeMobileNav(true)}
          aria-label="Close navigation menu"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="sidebar-brand">
          <Logo />
        </div>

        <div className="sidebar-section-title">
          {admin ? 'CONTROL PANEL' : 'CLIENT AREA'}
        </div>

        <nav
          className="sidebar-nav"
          aria-label={admin ? 'Admin navigation' : 'Client dashboard navigation'}
        >

          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={
                item.to === '/dashboard' ||
                item.to === '/admin'
              }
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={() => closeMobileNav(true)}
            >
              <span className="sidebar-icon">
                <Icon name={item.icon} />
              </span>

              <span className="sidebar-link-label">
                {item.label}
              </span>

              {!admin && item.label === 'Messages' && unreadCounts.messages > 0 && (
                <span
                  className="sidebar-unread-badge"
                  aria-label={`${unreadCounts.messages} unread messages`}
                  style={{
                    marginLeft: 'auto',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    borderRadius: '999px',
                    background: 'var(--lime)',
                    color: 'var(--ink)',
                    fontSize: '9px',
                    lineHeight: 1,
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    flex: '0 0 auto'
                  }}
                >
                  {unreadCounts.messages > 99
                    ? '99+'
                    : unreadCounts.messages}
                </span>
              )}

              {!admin && item.label === 'Notifications' && unreadCounts.notifications > 0 && (
                <span
                  className="sidebar-unread-badge"
                  aria-label={`${unreadCounts.notifications} unread notifications`}
                  style={{
                    marginLeft: 'auto',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    borderRadius: '999px',
                    background: 'var(--lime)',
                    color: 'var(--ink)',
                    fontSize: '9px',
                    lineHeight: 1,
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    flex: '0 0 auto'
                  }}
                >
                  {unreadCounts.notifications > 99
                    ? '99+'
                    : unreadCounts.notifications}
                </span>
              )}
            </NavLink>
          ))}

        </nav>

        {/* ===================================================
            ACCOUNT
        =================================================== */}

        <div className="sidebar-bottom">

          <div className="sidebar-account">

            <div className="sidebar-avatar">
              <ProfileAvatar avatarId={s.profile?.avatar_id} className="sidebar-avatar-image" decorative initials={firstLetter} />
            </div>

            <div className="sidebar-account-copy">

              <strong>
                {s.user?.name || 'Client'}
              </strong>

              <span>
                {admin
                  ? 'Administrator'
                  : s.user?.email || 'Formant member'}
              </span>

            </div>

          </div>

          <button
            type="button"
            className="sidebar-signout"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            style={{
              opacity: isLoggingOut ? 0.6 : 1,
              cursor: isLoggingOut
                ? 'not-allowed'
                : 'pointer'
            }}
          >
            <span>
              {isLoggingOut
                ? 'Signing out...'
                : 'Sign out'}
            </span>

            {!isLoggingOut && (
              <span>↗</span>
            )}
          </button>

          {!admin && staffAccess.status === 'allowed' && (
            <Link
              to="/admin"
              className="sidebar-admin-link"
            >
              Admin workspace
              <span>↗</span>
            </Link>
          )}

        </div>

      </aside>

      {mobileNavOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation menu"
          onClick={() => closeMobileNav(true)}
        />
      )}

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="app-main">

        <div className="mobile-top">
          <Logo />
          <button
            ref={mobileMenuButtonRef}
            type="button"
            className={`mobile-menu-trigger ${mobileNavOpen ? 'is-open' : ''}`}
            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileNavOpen}
            aria-controls="dashboard-sidebar-navigation"
            onClick={toggleMobileNav}
          >
            <span className="mobile-menu-icon" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>

        <div className="app-main-content">
          {children}
        </div>

      </main>

    </div>
  );
}
