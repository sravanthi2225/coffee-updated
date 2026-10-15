import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, RefreshCw, CheckCircle2, RotateCcw } from 'lucide-react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';

export const InvoiceView: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();

  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    api.getInvoice(orderId)
      .then(res => {
        if (res.success && res.invoice) {
          setInvoice(res.invoice);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleReorder = async () => {
    if (!orderId) return;
    setReordering(true);
    try {
      const res = await api.reorder(orderId);
      if (res.success && res.items) {
        clearCart();
        // Load items back to cart
        for (const line of res.items) {
          addToCart(
            {
              id: line.itemId,
              name: 'Reordered Drink',
              category: 'coffee',
              description: '',
              price: 250,
              image: '/images/types/latte.jpg',
              flavorNotes: []
            },
            {},
            line.quantity,
            line.selectedOptionIds
          );
        }
        navigate('/cart');
      }
    } catch (e: any) {
      alert(e.message || 'Could not reorder.');
    } finally {
      setReordering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#8C6D46] mb-3" />
        <h3 className="font-serif text-xl font-bold">Loading Tax Invoice...</h3>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <h3 className="font-serif text-2xl font-bold mb-2">Invoice Not Available</h3>
        <p className="text-sm text-[#2A2723]/60 mb-6">Could not load invoice for this order.</p>
        <Link to="/menu" className="py-2 px-4 rounded-xl bg-[#2A2723] text-[#FBF4E9] text-xs">
          Return to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
      {/* Action Bar (hidden during print) */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link
          to={`/order/${orderId}/track`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C6D46] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Tracking</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReorder}
            disabled={reordering}
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-white border border-[#2A2723]/20 hover:bg-gray-50 text-xs font-semibold text-[#2A2723]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8C6D46]" />
            <span>{reordering ? 'Loading...' : 'Re-order in 1-Tap'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-[#2A2723] text-[#FBF4E9] hover:bg-[#3D3833] text-xs font-semibold shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Download / Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#2A2723]/15 shadow-md print:shadow-none print:border-none print:p-0">
        {/* Brand & Invoice Header */}
        <div className="flex items-start justify-between border-b border-[#2A2723]/15 pb-6">
          <div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#2A2723]">
              Brew & Bloom
            </span>
            <span className="block text-[11px] font-semibold tracking-wider text-[#8C6D46] uppercase mt-0.5">
              Artisan Coffee Roasters
            </span>
            <p className="text-xs text-[#2A2723]/70 mt-2 leading-relaxed">
              {invoice.storeName}
              <br />
              {invoice.storeAddress}
              <br />
              <strong className="text-[#2A2723]">GSTIN:</strong> {invoice.gstin_number}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-widest mb-1">
              TAX INVOICE
            </span>
            <h3 className="font-mono text-sm font-bold text-[#2A2723] mt-1">{invoice.invoice_number}</h3>
            <p className="text-xs text-[#2A2723]/60 mt-1">
              Date: {new Date(invoice.createdAt).toLocaleDateString()}
              <br />
              Time: {new Date(invoice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Customer & Fulfilment Meta */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-[#2A2723]/10 text-xs">
          <div>
            <span className="text-[#2A2723]/60 block uppercase tracking-wider text-[10px] font-semibold">
              Fulfilment Method
            </span>
            <span className="font-semibold text-[#2A2723]">{invoice.fulfilmentMode}</span>
          </div>

          <div className="text-right">
            <span className="text-[#2A2723]/60 block uppercase tracking-wider text-[10px] font-semibold">
              Payment Status
            </span>
            <span className="font-semibold text-emerald-700 flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PAID ({invoice.payment?.provider || 'ONLINE'})
            </span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-6 border-b border-[#2A2723]/15">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2A2723]/10 text-[#2A2723]/60 font-semibold uppercase text-[10px]">
                <th className="text-left pb-2">Description</th>
                <th className="text-center pb-2">Qty</th>
                <th className="text-right pb-2">Unit Price</th>
                <th className="text-right pb-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2723]/5">
              {invoice.items?.map((item: any) => (
                <tr key={item.id} className="py-2.5">
                  <td className="py-2.5 text-left">
                    <span className="font-semibold text-[#2A2723]">{item.item_name}</span>
                    {item.options && item.options.length > 0 && (
                      <p className="text-[11px] text-[#8C6D46] mt-0.5">
                        {item.options.map((o: any) => o.option_name).join(', ')}
                      </p>
                    )}
                  </td>
                  <td className="py-2.5 text-center">{item.quantity}</td>
                  <td className="py-2.5 text-right font-mono">₹{item.unit_base_price}</td>
                  <td className="py-2.5 text-right font-mono font-semibold">₹{item.total_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tax Breakdown & Totals */}
        <div className="pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-[#2A2723]/80">
            <span>Subtotal</span>
            <span className="font-mono">₹{invoice.subtotal}</span>
          </div>

          {invoice.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Promotional Voucher Discount</span>
              <span className="font-mono">-₹{invoice.discountAmount}</span>
            </div>
          )}

          <div className="flex justify-between text-[#2A2723]/70">
            <span>Central GST (CGST @ 2.5%)</span>
            <span className="font-mono">₹{invoice.cgst_amount}</span>
          </div>

          <div className="flex justify-between text-[#2A2723]/70">
            <span>State GST (SGST @ 2.5%)</span>
            <span className="font-mono">₹{invoice.sgst_amount}</span>
          </div>

          {invoice.deliveryFee > 0 && (
            <div className="flex justify-between text-[#2A2723]/80">
              <span>Delivery Fee</span>
              <span className="font-mono">₹{invoice.deliveryFee}</span>
            </div>
          )}

          <div className="pt-3 border-t border-[#2A2723]/15 flex justify-between items-center text-sm font-bold text-[#2A2723]">
            <span>Total Payable Amount</span>
            <span className="font-serif text-xl font-bold">₹{invoice.totalAmount}</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-[#2A2723]/10 text-center text-[11px] text-[#2A2723]/50">
          Thank you for choosing Brew & Bloom Artisan Coffee. For inquiries, email support@brewbloom.coffee.
        </div>
      </div>
    </div>
  );
};
