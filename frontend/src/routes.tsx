import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import UsersPage from "./pages/users";
import ExplorerPage from "./pages/explorer";
import { useAuth } from "./features/auth";
import { PrimaryLayout } from "./layout";
import { UsersProvider } from "./features/users/users-context";
import { PokemonsProvider } from "./features/pokemon/pokemon-context";
import { WeatherProvider } from "./features/weather/weather-context";

type GuardProps = {
  children: React.ReactNode;
};

const RequireAuth: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RequireAdmin: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <PrimaryLayout>
                <WeatherProvider>
                  <DashboardPage />
                </WeatherProvider>
              </PrimaryLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/users"
          element={
            <RequireAdmin>
              <PrimaryLayout>
                <UsersProvider>
                  <UsersPage />
                </UsersProvider>
              </PrimaryLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="/explore"
          element={
            <RequireAuth>
              <PrimaryLayout>
                <PokemonsProvider>
                  <ExplorerPage />
                </PokemonsProvider>
              </PrimaryLayout>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
