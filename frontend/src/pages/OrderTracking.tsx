import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Coffee, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  ArrowLeft,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import { useRealtime } from '../context/RealtimeContext';

export const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { playChime, setActiveCustomerOrder } = useRealtime();

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const res = await api.getOrder(orderId);
      if (res.success && res.order) {
        setOrder(res.order);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch order details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Setup SSE live stream
    if (!orderId) return;
    const eventSource = new EventSource(`/api/orders/${orderId}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ORDER_STATUS_UPDATE') {
          setOrder((prev: any) => prev ? { ...prev, status: data.status, pickup_code: data.pickupCode || prev.pickup_code } : prev);
          
          // Synthesized crisp audio chime on READY
          if (data.status === 'READY') {
            playChime('ready');
          } else {
            playChime('order');
          }
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!orderId) return;
    if (!window.confirm('Are you sure you want to cancel this order? An automatic full refund will be initiated.')) {
      return;
    }

    setCancelling(true);
    try {
      const res = await api.cancelOrder(orderId, 'Cancelled by customer before brewing');
      if (res.success && res.order) {
        setOrder(res.order);
      }
    } catch (err: any) {
      alert(err.message || 'Could not cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#8C6D46] mb-3" />
        <h3 className="font-serif text-xl font-bold">Connecting to Live Barista Queue...</h3>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="font-serif text-2xl font-bold mb-2">Order Not Found</h3>
        <p className="text-sm text-[#2A2723]/60 mb-6">{errorMessage || 'Could not load order tracking information.'}</p>
        <Link to="/menu" className="py-2.5 px-5 rounded-xl bg-[#2A2723] text-[#FBF4E9] text-xs font-semibold">
          Return to Menu
        </Link>
      </div>
    );
  }

  // Lifecycle steps
  const steps = [
    { key: 'PAID', label: 'Payment Confirmed' },
    { key: 'ACCEPTED', label: 'Order Queued' },
    { key: 'PREPARING', label: 'Artisan Brewing' },
    { key: 'READY', label: 'Ready for Pickup' },
    { key: 'COLLECTED', label: 'Collected' }
  ];

  const currentStatusIndex = steps.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';
  const canCancel = ['PAID', 'ACCEPTED'].includes(order.status);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/menu" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C6D46] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </Link>
        <Link
          to={`/order/${order.id}/invoice`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-[#2A2723]/15 hover:bg-gray-50 text-[#2A2723]"
        >
          <FileText className="w-4 h-4 text-[#8C6D46]" />
          <span>GST Tax Invoice</span>
        </Link>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2A2723]/10 shadow-lg space-y-6">
        {/* Order Header */}
        <div className="flex items-start justify-between border-b border-[#2A2723]/10 pb-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D46] px-2 py-0.5 rounded-full bg-[#8C6D46]/10 inline-block mb-1">
              Order #{order.order_number}
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#2A2723]">Live Order Tracking</h2>
            <p className="text-xs text-[#2A2723]/60 mt-0.5">
              Placed at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="text-right">
            <span className="font-serif text-xl font-bold text-[#2A2723]">₹{order.total_amount}</span>
            <span className="block text-[11px] text-[#2A2723]/60">{order.fulfilment_mode}</span>
          </div>
        </div>

        {/* Cancelled Alert */}
        {isCancelled ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs">
            <strong className="block font-semibold mb-1">Order Cancelled</strong>
            Your order has been cancelled and a full refund has been credited to your payment method.
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-semibold text-[#2A2723]">
                <span>Status: {order.status.replace(/_/g, ' ')}</span>
                <span className="text-[#8C6D46] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {order.status === 'READY' ? 'Pickup Now!' : order.status === 'COLLECTED' ? 'Enjoy your cup' : 'Est. ~6-8 mins'}
                </span>
              </div>

              {/* Step Dots */}
              <div className="grid grid-cols-5 gap-1 relative">
                {steps.map((st, idx) => {
                  const isDone = currentStatusIndex >= idx;
                  const isCurrent = currentStatusIndex === idx;
                  return (
                    <div key={st.key} className="text-center">
                      <div
                        className={`h-2.5 rounded-full mb-2 transition-all ${
                          isDone
                            ? 'bg-[#8C6D46]'
                            : 'bg-gray-200'
                        }`}
                      />
                      <span className={`block text-[10px] leading-tight ${isCurrent ? 'font-bold text-[#2A2723]' : 'text-[#2A2723]/50'}`}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pickup Proof: 4-digit code and high-res QR code */}
            <div className="p-6 rounded-3xl bg-[#2A2723] text-[#FBF4E9] text-center space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A880]">
                  Official Counter Verification
                </span>
                <h3 className="font-serif text-xl font-bold mt-0.5">Your Pickup Pass</h3>
                <p className="text-xs text-[#FBF4E9]/70">Show this QR or 4-digit code to the barista at the pickup counter.</p>
              </div>

              {/* QR Code Container */}
              <div className="p-4 bg-white rounded-2xl inline-block shadow-md">
                <QRCodeSVG
                  value={JSON.stringify({
                    orderId: order.id,
                    orderNumber: order.order_number,
                    pickupCode: order.pickup_code,
                    storeId: order.store_id
                  })}
                  size={150}
                  level="H"
                />
              </div>

              {/* 4-Digit Numeric Code Display */}
              <div>
                <span className="text-[11px] text-[#FBF4E9]/60 block mb-1">4-Digit Pickup PIN</span>
                <div className="inline-flex gap-2 font-mono text-3xl font-bold tracking-widest bg-[#1C1A17] px-6 py-2 rounded-xl border border-[#C5A880]/30 text-[#C5A880]">
                  {order.pickup_code}
                </div>
              </div>

              <div className="text-[11px] text-[#FBF4E9]/60 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Pickup Location: <strong>{order.store_name}</strong></span>
              </div>
            </div>

            {/* Cancellation Rule Button */}
            {canCancel && (
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#2A2723]/60">Change of plans?</span>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleCancelOrder}
                  className="text-xs text-red-600 font-semibold hover:underline"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order (Auto Refund)'}
                </button>
              </div>
            )}

            {!canCancel && order.status === 'PREPARING' && (
              <p className="text-[11px] text-[#2A2723]/50 text-center italic">
                Preparation has commenced. Cancellation is no longer available.
              </p>
            )}
          </>
        )}

        {/* Itemized Order Details */}
        <div className="pt-5 border-t border-[#2A2723]/10">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-[#2A2723]/70 mb-3">
            Ordered Items
          </h4>
          <div className="space-y-3">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-xs text-[#2A2723]/80">
                <div>
                  <span className="font-semibold text-[#2A2723]">{item.item_name} × {item.quantity}</span>
                  {item.options && item.options.length > 0 && (
                    <p className="text-[11px] text-[#8C6D46] mt-0.5">
                      {item.options.map((o: any) => o.option_name).join(', ')}
                    </p>
                  )}
                </div>
                <span className="font-serif font-bold text-sm">₹{item.total_price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
