import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Trash2, X, Mail, Phone, User } from 'lucide-react';
import api from '../api';

function Customers() {
  // Operational Data States
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Notification Feedback Banners [cite: 126]
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form Initial State Architecture [cite: 71-74]
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });

  // Query database profiles from the backend stack
  const fetchCustomers = useCallback(async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch {
      setErrorMessage('Failed to connect to directory servers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function initView() {
      await fetchCustomers();
    }
    initView();
  }, [fetchCustomers]);

  // Handle client-side email pattern check before network dispatch [cite: 125]
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Basic regex checks to match standard user formatting patterns
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      setErrorMessage('Please provide a valid email format (e.g. name@domain.com).');
      return;
    }

    try {
      await api.post('/customers', formData);
      setSuccessMessage(`Account record for "${formData.full_name}" registered.`);
      
      closeModal();
      fetchCustomers();
    } catch (err) {
      // Catch unique database constraints raised by duplication [cite: 94]
      const details = err.response?.data?.detail || 'An anomaly occurred adding this account.';
      setErrorMessage(details);
    }
  };

  const openModal = () => {
    setFormData({ full_name: '', email: '', phone: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently drop this customer registry?')) return;
    try {
      await api.delete(`/customers/${id}`);
      setSuccessMessage('Account record successfully dropped.');
      fetchCustomers();
    } catch {
      setErrorMessage('Cannot remove customer. Ensure this profile has no active or past orders on file.');
    }
  };

  return (
    <div className="space-y-6">
      {/* System State Banner Notifications [cite: 126] */}
      {successMessage && <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded shadow-sm text-sm">{successMessage}</div>}
      {errorMessage && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm text-sm">{errorMessage}</div>}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-700">Client Accounts Directory</h3>
        <button onClick={openModal} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
          <UserPlus size={16} /> Add Customer
        </button>
      </div>

      {/* Directory Content Rendering Grid [cite: 109, 124] */}
      {loading ? (
        <div className="text-center py-8 text-slate-400 text-sm">Querying customer accounts...</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">No recorded profiles found. Populate directory paths via the manual entry button above.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <div key={customer.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative flex flex-col justify-between group">
              <button onClick={() => handleDelete(customer.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-600 p-1 rounded transition-colors" title="Delete Profile [cite: 110]">
                <Trash2 size={16} />
              </button>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <User size={18} />
                  </div>
                  <h4 className="font-semibold text-slate-800 text-base">{customer.full_name}</h4>
                </div>
                
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ACCOUNT FORM MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden transform transition-all">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h4 className="font-bold text-slate-800">Register New Customer Profile</h4>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Legal Name</label>
                <input type="text" required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-cyan-500" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email Address</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-cyan-500" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone Number (Optional)</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-cyan-500" placeholder="+1 (555) 000-0000" />
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium shadow-sm">Initialize Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;