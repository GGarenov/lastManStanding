import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "~/i18n";
import { DocumentLangSync } from "~/i18n/DocumentLangSync";
import { LegacyLocaleRedirect } from "~/i18n/LegacyLocaleRedirect";
import { LocaleOutlet } from "~/i18n/LocaleOutlet";
import { Sonner } from "~/components/Sonner/Sonner";
import { TooltipProvider } from "~/components/Tooltip/Tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { useAuthStore } from "~/store";
import { AdminGuard } from "~/components/AdminGuard";
import { UserLayout } from "~/components/UserLayout/UserLayout";
import Dashboard from "~/pages/admin-pages/Dashboard/Dashboard";
import CreatePool from "~/pages/admin-pages/CreatePool/CreatePool";
import PoolManagement from "~/pages/admin-pages/PoolManagement/PoolManagement";
import ActivePools from "~/pages/admin-pages/ActivePools/ActivePools";
import ArchivedPools from "~/pages/admin-pages/ArchivedPools/ArchivedPools";
import UsersManagement from "~/pages/admin-pages/UsersManagement/UsersManagement";
import Home from "~/pages/Home/Home";
import Login from "~/pages/user-pages/Login/Login";
import Register from "~/pages/user-pages/Register/Register";
import MyPool from "~/pages/user-pages/MyPool/MyPool";
import Leaderboard from "~/pages/user-pages/Leaderboard/Leaderboard";
import Stats from "~/pages/user-pages/Stats/Stats";
import Rules from "~/pages/user-pages/Rules/Rules";
import Profile from "~/pages/user-pages/Profile/Profile";
import NotFound from "~/pages/user-pages/NotFound/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const loadMe = useAuthStore((s) => s.loadMe);
  useEffect(() => {
    loadMe();
  }, [loadMe]);

  return (
    <Routes>
      {/* Admin — no locale prefix (Phase 0.2) */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <Dashboard />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/create"
        element={
          <AdminGuard>
            <CreatePool />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/pool/:poolId"
        element={
          <AdminGuard>
            <PoolManagement />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/pools/active"
        element={
          <AdminGuard>
            <ActivePools />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/pools/archived"
        element={
          <AdminGuard>
            <ArchivedPools />
          </AdminGuard>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminGuard>
            <UsersManagement />
          </AdminGuard>
        }
      />

      {/* Default `/` → English */}
      <Route path="/" element={<Navigate to="/en" replace />} />

      {/* Legacy user URLs without locale → `/en/...` */}
      <Route path="/login" element={<LegacyLocaleRedirect />} />
      <Route path="/register" element={<LegacyLocaleRedirect />} />
      <Route path="/my-pool" element={<LegacyLocaleRedirect />} />
      <Route path="/rules" element={<LegacyLocaleRedirect />} />
      <Route path="/profile" element={<LegacyLocaleRedirect />} />
      <Route path="/leaderboard" element={<LegacyLocaleRedirect />} />
      <Route path="/leaderboard/:poolId" element={<LegacyLocaleRedirect />} />
      <Route path="/stats" element={<LegacyLocaleRedirect />} />
      <Route path="/stats/:poolId" element={<LegacyLocaleRedirect />} />

      {/* User routes: `/en/...` | `/bg/...` */}
      <Route path="/:locale" element={<LocaleOutlet />}>
        <Route element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="my-pool" element={<MyPool />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="leaderboard/:poolId" element={<Leaderboard />} />
          <Route path="stats" element={<Stats />} />
          <Route path="stats/:poolId" element={<Stats />} />
          <Route path="rules" element={<Rules />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <I18nextProvider i18n={i18n}>
    <DocumentLangSync />
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </I18nextProvider>
);

export default App;
