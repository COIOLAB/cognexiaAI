/**
 * Procurement App Example
 * 
 * Complete example React application demonstrating how to use the
 * procurement SDK, hooks, and components in a real application.
 * 
 * @version 2.0.0
 * @author Industry 5.0 ERP Team
 */

import React, { useState, useEffect } from 'react';
import ProcurementSDK from '../sdk/procurement-sdk';
import { ProcurementProvider } from '../sdk/react-hooks';
import {
  ProcurementDashboard,
  SupplierList,
  SupplierOnboardingForm,
  ContractList,
  AutonomousPOForm,
  MarketIntelligenceDashboard,
} from '../components/procurement-components';
import '../styles/procurement-styles.css';

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const ProcurementApp: React.FC = () => {
  // Initialize SDK
  const [sdk] = useState(() => new ProcurementSDK({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
    retries: 3,
    apiKey: process.env.REACT_APP_API_KEY,
  }));

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication
  useEffect(() => {
    // Check for stored auth token
    const storedToken = localStorage.getItem('procurement_auth_token');
    if (storedToken) {
      try {
        const token = JSON.parse(storedToken);
        sdk.setAuthToken(token);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid stored token:', error);
        localStorage.removeItem('procurement_auth_token');
      }
    }
  }, [sdk]);

  if (!isAuthenticated) {
    return <LoginForm onLogin={(token) => {
      sdk.setAuthToken(token);
      localStorage.setItem('procurement_auth_token', JSON.stringify(token));
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <ProcurementProvider sdk={sdk}>
      <div className="procurement-app">
        <AppHeader />
        <AppNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onLogout={() => {
            sdk.clearAuthToken();
            localStorage.removeItem('procurement_auth_token');
            setIsAuthenticated(false);
          }}
        />
        <AppContent activeTab={activeTab} />
      </div>
    </ProcurementProvider>
  );
};

// ============================================================================
// AUTHENTICATION COMPONENT
// ============================================================================

const LoginForm: React.FC<{
  onLogin: (token: any) => void;
}> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate authentication - in real app, this would call your auth API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockToken = {
        accessToken: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresIn: 3600,
        tokenType: 'Bearer',
        scope: 'procurement:read procurement:write',
      };

      onLogin(mockToken);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Industry 5.0 Procurement</h1>
          <p>Sign in to access the procurement system</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-field">
            <label>Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({
                ...prev,
                username: e.target.value
              }))}
              required
            />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({
                ...prev,
                password: e.target.value
              }))}
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-demo-note">
          <p><strong>Demo Credentials:</strong></p>
          <p>Username: demo@company.com</p>
          <p>Password: demo123</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// NAVIGATION COMPONENTS
// ============================================================================

const AppHeader: React.FC = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title">
          <h1>Industry 5.0 Procurement</h1>
          <span className="header-subtitle">Intelligent Procurement Management</span>
        </div>
        <div className="header-actions">
          <button className="btn-icon">🔔</button>
          <button className="btn-icon">⚙️</button>
        </div>
      </div>
    </header>
  );
};

const AppNavigation: React.FC<{
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}> = ({ activeTab, onTabChange, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'suppliers', label: 'Suppliers', icon: '🏢' },
    { id: 'contracts', label: 'Contracts', icon: '📋' },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: '📦' },
    { id: 'market-intelligence', label: 'Market Intel', icon: '📈' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  return (
    <nav className="app-navigation">
      <div className="nav-items">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
      
      <div className="nav-footer">
        <button onClick={onLogout} className="nav-item logout">
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </nav>
  );
};

// ============================================================================
// CONTENT ROUTER
// ============================================================================

const AppContent: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  return (
    <main className="app-content">
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'suppliers' && <SuppliersTab />}
      {activeTab === 'contracts' && <ContractsTab />}
      {activeTab === 'purchase-orders' && <PurchaseOrdersTab />}
      {activeTab === 'market-intelligence' && <MarketIntelligenceTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
    </main>
  );
};

// ============================================================================
// TAB COMPONENTS
// ============================================================================

