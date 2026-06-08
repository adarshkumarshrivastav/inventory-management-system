import { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Users, Package, AlertTriangle, Menu, X } from 'lucide-react';
import api from './api';
import Products from './components/Products';
import Customers from './components/Customers';
import Orders from './components/Orders';

function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Core Data Metrics State [cite: 127]
  const [stats, setStats] = useState({
    total_products: 0,
    total_customers: 0,
    total_orders: 0,
    low_stock_products: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch summary metrics from the backend on mount [cite: 116-120]
  useEffect(() => {
    async function fetchStats() {
      try {
        // REMOVED: setLoading(true); <- This line was causing the compiler error
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error("Error loading operational stats:", err);
        setError("Could not connect to the operations API. Ensure your backend server is active.");
      } finally {
        setLoading(false); // This remains safe because it runs after the async API call resolves
      }
    }
    fetchStats();
  }, [currentTab]); // Re-fetch data whenever navigating tabs to capture inventory updates // Re-fetch data whenever navigating tabs to capture inventory updates

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* --- SIDEBAR NAVIGATION BAR --- */}
      <aside className={`bg-slate-900 text-white w-full md:w-64 fixed md:sticky top-0 h-auto md:h-screen z-50 transition-all duration-200 ${isSidebarOpen ? 'block' : 'hidden md:block'}`}>
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wider text-cyan-400">IMS Admin</h1>
          <button className="md:hidden text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentTab === 'dashboard' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => setCurrentTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentTab === 'products' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Package size={18} /> Products
          </button>
          <button 
            onClick={() => setCurrentTab('customers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentTab === 'customers' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users size={18} /> Customers
          </button>
          <button 
            onClick={() => setCurrentTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentTab === 'orders' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <ShoppingCart size={18} /> Orders
          </button>
        </nav>
      </aside>

      {/* --- MAIN INTERFACE WORKSPACE --- */}
      <main className="flex-1 p-6 md:p-8 mt-16 md:mt-0">
        {/* Mobile Header Toggle */}
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 flex items-center px-4 justify-between z-40">
          <h1 className="text-lg font-bold text-cyan-400">IMS Admin</h1>
          <button className="text-white" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        </header>

        {/* Dynamic Context Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 capitalize">{currentTab} Overview</h2>
          <p className="text-sm text-slate-500">Real-time enterprise resource tracking dashboard.</p>
        </div>

        {/* Global System Alerts [cite: 126] */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm shadow-sm">
            {error}
          </div>
        )}

        {/* --- DYNAMIC VIEW PORT RENDERING --- */}
        {currentTab === 'dashboard' && (
          <div>
            {loading ? (
              <div className="text-center py-12 text-slate-500">Fetching administrative state...</div>
            ) : (
              /* Informational Grid Metrics Layout [cite: 115-124] */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Metric Card: Total Products [cite: 117] */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Products</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.total_products}</h3>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Package size={24} />
                  </div>
                </div>

                {/* Metric Card: Total Customers [cite: 118] */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Customers</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.total_customers}</h3>
                  </div>
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Users size={24} />
                  </div>
                </div>

                {/* Metric Card: Total Orders [cite: 119] */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Orders</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.total_orders}</h3>
                  </div>
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <ShoppingCart size={24} />
                  </div>
                </div>

                {/* Metric Card: Low Stock Alerts [cite: 120] */}
                <div className={`p-6 rounded-xl border shadow-sm flex items-center justify-between transition-colors ${stats.low_stock_products > 0 ? 'bg-amber-50/60 border-amber-200' : 'bg-white border-slate-200'}`}>
                  <div>
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Low Stock Items</p>
                    <h3 className={`text-3xl font-bold mt-1 ${stats.low_stock_products > 0 ? 'text-amber-700' : 'text-slate-800'}`}>{stats.low_stock_products}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stats.low_stock_products > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-400'}`}>
                    <AlertTriangle size={24} />
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {currentTab === 'products' && <Products />}

        {currentTab === 'customers' && <Customers />}

        {currentTab === 'orders' && <Orders />}
        
      </main>
    </div>
  );
}

export default App;