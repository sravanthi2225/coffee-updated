import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Ticket, 
  Coffee, 
  DollarSign, 
  Plus, 
  RefreshCw, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { staffUser, isStaffAuthenticated, staffLogin } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [reports, setReports] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // New Voucher Campaign State
  const [vCode, setVCode] = useState('');
  const [vTitle, setVTitle] = useState('');
  const [vType, setVType] = useState('PERCENTAGE');
  const [vValue, setVValue] = useState(25);
  const [vMinSpend, setVMinSpend] = useState(200);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminReports();
      if (res.success) {
        setReports(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isStaffAuthenticated && staffUser?.role === 'ADMIN') {
      fetchReports();
    }
  }, [isStaffAuthenticated, staffUser?.role]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await staffLogin(username, password);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator credentials');
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createVoucher({
        code: vCode.toUpperCase(),
        title: vTitle,
        discountType: vType,
        discountValue: Number(vValue),
        minSpend: Number(vMinSpend)
      });
      alert('Voucher campaign launched!');
      setVCode('');
      setVTitle('');
      fetchReports();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isStaffAuthenticated || staffUser?.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto py-24 px-4">
        <div className="bg-[#2A2723] text-[#FBF4E9] p-8 rounded-3xl border border-[#C5A880]/30 shadow-2xl">
          <div className="flex items-center gap-2 mb-2 text-[#C5A880]">
            <ShieldAlert className="w-6 h-6" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest">Admin Console</span>
          </div>
          <h2 className="font-serif text-2xl font-bold mb-1">Executive Portal</h2>
          <p className="text-xs text-[#FBF4E9]/70 mb-6">Financial reporting, sales analytics, and catalog governance.</p>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-xs text-red-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#FBF4E9]/80 uppercase mb-1">Admin Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1A17] border border-white/10 text-xs text-[#FBF4E9] focus:outline-none focus:border-[#C5A880]"
              />
              <span className="text-[10px] text-[#FBF4E9]/40 mt-1 block">Default: admin / admin123</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#FBF4E9]/80 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1A17] border border-white/10 text-xs text-[#FBF4E9] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl bg-[#C5A880] text-[#1C1A17] font-semibold text-xs uppercase tracking-wider hover:bg-[#B3956F] transition-all"
            >
              Sign In to Admin Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2A2723]/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
            Governance & Intelligence
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#2A2723]">Admin Operations Console</h1>
        </div>
        <button
          onClick={fetchReports}
          className="py-2.5 px-4 rounded-xl bg-[#2A2723] text-[#FBF4E9] text-xs font-semibold flex items-center gap-2 hover:bg-[#3D3833]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-[#2A2723]/10 shadow-sm">
          <div className="flex items-center justify-between text-[#8C6D46] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Coffee Revenue</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#2A2723]">
            ₹{reports?.totals?.total_revenue?.toLocaleString() || 0}
          </h2>
          <span className="text-xs text-[#2A2723]/60 mt-1 block">
            Across {reports?.totals?.total_orders || 0} collected orders
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#2A2723]/10 shadow-sm">
          <div className="flex items-center justify-between text-[#8C6D46] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <Coffee className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#2A2723]">
            {reports?.totals?.total_orders || 0}
          </h2>
          <span className="text-xs text-[#2A2723]/60 mt-1 block">Live Luckin order-ahead throughput</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#2A2723]/10 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Voucher Subsidies</span>
            <Ticket className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#2A2723]">
            ₹{reports?.totals?.total_discounts_given?.toLocaleString() || 0}
          </h2>
          <span className="text-xs text-[#2A2723]/60 mt-1 block">Customer acquisition incentives</span>
        </div>
      </div>

      {/* Analytics Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Sold Items */}
        <div className="bg-white p-6 rounded-3xl border border-[#2A2723]/10 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#2A2723] mb-4">Top Performing Menu Items</h3>
          <div className="divide-y divide-[#2A2723]/10">
            {reports?.topItems?.map((item: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-sm text-[#2A2723]">{item.item_name}</span>
                  <span className="block text-[#2A2723]/60">{item.units_sold} cups crafted</span>
                </div>
                <span className="font-serif font-bold text-sm text-[#2A2723]">₹{item.gross_sales}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Voucher ROI Tracker */}
        <div className="bg-white p-6 rounded-3xl border border-[#2A2723]/10 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#2A2723] mb-4">Voucher Campaign Performance</h3>
          <div className="divide-y divide-[#2A2723]/10">
            {reports?.voucherStats?.map((v: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-[#8C6D46]">{v.code}</span>
                  <span className="block text-[#2A2723]/70">{v.title}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {v.redeemed_count} Redemptions
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create New Voucher Tool */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#2A2723]/10 shadow-sm">
        <h3 className="font-serif text-xl font-bold text-[#2A2723] mb-2">Launch New Promotional Voucher</h3>
        <p className="text-xs text-[#2A2723]/60 mb-6">Create time-bounded discounts and first-order hooks.</p>

        <form onSubmit={handleCreateVoucher} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-[#2A2723]/70 mb-1">Code</label>
            <input
              type="text"
              required
              placeholder="e.g. WEEKEND30"
              value={vCode}
              onChange={e => setVCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-xl border border-[#2A2723]/20 text-xs font-mono font-bold uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#2A2723]/70 mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Weekend Delight 30% Off"
              value={vTitle}
              onChange={e => setVTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#2A2723]/20 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#2A2723]/70 mb-1">Discount Type</label>
            <select
              value={vType}
              onChange={e => setVType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#2A2723]/20 text-xs bg-white"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FLAT">Flat Cash (₹)</option>
              <option value="FREE_ITEM">Free Drink Item</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#2A2723]/70 mb-1">Value / %</label>
            <input
              type="number"
              required
              value={vValue}
              onChange={e => setVValue(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-[#2A2723]/20 text-xs"
            />
          </div>

          <div className="sm:col-span-2 md:col-span-4 flex justify-end">
            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-[#2A2723] text-[#FBF4E9] text-xs font-semibold hover:bg-[#3D3833] flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#C5A880]" />
              <span>Publish Campaign Voucher</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
