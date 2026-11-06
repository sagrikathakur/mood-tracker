import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, ShieldAlert, ArrowLeft } from "lucide-react";

export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FCFAF7] text-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-[#64DC4C] mb-3" />
        <p className="text-sm font-bold font-mono text-slate-600">Verifying administrative access...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin =
    user?.role === "admin" ||
    user?.email === "sagrikathakur68@gmail.com";

  if (!isAdmin) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FCFAF7] text-slate-900 p-6 select-none">
        <div className="max-w-md w-full bg-white border-3 border-[#0a1b10] rounded-3xl p-8 shadow-[6px_6px_0px_#0a1b10] text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 border-2 border-rose-500 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black font-display text-slate-900">
              Admin Access Required
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              This dashboard is restricted to Calm Me administrators. Your current account (<strong className="font-mono text-slate-800">{user?.email}</strong>) does not have administrator privileges.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/tracker"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#64DC4C] hover:bg-[#52c83b] text-[#0a1b10] text-xs font-black shadow-[3px_3px_0px_#0a1b10] transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sanctuary</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;

