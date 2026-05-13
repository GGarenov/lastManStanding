import { ReactNode } from 'react';
import { AdminSidebar } from '~/components/AdminSidebar/AdminSidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '~/components/Sidebar/Sidebar';
import styles from './AdminLayout.module.less';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className={styles.wrapper}>
        <AdminSidebar />
        <SidebarInset className={styles.inset}>
          <header className={styles.header}>
            <SidebarTrigger className={styles.trigger} />
            <h1 className={styles.heading}>This is the admin panel for CRUD operations</h1>
          </header>
          <main className={styles.main}>
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
