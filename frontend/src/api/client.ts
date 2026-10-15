// API Client for Brew & Bloom Backend

const BASE_URL = '';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  // Check if session token exists in localStorage for fallback
  const token = localStorage.getItem('bb_session_token');
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include' // include httpOnly cookies
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: { identifier: string; password: string }) =>
    request<{ success: boolean; token: string; user: any; message?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  signup: (data: { name: string; email: string; password: string; phone?: string; referralCode?: string }) =>
    request<{ success: boolean; token: string; user: any; newVoucherAssigned: boolean; message?: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  forgotPassword: (identifier: string) =>
    request<{ success: boolean; message: string; devResetCode?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier })
    }),

  resetPassword: (data: { identifier: string; resetCode: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  sendOtp: (phone: string, isDemo?: boolean) => 
    request<{ success: boolean; message: string; devOtp?: string }>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, isDemo })
    }),

  verifyOtp: (phone: string, otp: string) =>
    request<{ success: boolean; isNewUser: boolean; token?: string; user?: any }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp })
    }),

  register: (data: { phone: string; name: string; email?: string; referralCode?: string }) =>
    request<{ success: boolean; user: any; token: string; newVoucherAssigned: boolean }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMe: () => request<{ success: boolean; user: any }>('/api/auth/me'),

  logout: () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),

  deleteAccount: () => request<{ success: boolean }>('/api/auth/me', { method: 'DELETE' }),

  staffLogin: (credentials: { username: string; password: string }) =>
    request<{ success: boolean; token: string; staff: any }>('/api/auth/staff-login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  // Stores & Slots
  getStores: (coords?: { latitude: number; longitude: number }) => {
    const q = coords ? `?lat=${coords.latitude}&lng=${coords.longitude}` : '';
    return request<{ success: boolean; stores: any[] }>(`/api/stores${q}`);
  },

  getStoreSlots: (storeId: string, date?: string) => {
    const q = date ? `?date=${date}` : '';
    return request<{ success: boolean; date: string; slots: any[] }>(`/api/stores/${storeId}/slots${q}`);
  },

  // Menu
  getMenu: (storeId?: string) => {
    const q = storeId ? `?storeId=${storeId}` : '';
    return request<{ success: boolean; menu: any[] }>(`/api/menu${q}`);
  },

  getItemDetails: (itemId: string, storeId?: string) => {
    const q = storeId ? `?storeId=${storeId}` : '';
    return request<{ success: boolean; item: any }>(`/api/menu/items/${itemId}${q}`);
  },

  // Cart
  getCart: () => request<{ success: boolean; cart: any }>('/api/cart'),

  syncCart: (storeId: string | null, items: any[]) =>
    request<{ success: boolean }>('/api/cart', {
      method: 'PUT',
      body: JSON.stringify({ storeId, items })
    }),

  clearCart: () => request<{ success: boolean }>('/api/cart', { method: 'DELETE' }),

  // Orders
  previewOrder: (payload: {
    storeId: string;
    fulfilmentMode: string;
    slotId?: string;
    items: any[];
    voucherCode?: string;
  }) =>
    request<{ success: boolean; preview: any }>('/api/orders/preview', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  createOrder: (payload: {
    storeId: string;
    fulfilmentMode: string;
    slotId?: string;
    pickupType?: string;
    items: any[];
    voucherCode?: string;
    deliveryAddress?: any;
    idempotencyKey?: string;
  }) =>
    request<{
      success: boolean;
      order: any;
      preview: any;
      paymentIntent: any;
      isDuplicate: boolean;
    }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getOrder: (orderId: string) =>
    request<{ success: boolean; order: any }>(`/api/orders/${orderId}`),

  cancelOrder: (orderId: string, reason?: string) =>
    request<{ success: boolean; order: any }>(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  getInvoice: (orderId: string) =>
    request<{ success: boolean; invoice: any }>(`/api/orders/${orderId}/invoice`),

  // Payments
  mockCompletePayment: (payload: { orderId: string; paymentId: string; transactionId?: string }) =>
    request<{ success: boolean; order: any }>('/api/payments/mock-complete', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  mockFailPayment: (orderId: string, reason?: string) =>
    request<{ success: boolean }>('/api/payments/mock-fail', {
      method: 'POST',
      body: JSON.stringify({ orderId, reason })
    }),

  // Account
  getVouchers: () => request<{ success: boolean; vouchers: any[] }>('/api/account/vouchers'),

  getReferrals: () =>
    request<{
      success: boolean;
      referralCode: string;
      shareUrl: string;
      loyaltyPoints: number;
      membershipTier: string;
      referrals: any[];
    }>('/api/account/referrals'),

  getOrderHistory: () => request<{ success: boolean; orders: any[] }>('/api/account/orders'),

  reorder: (orderId: string) =>
    request<{ success: boolean; storeId: string; fulfilmentMode: string; items: any[] }>(
      `/api/account/reorder/${orderId}`,
      { method: 'POST' }
    ),

  // Table & Slot Pre-Booking
  createBooking: (payload: {
    storeId: string;
    slotId?: string;
    bookingDate: string;
    startTime: string;
    partySize: number;
    tableType?: string;
    specialNotes?: string;
    preorderItems?: any[];
  }) =>
    request<{ success: boolean; booking: any; message: string }>('/api/account/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getBookings: () => request<{ success: boolean; bookings: any[] }>('/api/account/bookings'),

  cancelBooking: (bookingId: string) =>
    request<{ success: boolean; message: string }>(`/api/account/bookings/${bookingId}/cancel`, {
      method: 'POST'
    }),

  // Barista Staff
  getBaristaQueue: (storeId?: string) => {
    const q = storeId ? `?storeId=${storeId}` : '';
    return request<{ success: boolean; queue: any[] }>(`/api/barista/queue${q}`);
  },

  updateBaristaOrderStatus: (orderId: string, status: string) =>
    request<{ success: boolean; order: any }>(`/api/barista/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  collectBaristaOrder: (storeId: string, pickupCode: string) =>
    request<{ success: boolean; order: any; message: string }>('/api/barista/orders/collect', {
      method: 'POST',
      body: JSON.stringify({ storeId, pickupCode })
    }),

  updateStoreStatus: (storeId: string, status?: string, avgPrepTimeMinutes?: number) =>
    request<{ success: boolean; store: any }>('/api/barista/store/status', {
      method: 'PATCH',
      body: JSON.stringify({ storeId, status, avgPrepTimeMinutes })
    }),

  updateItemAvailability: (itemId: string, storeId: string, isAvailable: boolean) =>
    request<{ success: boolean }>(`/api/barista/items/${itemId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ storeId, isAvailable })
    }),

  // Admin
  getAdminReports: () => request<{ success: boolean; totals: any; daily: any[]; topItems: any[]; voucherStats: any[] }>('/api/admin/reports'),

  createVoucher: (data: any) =>
    request<{ success: boolean; voucherId: string }>('/api/admin/vouchers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Realtime & Simulation (Luckin Strategy)
  getRealtimeOverview: () => 
    request<{
      success: boolean;
      stores: any[];
      activityFeed: Array<{ id: string; text: string; status: string; timeAgo: string }>;
      activeFlashDeal: any;
      serverTime: string;
    }>('/api/realtime/overview'),

  simulateFastOrder: (storeId?: string, drinkName?: string) =>
    request<{ success: boolean; order: any; assignedShelf: string; message: string }>('/api/realtime/simulate/fast-order', {
      method: 'POST',
      body: JSON.stringify({ storeId, drinkName })
    }),

  simulateAdvanceOrder: (orderId: string, targetStatus?: string) =>
    request<{ success: boolean; order: any; status: string; shelf?: string }>('/api/realtime/simulate/advance', {
      method: 'POST',
      body: JSON.stringify({ orderId, targetStatus })
    }),

  simulateToggleRush: (storeId?: string) =>
    request<{ success: boolean; store: any; message: string }>('/api/realtime/simulate/toggle-rush', {
      method: 'POST',
      body: JSON.stringify({ storeId })
    })
};

