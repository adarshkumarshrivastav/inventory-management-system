import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../api';

function Products() {
  // Operational Data States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Safe initialization default
  
  // UI Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Notification States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State Architecture [cite: 53-58]
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    quantity: ''
  });

  // 1. Wrap fetchProducts in useCallback to satisfy the strict compiler rules
  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch {
      setErrorMessage('Failed to reload current product inventory.');
    } finally {
      setLoading(false); // Runs safely after the asynchronous network boundary resolves
    }
  }, []);

  // 2. Pass the stable function reference into the lifecycle trigger safely
useEffect(() => {
  async function executeFetch() {
    await fetchProducts();
  }
  executeFetch();
}, [fetchProducts]);

  // Handle client-side validation rules before sending data payload [cite: 125]
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (parseFloat(formData.price) <= 0) {
      setErrorMessage('Product pricing metrics must strictly evaluate above 0.');
      return;
    }
    if (parseInt(formData.quantity) < 0) {
      setErrorMessage('Warehouse units in stock cannot evaluate to a negative quantity.');
      return;
    }

    try {
      if (editingProduct) {
        // Run database update path [cite: 106]
        await api.put(`/products/${editingProduct.id}`, formData);
        setSuccessMessage(`Product metadata for "${formData.name}" altered successfully.`);
      } else {
        // Run database creation path [cite: 105]
        await api.post('/products', formData);
        setSuccessMessage(`New asset profile "${formData.name}" initialized successfully.`);
      }
      
      closeModal();
      fetchProducts();
    } catch (err) {
      const details = err.response?.data?.detail || 'An anomaly occurred processing inventory adjustments.';
      setErrorMessage(details);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', sku: '', price: '', quantity: '0' });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      quantity: product.quantity.toString()
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirm intentional removal of this record profile?')) return;
    try {
      await api.delete(`/products/${id}`); // [cite: 106]
      setSuccessMessage('Inventory entry permanently expunged.');
      fetchProducts();
    } catch {
      setErrorMessage('Unable to drop target entry. Confirm asset is not tied to active transaction logs.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Status Display Banners [cite: 126] */}
      {successMessage && <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded shadow-sm text-sm">{successMessage}</div>}
      {errorMessage && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm text-sm">{errorMessage}</div>}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-700">Stock Catalog Inventory</h3>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
          <Plus size={16} /> Add New Entry
        </button>
      </div>

      {/* Main Inventory Data Table [cite: 105, 124] */}
      {loading ? (
        <div className="text-center py-8 text-slate-400 text-sm">Querying active ledger records...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">No inventory listings found. Click "Add New Entry" to populate the database stack.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs uppercase font-semibold tracking-wider">
                  <th className="p-4">Product Specifications</th>
                  <th className="p-4">SKU Code</th>
                  <th className="p-4">Unit Pricing</th>
                  <th className="p-4">Stock Depth</th>
                  <th className="p-4 text-right">Data Modifiers</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{product.name}</td>
                    <td className="p-4 font-mono text-xs text-slate-500">{product.sku}</td>
                    <td className="p-4">${product.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.quantity < 10 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-700'}`}>
                        {product.quantity} units
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openEditModal(product)} className="text-slate-400 hover:text-cyan-600 inline-block p-1" title="Modify Record">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="text-slate-400 hover:text-red-600 inline-block p-1" title="Drop Record">
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

      {/* --- FORM MODAL LAYER (ADD / EDIT MODES) [cite: 122-125] --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden transform transition-all">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h4 className="font-bold text-slate-800">{editingProduct ? 'Modify Asset Profile' : 'Register New Asset Profile'}</h4>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Product Designation Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-cyan-500" placeholder="e.g. Hex Head Cap Screw" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Stock Keeping Unit (SKU)</label>
                <input type="text" required disabled={!!editingProduct} value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-cyan-500 bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed" placeholder="e.g. FAST-HEX-001" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Price ($)</label>
                  <input type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-cyan-500" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Initial Units</label>
                  <input type="number" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-cyan-500" placeholder="0" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium shadow-sm">Save Profiles</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;