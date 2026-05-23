import { Home, Trophy, Plus, Archive, Users, LogOut, User } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '~/store/authStore';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '~/components/Sidebar/Sidebar';
import logoWhite from '~/assets/logo/logo-white.svg';
import styles from './AdminSidebar.module.less';

const mainNavItems = [
  { title: 'Dashboard', url: '/admin', icon: Home },
  { title: 'Create Pool', url: '/admin/create', icon: Plus },
  { title: 'Users', url: '/admin/users', icon: Users },
];

const poolNavItems = [
  { title: 'Active Pools', url: '/admin/pools/active', icon: Trophy },
  { title: 'Archived', url: '/admin/pools/archived', icon: Archive },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className={styles.sidebar}>
      <SidebarHeader className={styles.header}>
        <div className={styles.headerInner}>
          <img src={logoWhite} alt="Survivor Pool" className={styles.logoImage} />
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Tournament</h1>
            <p className={styles.subtitle}>Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                  >
                    <NavLink to={item.url}>
                      <item.icon className={styles.navIcon} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Pools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {poolNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                  >
                    <NavLink to={item.url}>
                      <item.icon className={styles.navIcon} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={styles.footer}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/">
                <User className={styles.navIcon} />
                <span>User view</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className={styles.navIcon} />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
