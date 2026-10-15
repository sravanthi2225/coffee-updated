import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Ticket, 
  Share2, 
  Award, 
  Clock, 
  ShoppingBag, 
  LogOut, 
  Copy, 
  Check, 
  ChevronRight,
  Sparkles,
  FileText,
  Calendar,
  MapPin,
  Users,
  Repeat,
  Bell,
  Home,
  Briefcase,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import { PRODUCTS } from '../data/products';

export const Account: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal, logout, deleteAccount } = useAuth();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'VOUCHERS' | 'BOOKINGS' | 'ORDERS' | 'REFERRALS' | 'SETTINGS'>('VOUCHERS');
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [referralsData, setReferralsData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reorderMessage, setReorderMessage] = useState<string | null>(null);

  // Saved Addresses State (Local persisted)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([
    { id: 'addr_1', label: 'Home', street: '42 Orchid Grove, Indiranagar', city: 'Bengaluru', isDefault: true },
    { id: 'addr_2', label: 'Work', street: 'Level 4, WeWork Galaxy, Residency Rd', city: 'Bengaluru', isDefault: false }
  ]);

  // Notifications State
  const [notifications, setNotifications] = useState({
    smsOrderUpdates: true,
    promoDiscounts: true,
    roasteryDrops: false
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    api.getVouchers().then(res => {
      if (res.success) setVouchers(res.vouchers || []);
    }).catch(console.error);

    api.getReferrals().then(res => {
      if (res.success) setReferralsData(res);
    }).catch(console.error);

    api.getOrderHistory().then(res => {
      if (res.success) setOrders(res.orders || []);
    }).catch(console.error);

    fetchBookings();
  }, [isAuthenticated]);

  const fetchBookings = () => {
    setIsLoadingBookings(true);
    api.getBookings()
      .then(res => {
        if (res.success) setBookings(res.bookings || []);
      })
      .catch(console.error)
      .finally(() => setIsLoadingBookings(false));
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this table reservation?')) return;
    try {
      const res = await api.cancelBooking(bookingId);
      if (res.success) {
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel reservation');
    }
  };

  const handleOneTapReorder = async (order: any) => {
    try {
      let itemsAdded = 0;
      if (order.items && order.items.length > 0) {
        for (const ordItem of order.items) {
          // Find matching product in catalog
          const product = PRODUCTS.find(p => p.id === ordItem.item_id || p.name.toLowerCase() === ordItem.item_name.toLowerCase()) || PRODUCTS[0];
          addToCart(product, undefined, ordItem.quantity || 1);
          itemsAdded++;
        }
      }

      setReorderMessage(`Reordered ${itemsAdded} item(s) from Order #${order.order_number}! Redirecting to Bag...`);
      setTimeout(() => {
        navigate('/cart');
      }, 1200);
    } catch (err: any) {
      setReorderMessage('Failed to add items to cart.');
    }
  };

  const handleCopyLink = () => {
    if (referralsData?.shareUrl) {
      navigator.clipboard.writeText(referralsData.shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action is permanent.')) {
      await api.deleteAccount();
      await logout();
      navigate('/');
    }
  };

  // Tier progress
  const points = user?.loyalty_points || 0;
  const nextTierPoints = user?.membership_tier === 'BLUE' ? 300 : (user?.membership_tier === 'SILVER' ? 1000 : 2500);
  const progressPercent = Math.min(100, Math.floor((points / nextTierPoints) * 100));

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      
      {/* Toast Notification */}
      {reorderMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-[#8C6D46] text-[#FBF4E9] text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#FBF4E9]" />
            <span>{reorderMessage}</span>
          </div>
          <Link to="/cart" className="underline font-mono">View Bag &rarr;</Link>
        </div>
      )}

      {/* Member Profile Header */}
      <div className="bg-[#2A2723] text-[#FBF4E9] rounded-3xl p-6 sm:p-8 mb-8 border border-[#C5A880]/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center font-serif text-2xl font-bold text-[#C5A880]">
              {user?.name?.charAt(0) || 'B'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold">{user?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C5A880] text-[#1C1A17]">
                  {user?.membership_tier} Tier
                </span>
              </div>
              <p className="text-xs text-[#FBF4E9]/70 mt-0.5">{user?.phone || user?.email}</p>
            </div>
          </div>

          {/* Points Balance Pill */}
          <div className="bg-[#1C1A17] p-4 rounded-2xl border border-white/10 text-left sm:text-right min-w-[180px]">
            <span className="text-[10px] text-[#C5A880] uppercase tracking-wider font-semibold">
              Artisan Points
            </span>
            <div className="font-serif text-2xl font-bold text-[#FBF4E9]">{points} pts</div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#C5A880] h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-[10px] text-[#FBF4E9]/50 block mt-1">
              {nextTierPoints - points > 0 ? `${nextTierPoints - points} pts to next tier` : 'Top VIP Tier Achieved'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#2A2723]/10 mb-6 gap-2 sm:gap-4 overflow-x-auto pb-1">
        {[
          { id: 'VOUCHERS', label: `Vouchers (${vouchers.filter(v => v.status === 'ACTIVE').length})`, icon: Ticket },
          { id: 'BOOKINGS', label: `Table Bookings (${bookings.filter(b => b.status === 'CONFIRMED').length})`, icon: Calendar },
          { id: 'ORDERS', label: `Past Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'REFERRALS', label: 'Give 50%, Get 50%', icon: Share2 },
          { id: 'SETTINGS', label: 'Addresses & Settings', icon: UserIcon }
        ].map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`pb-3 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === t.id
                ? 'border-[#8C6D46] text-[#8C6D46]'
                : 'border-transparent text-[#2A2723]/60 hover:text-[#2A2723]'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: Voucher Wallet ── */}
      {activeTab === 'VOUCHERS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vouchers.map(v => {
              const isActive = v.status === 'ACTIVE';
              return (
                <div
                  key={v.user_voucher_id}
                  className={`p-5 rounded-3xl border transition-all relative overflow-hidden ${
                    isActive
                      ? 'bg-white border-[#8C6D46]/30 shadow-sm'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-[#8C6D46]/10 text-[#8C6D46]">
                          {v.code}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-emerald-700' : 'text-gray-500'}`}>
                          {v.status}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-[#2A2723]">{v.title}</h4>
                      <p className="text-xs text-[#2A2723]/60 mt-1">{v.description}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-serif font-bold text-lg text-[#2A2723]">
                        {v.discount_type === 'PERCENTAGE' ? `${v.discount_value}%` : `₹${v.discount_value}`}
                      </span>
                      <span className="block text-[10px] text-[#2A2723]/50">DISCOUNT</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2A2723]/10 flex items-center justify-between text-[11px] text-[#2A2723]/60">
                    <span>Valid until {new Date(v.valid_until).toLocaleDateString()}</span>
                    {isActive && (
                      <Link to="/menu" className="text-[#8C6D46] font-semibold hover:underline">
                        Use in Order &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: Table & Tasting Lounge Bookings ── */}
      {activeTab === 'BOOKINGS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2B1B14]">Your Lounge Reservations</h3>
              <p className="text-xs text-[#5A3B2E]/70">Table seatings and barista tasting room bookings</p>
            </div>
            <Link
              to="/book-table"
              className="py-2.5 px-4 rounded-xl bg-[#2B1B14] hover:bg-[#3D281D] text-[#FBF4E9] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Reserve New Table</span>
            </Link>
          </div>

          {isLoadingBookings ? (
            <div className="py-12 text-center text-xs text-[#5A3B2E]/60">Loading reservations...</div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-[#2B1B14]/10 p-6 space-y-3">
              <Calendar className="w-10 h-10 text-[#8C6D46]/40 mx-auto" />
              <h4 className="font-serif text-lg font-bold text-[#2B1B14]">No Table Bookings Yet</h4>
              <p className="text-xs text-[#5A3B2E]/70 max-w-sm mx-auto">
                Reserve a quiet alcove, window seat, or barista tasting counter slot for your next coffee conversation.
              </p>
              <Link
                to="/book-table"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8C6D46] text-[#FBF4E9] text-xs font-bold uppercase tracking-wider"
              >
                <span>Book a Table Slot</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => {
                const isConfirmed = b.status === 'CONFIRMED';
                return (
                  <div
                    key={b.id}
                    className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isConfirmed ? 'bg-white border-[#8C6D46]/30 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs text-[#8C6D46]">
                          {b.booking_reference}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-[#2B1B14]">{b.store_name}</h4>
                      <p className="text-xs text-[#5A3B2E]/70 mt-0.5">
                        {b.booking_date} at <strong>{b.start_time}</strong> • {b.party_size} Guests ({b.table_type})
                      </p>
                      {b.preorder_items && b.preorder_items.length > 0 && (
                        <p className="text-[11px] text-[#8C6D46] mt-1 font-medium">
                          Pre-ordered: {b.preorder_items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {isConfirmed && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b.id)}
                          className="py-2 px-3.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-all cursor-pointer"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: Past Orders with One-Tap Reorder ── */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-center py-12 text-xs text-[#2A2723]/60">You have not placed any orders yet.</p>
          ) : (
            orders.map(o => (
              <div key={o.id} className="p-5 rounded-3xl bg-white border border-[#2A2723]/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-xs text-[#8C6D46]">#{o.order_number}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8C6D46]/10 text-[#8C6D46]">
                      {o.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-[#2A2723]">{o.store_name}</h4>
                  <p className="text-xs text-[#2A2723]/60 mt-0.5">
                    {new Date(o.created_at).toLocaleDateString()} at {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {o.items && o.items.length > 0 && (
                    <p className="text-[11px] text-[#2A2723]/70 mt-1 line-clamp-1">
                      {o.items.map((i: any) => `${i.quantity}x ${i.item_name}`).join(', ')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="text-right sm:pr-3 sm:border-r border-[#2A2723]/10">
                    <span className="font-serif font-bold text-base text-[#2A2723]">₹{o.total_amount}</span>
                    <span className="block text-[10px] text-[#2A2723]/50">{o.fulfilment_mode}</span>
                  </div>

                  {/* One-Tap Reorder Button */}
                  <button
                    type="button"
                    onClick={() => handleOneTapReorder(o)}
                    className="py-2 px-3.5 rounded-xl bg-[#8C6D46] hover:bg-[#725735] text-[#FBF4E9] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Reorder</span>
                  </button>

                  <Link
                    to={`/order/${o.id}/track`}
                    className="py-2 px-3 rounded-xl bg-[#2A2723] text-[#FBF4E9] text-xs font-medium hover:bg-[#3D3833]"
                  >
                    Track
                  </Link>

                  <Link
                    to={`/order/${o.id}/invoice`}
                    className="p-2 rounded-xl border border-[#2A2723]/15 text-[#2A2723] hover:bg-gray-50"
                    title="Invoice"
                  >
                    <FileText className="w-4 h-4 text-[#8C6D46]" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 4: Referrals (Give & Get 50%) ── */}
      {activeTab === 'REFERRALS' && (
        <div className="space-y-6">
          <div className="bg-[#2A2723] text-[#FBF4E9] p-6 sm:p-8 rounded-3xl border border-[#C5A880]/30 shadow-lg text-center relative overflow-hidden">
            <Sparkles className="w-10 h-10 text-[#C5A880] mx-auto mb-3" />
            <h3 className="font-serif text-2xl font-bold mb-2">Double the Fun: Give 50%, Get 50%</h3>
            <p className="text-xs text-[#FBF4E9]/70 max-w-md mx-auto mb-6">
              Invite a coffee enthusiast. When they order their first cup using your code, you both unlock a 50% Off reward pass!
            </p>

            <div className="max-w-md mx-auto flex items-center bg-[#1C1A17] p-2 rounded-2xl border border-white/10 gap-2">
              <span className="font-mono font-bold text-sm text-[#C5A880] pl-3 flex-grow text-left">
                {referralsData?.referralCode || user?.referral_code}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-4 rounded-xl bg-[#C5A880] text-[#1C1A17] text-xs font-semibold hover:bg-[#B3956F] transition-all flex items-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied Link!' : 'Copy Share Link'}</span>
              </button>
            </div>
          </div>

          {/* Invited Friends List */}
          <div className="bg-white p-6 rounded-3xl border border-[#2A2723]/10">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#2A2723]/70 mb-4">
              Your Referral Ledger ({referralsData?.referrals?.length || 0})
            </h4>

            {referralsData?.referrals && referralsData.referrals.length > 0 ? (
              <div className="divide-y divide-[#2A2723]/10">
                {referralsData.referrals.map((r: any) => (
                  <div key={r.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-[#2A2723]">{r.referee_name}</span>
                      <span className="block text-[11px] text-[#2A2723]/50">
                        Joined on {new Date(r.referee_joined_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-xs text-[#2A2723]/50">
                No referrals yet. Share your link to start earning rewards!
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 5: Saved Addresses & Settings ── */}
      {activeTab === 'SETTINGS' && (
        <div className="space-y-6">
          
          {/* Saved Addresses Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2A2723]/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2723]/10">
              <div>
                <h4 className="font-semibold text-sm text-[#2B1B14]">Saved Addresses</h4>
                <p className="text-xs text-[#2A2723]/60">Quick addresses for artisanal office &amp; home deliveries.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedAddresses.map(addr => (
                <div key={addr.id} className="p-4 rounded-2xl bg-[#FAF4EB] border border-[#EADFCF] flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white border border-[#2B1B14]/10 text-[#8C6D46] shrink-0">
                    {addr.label === 'Home' ? <Home className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#2B1B14]">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5A3B2E]/80 mt-1">{addr.street}</p>
                    <span className="text-[11px] text-[#5A3B2E]/60">{addr.city}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications Preferences */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2A2723]/10 space-y-4">
            <h4 className="font-semibold text-sm text-[#2B1B14] pb-2 border-b border-[#2A2723]/10">
              Notification &amp; SMS Preferences
            </h4>

            <div className="space-y-3">
              {[
                { key: 'smsOrderUpdates', label: 'Order Status & Pickup Ready SMS', desc: 'Real-time SMS alerts when your drink is placed in smart pickup shelf' },
                { key: 'promoDiscounts', label: 'Artisan Vouchers & Birthday Pass', desc: 'Alerts when seasonal 50% discount codes or rewards are credited' },
                { key: 'roasteryDrops', label: 'Single-Origin Micro-Lot Drops', desc: 'Early invitations to limited pour-over bean releases' }
              ].map(pref => (
                <label key={pref.key} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(notifications as any)[pref.key]}
                    onChange={(e) => setNotifications(prev => ({ ...prev, [pref.key]: e.target.checked }))}
                    className="mt-1 rounded text-[#8C6D46] focus:ring-[#8C6D46]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#2B1B14] block">{pref.label}</span>
                    <span className="text-[11px] text-[#2A2723]/60">{pref.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Session & Sign Out */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2A2723]/10 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A2723]/10">
              <div>
                <h4 className="font-semibold text-sm text-[#2B1B14]">Session &amp; Sign Out</h4>
                <p className="text-xs text-[#2A2723]/60">Securely sign out of your account on this device.</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="py-2.5 px-5 rounded-xl border border-[#2B1B14]/20 hover:bg-gray-50 text-xs font-semibold text-[#2B1B14] flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <h4 className="font-semibold text-sm text-red-600">Delete Account</h4>
                <p className="text-xs text-[#2A2723]/60">Permanently delete your profile and unlink active vouchers.</p>
              </div>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="py-2.5 px-5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-xs font-semibold cursor-pointer"
              >
                Delete My Account
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
