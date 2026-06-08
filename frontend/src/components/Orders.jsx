import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Eye, X, PlusCircle, MinusCircle } from 'lucide-react';
import api from '../api';

function Orders() {
  // Core Operational States
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Display Control States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Status Alerts
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form State: Tracks chosen customer and an array of ordered line items [cite: 87-89]
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);

  // Stable data loader function wrapped to satisfy compiler lint specifications
  const loadOrderModuleData = useCallback(async () => {
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/customers'),
        api.get('/products')
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch {
      setErrorMessage('Failed to synchronize current transaction data frameworks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function initFetch() {
      await loadOrderModuleData();
    }
    initFetch();
  }, [loadOrderModuleData]);

  // Line Item row handlers for multi-product orders [cite: 89]
  const handleAddItemRow = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index) => {
    const updatedRows = orderItems.filter((_, i) => i !== index);
    setOrderItems(updatedRows);
  };

  const handleItemChange = (index, field, value) => {
    const updatedRows = [...orderItems];
    updatedRows[index][field] = value;
    setOrderItems(updatedRows);
  };

  // Transaction processing submission engine [cite: 92-100]
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedCustomerId) {
      setErrorMessage('An active customer account profile reference is required.');
      return;
    }

    // Client-side local inventory threshold checks [cite: 96]
    for (const item of orderItems) {
      if (!item.product_id) {
        setErrorMessage('All active order rows must designate a product item.');
        return;
      }
      
      const targetProduct = products.find(p => p.id === parseInt(item.product_id));
      if (!targetProduct) continue;

      if (parseInt(item.quantity) > targetProduct.quantity) {
        setErrorMessage(`Insufficient inventory stock layer for "${targetProduct.name}". Requested: ${item.quantity}, Available: ${targetProduct.quantity} units.`);
        return;
      }
    }

    // Build standard payload structure requested by schemas.OrderCreate
    const payload = {
      customer_id: parseInt(selectedCustomerId),
      items: orderItems.map(item => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity)
      }))
    };

    try {
      await api.post('/orders', payload);
      setSuccessMessage('Transaction verified. Internal ledger log finalized and warehouse stock reduced.');
      
      setIsCreateModalOpen(false);
      setSelectedCustomerId('');
      setOrderItems([{ product_id: '', quantity: 1 }]);
      
      await loadOrderModuleData(); // Refresh local collections to mirror stock reductions instantly
    } catch (err) {
      const details = err.response?.data?.detail || 'An anomaly disrupted transaction execution.';
      setErrorMessage(details);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Permanently cancel and purge this transaction manifest entry?')) return;
    try {
      await api.delete(`/orders/${id}`);
      setSuccessMessage('Order tracking record successfully dropped from logs.');
      await loadOrderModuleData();
    } catch {
      setErrorMessage('Could not clear execution entry path.');
    }
  };

  // Utility helper to map raw relational primary IDs to clear display text definitions
  const getCustomerName = (id) => {
    const matched = customers.find(c => c.id === id);
    return matched ? matched.full_name : `Profile Master Record Block #${id}`;
  };

  const getProductName = (id) => {
    const matched = products.find(p => p.id === id);
    return matched ? matched.name : `Product Inventory Block #${id}`;
  };

  return (
    <div className="space-y-6">
      {/* System Status Dynamic Alerts */}
      {successMessage && <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded shadow-sm text-sm">{successMessage}</div>}
      {errorMessage && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm text-sm">{errorMessage}</div>}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-700">Transactional History Records</h3>
        <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
          <Plus size={16} /> Process New Order
        </button>
      </div>

      {/* Main Order Manifest Registry Grid Display */}
      {loading ? (
        <div className="text-center py-8 text-slate-400 text-sm">Querying active transaction files...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">No recorded transactions found. Launch order creation pipelines using the action button above.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs uppercase font-semibold tracking-wider">
                  <th className="p-4">Transaction Code</th>
                  <th className="p-4">Customer Account</th>
                  <th className="p-4">Timestamp Log</th>
                  <th className="p-4">Settled Amount</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs text-cyan-600 font-semibold">ORD-{order.id.toString().padStart(4, '0')}</td>
                    <td className="p-4 font-medium text-slate-800">{getCustomerName(order.customer_id)}</td>
                    <td className="p-4 text-slate-500">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-slate-900">${order.total_amount.toFixed(2)}</td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => setSelectedOrderDetails(order)} className="text-slate-400 hover:text-cyan-600 inline-block p-1" title="Inspect Invoice Lines">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleDeleteOrder(order.id)} className="text-slate-400 hover:text-red-600 inline-block p-1" title="Expunge Invoice Log">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- FORM MODAL: TRANSACTION INITIATION WINDOW  --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden transform transition-all">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h4 className="font-bold text-slate-800">Initialize Procurement Order File</h4>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateOrder} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Target Account Client</label>
                <select required value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:border-cyan-500">
                  <option value="">-- Choose Account Record Profile --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center pt-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Itemized Line Additions</label>
                  <button type="button" onClick={handleAddItemRow} className="text-xs flex items-center gap-1 text-cyan-600 hover:text-cyan-700 font-semibold">
                    <PlusCircle size={14} /> Add Line Item
                  </button>
                </div>

                {orderItems.map((item, index) => (
                  <div key={index} className="flex gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <div className="flex-1">
                      <select required value={item.product_id} onChange={(e) => handleItemChange(index, 'product_id', e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white focus:outline-none">
                        <option value="">-- Select Product Asset --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                            {p.name} (${p.price.toFixed(2)}) [{p.quantity} left]
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <input type="number" min="1" required value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-xs text-center focus:outline-none" placeholder="Qty" />
                    </div>
                    {orderItems.length > 1 && (
                      <button type="button" onClick={() => handleRemoveItemRow(index)} className="text-slate-400 hover:text-red-500">
                        <MinusCircle size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium shadow-sm">Authorize Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- INSPECTION MODAL: INVOICE LINE DETAIL OVERVIEW [cite: 114] --- */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden transform transition-all">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h4 className="font-bold font-mono tracking-wide text-cyan-400">Invoice: ORD-{selectedOrderDetails.id.toString().padStart(4, '0')}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{getCustomerName(selectedOrderDetails.customer_id)}</p>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="divide-y divide-slate-100 border border-slate-150 rounded-lg overflow-hidden bg-slate-50/50">
                {selectedOrderDetails.items.map((item) => (
                  <div key={item.id} className="p-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{getProductName(item.product_id)}</p>
                      <p className="text-xs text-slate-400">{item.quantity} units &times; ${item.unit_price.toFixed(2)}</p>
                    </div>
                    <span className="font-semibold text-slate-700">${(item.quantity * item.unit_price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-slate-200 text-slate-800">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Total Manifest Settled</span>
                <span className="text-2xl font-black text-slate-900">${selectedOrderDetails.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;