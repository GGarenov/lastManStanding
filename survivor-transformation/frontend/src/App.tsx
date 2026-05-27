import { useEffect } from "react";
import { Sonner } from "~/components/Sonner/Sonner";
import { TooltipProvider } from "~/components/Tooltip/Tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "~/lib/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "~/store";
import { AdminGuard } from "~/components/AdminGuard";
import { UserLayout } from "~/components/UserLayout/UserLayout";
import Dashboard from "~/pages/admin-pages/Dashboard/Dashboard";
import CreatePool from "~/pages/admin-pages/CreatePool/CreatePool";
import PoolManagement from "~/pages/admin-pages/PoolManagement/PoolManagement";
import ActivePools from "~/pages/admin-pages/ActivePools/ActivePools";
import ArchivedPools from "~/pages/admin-pages/ArchivedPools/ArchivedPools";
import UsersManagement from "~/pages/admin-pages/UsersManagement/UsersManagement";
import HouseEarnings from "~/pages/admin-pages/HouseEarnings/HouseEarnings";
import Home from "~/pages/Home/Home";
import Login from "~/pages/user-pages/Login/Login";
import Register from "~/pages/user-pages/Register/Register";
import MyPool from "~/pages/user-pages/MyPool/MyPool";
import Leaderboard from "~/pages/user-pages/Leaderboard/Leaderboard";
import Stats from "~/pages/user-pages/Stats/Stats";
import Rules from "~/pages/user-pages/Rules/Rules";
import Profile from "~/pages/user-pages/Profile/Profile";
import NotFound from "~/pages/user-pages/NotFound/NotFound";

function AppRoutes() {
  const loadMe = useAuthStore((s) => s.loadMe);
  useEffect(() => {
    loadMe();
  }, [loadMe]);

  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="my-pool" element={<MyPool />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="leaderboard/:poolId" element={<Leaderboard />} />
        <Route path="stats" element={<Stats />} />
        <Route path="stats/:poolId" element={<Stats />} />
        <Route path="rules" element={<Rules />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
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
      <Route
        path="/admin/house-earnings"
        element={
          <AdminGuard>
            <HouseEarnings />
          </AdminGuard>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