const DashboardTab: React.FC = () => {
  const [timeframe, setTimeframe] = useState('30d');
  const [departments, setDepartments] = useState<string[]>([]);

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Procurement Dashboard</h2>
        <div className="tab-controls">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>
      
      <ProcurementDashboard 
        timeframe={timeframe}
        departments={departments.length > 0 ? departments : undefined}
      />
    </div>
  );
};

const SuppliersTab: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [filters, setFilters] = useState({});

  const handleSupplierOnboarded = (supplier: any) => {
    setShowOnboarding(false);
    console.log('New supplier onboarded:', supplier);
  };

  if (showOnboarding) {
    return (
      <div className="tab-content">
        <div className="tab-header">
          <h2>Onboard New Supplier</h2>
          <button
            onClick={() => setShowOnboarding(false)}
            className="btn-secondary"
          >
            Back to Suppliers
          </button>
        </div>
        
        <SupplierOnboardingForm
          onSuccess={handleSupplierOnboarded}
          onCancel={() => setShowOnboarding(false)}
        />
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Supplier Management</h2>
        <button
          onClick={() => setShowOnboarding(true)}
          className="btn-primary"
        >
          Onboard Supplier
        </button>
      </div>
      
      <SupplierList
        filters={filters}
        onSupplierSelect={setSelectedSupplier}
        selectable
      />

      {selectedSupplier && (
        <SupplierModal
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}
    </div>
  );
};

const ContractsTab: React.FC = () => {
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [filters, setFilters] = useState({});

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Contract Management</h2>
        <button className="btn-primary">
          Create Contract
        </button>
      </div>
      
      <ContractList
        filters={filters}
        onContractSelect={setSelectedContract}
      />

      {selectedContract && (
        <ContractModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </div>
  );
};

const PurchaseOrdersTab: React.FC = () => {
  const [showAutonomousForm, setShowAutonomousForm] = useState(false);

  const handlePOSubmitted = (po: any) => {
    setShowAutonomousForm(false);
    console.log('Autonomous PO submitted:', po);
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Purchase Orders</h2>
        <button
          onClick={() => setShowAutonomousForm(true)}
          className="btn-primary"
        >
          New Autonomous PO
        </button>
      </div>
      
      {showAutonomousForm ? (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Autonomous Purchase Order</h3>
              <button 
                onClick={() => setShowAutonomousForm(false)}
                className="btn-icon"
              >
                ×
              </button>
            </div>
            <AutonomousPOForm onSuccess={handlePOSubmitted} />
          </div>
        </div>
      ) : (
        <PurchaseOrderList />
      )}
    </div>
  );
};

const MarketIntelligenceTab: React.FC = () => {
  const [category, setCategory] = useState('technology');
  const [region, setRegion] = useState('global');

  return (
    <div className="tab-content">
      <MarketIntelligenceDashboard
        category={category}
        region={region}
      />
    </div>
  );
};

const AnalyticsTab: React.FC = () => {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Advanced Analytics</h2>
        <div className="tab-controls">
          <button className="btn-secondary">Export Report</button>
          <button className="btn-primary">Create Custom Report</button>
        </div>
      </div>
      
      <div className="analytics-grid">
        <AnalyticsCard title="Spend Analysis" />
        <AnalyticsCard title="Supplier Performance" />
        <AnalyticsCard title="Cost Savings" />
        <AnalyticsCard title="Risk Assessment" />
      </div>
    </div>
  );
};

// ============================================================================
// MODAL COMPONENTS
// ============================================================================

const SupplierModal: React.FC<{
  supplier: any;
  onClose: () => void;
}> = ({ supplier, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>{supplier.name}</h3>
          <button onClick={onClose} className="btn-icon">×</button>
        </div>
        
        <div className="modal-body">
          <SupplierDetails supplier={supplier} />
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <button className="btn-primary">
            Edit Supplier
          </button>
        </div>
      </div>
    </div>
  );
};

const ContractModal: React.FC<{
  contract: any;
  onClose: () => void;
}> = ({ contract, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>Contract {contract.contractNumber}</h3>
          <button onClick={onClose} className="btn-icon">×</button>
        </div>
        
        <div className="modal-body">
          <ContractDetails contract={contract} />
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <button className="btn-primary">
            Edit Contract
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

const SupplierDetails: React.FC<{ supplier: any }> = ({ supplier }) => {
  return (
    <div className="supplier-details-view">
      <div className="details-section">
        <h4>Company Information</h4>
        <div className="details-grid">
          <div className="detail-item">
            <label>Company Name</label>
            <span>{supplier.name}</span>
          </div>
          <div className="detail-item">
            <label>Contact Person</label>
            <span>{supplier.contactPerson}</span>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <span>{supplier.email}</span>
          </div>
          <div className="detail-item">
            <label>Phone</label>
            <span>{supplier.phone}</span>
          </div>
        </div>
      </div>

      <div className="details-section">
        <h4>Performance Metrics</h4>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Rating</span>
            <span className="metric-value">{supplier.rating}/5</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Total Orders</span>
            <span className="metric-value">{supplier.orderCount}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Total Volume</span>
            <span className="metric-value">${supplier.totalVolume?.toLocaleString()}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">On-time Delivery</span>
            <span className="metric-value">{supplier.onTimeDelivery}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContractDetails: React.FC<{ contract: any }> = ({ contract }) => {
  return (
    <div className="contract-details-view">
      <div className="details-section">
        <h4>Contract Overview</h4>
        <div className="details-grid">
          <div className="detail-item">
            <label>Contract Number</label>
            <span>{contract.contractNumber}</span>
          </div>
          <div className="detail-item">
            <label>Supplier</label>
            <span>{contract.supplier?.name}</span>
          </div>
          <div className="detail-item">
            <label>Value</label>
            <span>${contract.value?.toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <label>Status</label>
            <span>{contract.status}</span>
          </div>
        </div>
      </div>

      <div className="details-section">
        <h4>Timeline</h4>
        <div className="timeline">
          <div className="timeline-item">
            <span className="timeline-label">Start Date</span>
            <span className="timeline-value">
              {new Date(contract.startDate).toLocaleDateString()}
            </span>
          </div>
          <div className="timeline-item">
            <span className="timeline-label">End Date</span>
            <span className="timeline-value">
              {new Date(contract.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="timeline-item">
            <span className="timeline-label">Duration</span>
            <span className="timeline-value">{contract.duration} months</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PurchaseOrderList: React.FC = () => {
  // Mock data for demonstration
  const [orders] = useState([
    {
      id: '1',
      orderNumber: 'PO-2024-001',
      supplier: 'TechCorp Solutions',
      amount: 15000,
      status: 'processing',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      orderNumber: 'PO-2024-002',
      supplier: 'Office Supplies Inc',
      amount: 2500,
      status: 'approved',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  return (
    <div className="purchase-order-list">
      <table className="contract-table">
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Supplier</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="contract-row">
              <td>{order.orderNumber}</td>
              <td>{order.supplier}</td>
              <td>${order.amount.toLocaleString()}</td>
              <td>
                <span className={`status-badge ${order.status === 'approved' ? 'green' : 'yellow'}`}>
                  {order.status}
                </span>
              </td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>
                <div className="action-buttons">
                  <button className="btn-icon" title="View">👁️</button>
                  <button className="btn-icon" title="Edit">✏️</button>
                  <button className="btn-icon" title="Download">📥</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AnalyticsCard: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="analytics-card">
      <h4>{title}</h4>
      <div className="analytics-placeholder">
        <p>Advanced {title.toLowerCase()} visualization would be displayed here.</p>
        <p>This could include charts, tables, and interactive data exploration tools.</p>
      </div>
    </div>
  );
};

// ============================================================================
// APP STYLES (Additional)
// ============================================================================

const appStyles = `
  .procurement-app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-family: var(--font-sans);
  }

  .app-header {
    background: white;
    border-bottom: 1px solid var(--gray-200);
    box-shadow: var(--shadow-sm);
    z-index: 10;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .header-title h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--gray-900);
  }

  .header-subtitle {
    font-size: 0.875rem;
    color: var(--gray-600);
  }

  .header-actions {
    display: flex;
    gap: var(--spacing-sm);
  }

  .app-navigation {
    width: 250px;
    background: var(--gray-800);
    color: white;
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 73px;
    bottom: 0;
    overflow-y: auto;
  }

  .nav-items {
    flex: 1;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    border: none;
    background: none;
    color: var(--gray-300);
    text-align: left;
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-sm);
    transition: all 0.2s ease;
    cursor: pointer;
    width: 100%;
  }

  .nav-item:hover {
    background: var(--gray-700);
    color: white;
  }

  .nav-item.active {
    background: var(--primary-600);
    color: white;
  }

  .nav-item.logout {
    color: var(--error-300);
  }

  .nav-item.logout:hover {
    background: var(--error-600);
    color: white;
  }

  .nav-icon {
    font-size: 1.25rem;
  }

  .nav-label {
    font-weight: 500;
  }

  .app-content {
    flex: 1;
    margin-left: 250px;
    background: var(--gray-50);
    overflow-y: auto;
  }

  .tab-content {
    height: 100%;
  }

  .tab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    background: white;
    border-bottom: 1px solid var(--gray-200);
  }

  .tab-header h2 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--gray-900);
  }

  .tab-controls {
    display: flex;
    gap: var(--spacing-md);
  }

  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: var(--gray-50);
  }

  .login-card {
    background: white;
    padding: var(--spacing-2xl);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    width: 100%;
    max-width: 400px;
  }

  .login-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }

  .login-header h1 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--gray-900);
  }

  .login-header p {
    margin: 0;
    color: var(--gray-600);
  }

  .login-form {
    margin-bottom: var(--spacing-lg);
  }

  .login-error {
    padding: var(--spacing-md);
    background: var(--error-50);
    border: 1px solid var(--error-200);
    border-radius: var(--radius-md);
    color: var(--error-700);
    margin-bottom: var(--spacing-md);
    font-size: 0.875rem;
  }

  .login-demo-note {
    padding: var(--spacing-md);
    background: var(--primary-50);
    border: 1px solid var(--primary-200);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    color: var(--primary-700);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }

  .modal-content {
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-content.large {
    max-width: 800px;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--gray-200);
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--gray-900);
  }

  .modal-body {
    padding: var(--spacing-lg);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    border-top: 1px solid var(--gray-200);
    background: var(--gray-50);
  }

  .analytics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
  }

  .analytics-card {
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-200);
    padding: var(--spacing-lg);
  }

  .analytics-card h4 {
    margin: 0 0 var(--spacing-lg) 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--gray-900);
  }

  .analytics-placeholder {
    padding: var(--spacing-xl);
    text-align: center;
    color: var(--gray-500);
    background: var(--gray-50);
    border-radius: var(--radius-md);
  }

  .details-section {
    margin-bottom: var(--spacing-xl);
  }

  .details-section h4 {
    margin: 0 0 var(--spacing-lg) 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--gray-900);
    border-bottom: 1px solid var(--gray-200);
    padding-bottom: var(--spacing-sm);
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .detail-item label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--gray-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .detail-item span {
    font-weight: 500;
    color: var(--gray-900);
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-lg);
  }

  .metric-item {
    text-align: center;
    padding: var(--spacing-md);
    background: var(--gray-50);
    border-radius: var(--radius-md);
  }

  .metric-label {
    display: block;
    font-size: 0.75rem;
    color: var(--gray-500);
    margin-bottom: var(--spacing-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .metric-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--gray-900);
  }

  .timeline {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .timeline-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: var(--gray-50);
    border-radius: var(--radius-md);
  }

  .timeline-label {
    font-weight: 500;
    color: var(--gray-600);
  }

  .timeline-value {
    font-weight: 600;
    color: var(--gray-900);
  }

  @media (max-width: 768px) {
    .procurement-app {
      flex-direction: column;
    }

    .app-navigation {
      position: static;
      width: 100%;
      height: auto;
      flex-direction: row;
      overflow-x: auto;
      padding: var(--spacing-md);
    }

    .nav-items {
      display: flex;
      gap: var(--spacing-sm);
      flex: none;
    }

    .nav-item {
      flex-direction: column;
      gap: var(--spacing-xs);
      min-width: 80px;
      text-align: center;
      margin-bottom: 0;
    }

    .nav-label {
      font-size: 0.75rem;
    }

    .app-content {
      margin-left: 0;
    }

    .modal-content {
      width: 95%;
      margin: var(--spacing-md);
    }
  }
`;

// Inject styles
const styleElement = document.createElement('style');
styleElement.textContent = appStyles;
document.head.appendChild(styleElement);

export default ProcurementApp;
