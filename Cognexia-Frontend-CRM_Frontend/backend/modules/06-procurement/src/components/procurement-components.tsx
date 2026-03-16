/**
 * Procurement React Components
 * 
 * Complete set of reusable React components for the procurement system.
 * Includes dashboard, forms, tables, modals, and visualization components.
 * 
 * @version 2.0.0
 * @author Industry 5.0 ERP Team
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  useDashboardMetrics,
  useDashboardAlerts,
  useSuppliers,
  useSupplier,
  useSupplierOnboarding,
  useContracts,
  useContract,
  useContractCreation,
  useAutonomousPO,
  useBatchPOs,
  useSystemHealth,
  useMarketIntelligence,
  useAIMarketIntelligence,
  useDebouncedSearch,
  useFormState,
  usePaginated,
} from '../sdk/react-hooks';

// ============================================================================
// DASHBOARD COMPONENTS
// ============================================================================

/**
 * Main procurement dashboard with real-time metrics
 */
export const ProcurementDashboard: React.FC<{
  timeframe?: string;
  departments?: string[];
  className?: string;
}> = ({ timeframe = '30d', departments, className }) => {
  const { data: metrics, loading, error, refetch } = useDashboardMetrics(
    { timeframe, departments },
    true // Real-time updates
  );
  
  const { data: alerts } = useDashboardAlerts({
    severity: 'high',
    unacknowledgedOnly: true,
  });

  const { data: systemHealth } = useSystemHealth();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className={`procurement-dashboard error ${className}`}>
        <ErrorMessage error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className={`procurement-dashboard ${className}`}>
      {/* System Health Indicator */}
      <SystemHealthBar health={systemHealth} />
      
      {/* Alerts Banner */}
      {alerts && alerts.length > 0 && (
        <AlertsBanner alerts={alerts} />
      )}
      
      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Spend"
          value={metrics?.totalSpend}
          format="currency"
          trend={metrics?.spendTrend}
          icon="💰"
        />
        <MetricCard
          title="Active Suppliers"
          value={metrics?.activeSuppliers}
          format="number"
          trend={metrics?.supplierTrend}
          icon="🏢"
        />
        <MetricCard
          title="Processing Orders"
          value={metrics?.processingOrders}
          format="number"
          trend={metrics?.orderTrend}
          icon="📦"
        />
        <MetricCard
          title="Cost Savings"
          value={metrics?.costSavings}
          format="currency"
          trend={metrics?.savingsTrend}
          icon="📈"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <SpendAnalysisChart data={metrics?.spendByCategory} />
        <SupplierPerformanceChart data={metrics?.supplierPerformance} />
        <OrderVolumeChart data={metrics?.orderVolume} />
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={metrics?.recentActivities} />
    </div>
  );
};

/**
 * System health status bar
 */
const SystemHealthBar: React.FC<{ health?: any }> = ({ health }) => {
  if (!health) return null;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'green';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="system-health-bar">
      <div className="health-indicator">
        <span 
          className={`status-dot ${getHealthColor(health.status)}`}
        />
        <span className="status-text">
          System: {health.status?.toUpperCase()}
        </span>
      </div>
      <div className="health-metrics">
        <span>CPU: {health.metrics?.cpu}%</span>
        <span>Memory: {health.metrics?.memory}%</span>
        <span>Response: {health.metrics?.responseTime}ms</span>
      </div>
    </div>
  );
};

/**
 * Alerts banner component
 */
const AlertsBanner: React.FC<{ alerts: any[] }> = ({ alerts }) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter(alert => !dismissed.has(alert.id));

  const dismissAlert = (alertId: string) => {
    setDismissed(prev => new Set([...prev, alertId]));
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="alerts-banner">
      {visibleAlerts.map(alert => (
        <div key={alert.id} className={`alert alert-${alert.severity}`}>
          <span className="alert-icon">⚠️</span>
          <span className="alert-message">{alert.message}</span>
          <button 
            className="alert-dismiss"
            onClick={() => dismissAlert(alert.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

/**
 * Metric card component
 */
const MetricCard: React.FC<{
  title: string;
  value?: number | string;
  format: 'currency' | 'number' | 'percentage';
  trend?: { change: number; period: string };
  icon?: string;
}> = ({ title, value, format, trend, icon }) => {
  const formatValue = (val: number | string | undefined) => {
    if (val === undefined || val === null) return '–';
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(Number(val));
      case 'percentage':
        return `${val}%`;
      case 'number':
        return new Intl.NumberFormat('en-US').format(Number(val));
      default:
        return String(val);
    }
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'green';
    if (change < 0) return 'red';
    return 'gray';
  };

  return (
    <div className="metric-card">
      <div className="metric-header">
        {icon && <span className="metric-icon">{icon}</span>}
        <h3 className="metric-title">{title}</h3>
      </div>
      <div className="metric-value">{formatValue(value)}</div>
      {trend && (
        <div className={`metric-trend ${getTrendColor(trend.change)}`}>
          <span className="trend-arrow">
            {trend.change > 0 ? '↗' : trend.change < 0 ? '↘' : '→'}
          </span>
          <span className="trend-value">
            {Math.abs(trend.change)}% vs {trend.period}
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SUPPLIER COMPONENTS
// ============================================================================

/**
 * Supplier search and listing component
 */
export const SupplierList: React.FC<{
  filters?: any;
  onSupplierSelect?: (supplier: any) => void;
  selectable?: boolean;
}> = ({ filters, onSupplierSelect, selectable = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState(filters || {});

  const { data: suppliers, loading, error, pagination, setPage } = usePaginated(
    (pagination) => ({
      ...activeFilters,
      search: searchQuery,
      ...pagination,
    }),
    1,
    20
  );

  const { results: searchResults, loading: searching } = useDebouncedSearch(
    (query) => {
      // This would be a search endpoint
      return Promise.resolve([]);
    }
  );

  return (
    <div className="supplier-list">
      {/* Search and Filters */}
      <div className="list-controls">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search suppliers..."
          loading={searching}
        />
        <FilterControls
          filters={activeFilters}
          onChange={setActiveFilters}
          options={{
            status: ['active', 'pending', 'suspended'],
            category: ['materials', 'services', 'technology'],
            rating: ['1', '2', '3', '4', '5'],
          }}
        />
      </div>

      {/* Results */}
      {loading ? (
        <ListSkeleton count={5} />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : (
        <>
          <div className="supplier-cards">
            {suppliers?.map(supplier => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                onSelect={selectable ? onSupplierSelect : undefined}
              />
            ))}
          </div>
          
          <Pagination
            current={pagination.page}
            total={pagination.totalPages}
            onPageChange={setPage}
            showSizeChanger
          />
        </>
      )}
    </div>
  );
};

/**
 * Individual supplier card
 */
const SupplierCard: React.FC<{
  supplier: any;
  onSelect?: (supplier: any) => void;
}> = ({ supplier, onSelect }) => {
  return (
    <div 
      className="supplier-card"
      onClick={() => onSelect?.(supplier)}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
    >
      <div className="supplier-header">
        <h4 className="supplier-name">{supplier.name}</h4>
        <StatusBadge status={supplier.status} />
      </div>
      
      <div className="supplier-details">
        <p className="supplier-category">{supplier.category}</p>
        <p className="supplier-location">{supplier.location}</p>
      </div>
      
      <div className="supplier-metrics">
        <div className="metric">
          <span className="label">Rating:</span>
          <StarRating rating={supplier.rating} readonly />
        </div>
        <div className="metric">
          <span className="label">Orders:</span>
          <span className="value">{supplier.orderCount}</span>
        </div>
        <div className="metric">
          <span className="label">Volume:</span>
          <span className="value">${supplier.totalVolume?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Supplier onboarding form
 */
export const SupplierOnboardingForm: React.FC<{
  onSuccess?: (supplier: any) => void;
  onCancel?: () => void;
}> = ({ onSuccess, onCancel }) => {
  const { mutate: onboardSupplier, loading, error } = useSupplierOnboarding();
  
  const { values, errors, touched, setValue, setFieldTouched, setFieldError } = useFormState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    taxId: '',
    bankDetails: '',
    certifications: [],
    references: [],
  });

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!values.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!values.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!values.category) {
      newErrors.category = 'Category is required';
    }

    Object.keys(newErrors).forEach(field => {
      setFieldError(field as any, newErrors[field]);
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await onboardSupplier({ supplierData: values });
      onSuccess?.(result);
    } catch (err) {
      console.error('Onboarding failed:', err);
    }
  };

  return (
    <form className="supplier-onboarding-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Company Information</h3>
        
        <FormField
          label="Company Name"
          required
          error={errors.companyName}
          touched={touched.companyName}
        >
          <input
            type="text"
            value={values.companyName}
            onChange={(e) => setValue('companyName', e.target.value)}
            onBlur={() => setFieldTouched('companyName')}
          />
        </FormField>

        <FormField
          label="Contact Person"
          error={errors.contactPerson}
          touched={touched.contactPerson}
        >
          <input
            type="text"
            value={values.contactPerson}
            onChange={(e) => setValue('contactPerson', e.target.value)}
            onBlur={() => setFieldTouched('contactPerson')}
          />
        </FormField>

        <div className="form-row">
          <FormField
            label="Email"
            required
            error={errors.email}
            touched={touched.email}
          >
            <input
              type="email"
              value={values.email}
              onChange={(e) => setValue('email', e.target.value)}
              onBlur={() => setFieldTouched('email')}
            />
          </FormField>

          <FormField
            label="Phone"
            error={errors.phone}
            touched={touched.phone}
          >
            <input
              type="tel"
              value={values.phone}
              onChange={(e) => setValue('phone', e.target.value)}
              onBlur={() => setFieldTouched('phone')}
            />
          </FormField>
        </div>
      </div>

      <div className="form-section">
        <h3>Business Details</h3>
        
        <FormField
          label="Category"
          required
          error={errors.category}
          touched={touched.category}
        >
          <select
            value={values.category}
            onChange={(e) => setValue('category', e.target.value)}
            onBlur={() => setFieldTouched('category')}
          >
            <option value="">Select category...</option>
            <option value="materials">Raw Materials</option>
            <option value="services">Professional Services</option>
            <option value="technology">Technology & Software</option>
            <option value="equipment">Equipment & Machinery</option>
          </select>
        </FormField>

        <FormField
          label="Address"
          error={errors.address}
          touched={touched.address}
        >
          <textarea
            value={values.address}
            onChange={(e) => setValue('address', e.target.value)}
            onBlur={() => setFieldTouched('address')}
            rows={3}
          />
        </FormField>

        <FormField
          label="Tax ID"
          error={errors.taxId}
          touched={touched.taxId}
        >
          <input
            type="text"
            value={values.taxId}
            onChange={(e) => setValue('taxId', e.target.value)}
            onBlur={() => setFieldTouched('taxId')}
          />
        </FormField>
      </div>

      {error && (
        <div className="form-error">
          <ErrorMessage error={error} />
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" disabled={loading} className="primary">
          {loading ? 'Onboarding...' : 'Onboard Supplier'}
        </button>
      </div>
    </form>
  );
};

// ============================================================================
// CONTRACT COMPONENTS
// ============================================================================

/**
 * Contract list with advanced filtering
 */
export const ContractList: React.FC<{
  filters?: any;
  onContractSelect?: (contract: any) => void;
}> = ({ filters, onContractSelect }) => {
  const { data: contracts, loading, error, pagination, setPage } = usePaginated(
    (pagination) => ({ ...filters, ...pagination }),
    1,
    15
  );

  return (
    <div className="contract-list">
      <div className="list-header">
        <h2>Contracts</h2>
        <button className="btn-primary">New Contract</button>
      </div>

      {loading ? (
        <ListSkeleton count={5} />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : (
        <>
          <div className="contract-table">
            <table>
              <thead>
                <tr>
                  <th>Contract ID</th>
                  <th>Supplier</th>
                  <th>Value</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contracts?.map(contract => (
                  <ContractRow
                    key={contract.id}
                    contract={contract}
                    onSelect={() => onContractSelect?.(contract)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          
          <Pagination
            current={pagination.page}
            total={pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

/**
 * Individual contract row
 */
const ContractRow: React.FC<{
  contract: any;
  onSelect?: () => void;
}> = ({ contract, onSelect }) => {
  return (
    <tr className="contract-row" onClick={onSelect}>
      <td>{contract.contractNumber}</td>
      <td>{contract.supplier?.name}</td>
      <td>${contract.value?.toLocaleString()}</td>
      <td>{new Date(contract.startDate).toLocaleDateString()}</td>
      <td>{new Date(contract.endDate).toLocaleDateString()}</td>
      <td>
        <StatusBadge status={contract.status} />
      </td>
      <td>
        <div className="action-buttons">
          <button className="btn-icon" title="View">👁️</button>
          <button className="btn-icon" title="Edit">✏️</button>
          <button className="btn-icon" title="Download">📥</button>
        </div>
      </td>
    </tr>
  );
};

// ============================================================================
// PURCHASE ORDER COMPONENTS
// ============================================================================

/**
 * Autonomous PO request form
 */
export const AutonomousPOForm: React.FC<{
  onSuccess?: (po: any) => void;
}> = ({ onSuccess }) => {
  const { mutate: processAutonomousPO, loading, error } = useAutonomousPO();
  
  const { values, setValue, errors, setFieldError } = useFormState({
    items: [{ description: '', quantity: 1, maxPrice: 0 }],
    department: '',
    urgency: 'normal',
    deliveryDate: '',
    specialInstructions: '',
    approvalLimit: 10000,
  });

  const addItem = () => {
    setValue('items', [
      ...values.items,
      { description: '', quantity: 1, maxPrice: 0 }
    ]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...values.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setValue('items', updatedItems);
  };

  const removeItem = (index: number) => {
    setValue('items', values.items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await processAutonomousPO(values);
      onSuccess?.(result);
    } catch (err) {
      console.error('PO processing failed:', err);
    }
  };

  return (
    <form className="autonomous-po-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Purchase Order Details</h3>
        
        <div className="form-row">
          <FormField label="Department" required>
            <select
              value={values.department}
              onChange={(e) => setValue('department', e.target.value)}
            >
              <option value="">Select department...</option>
              <option value="it">IT</option>
              <option value="hr">Human Resources</option>
              <option value="finance">Finance</option>
              <option value="operations">Operations</option>
            </select>
          </FormField>

          <FormField label="Urgency">
            <select
              value={values.urgency}
              onChange={(e) => setValue('urgency', e.target.value)}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </FormField>
        </div>

        <FormField label="Required Delivery Date">
          <input
            type="date"
            value={values.deliveryDate}
            onChange={(e) => setValue('deliveryDate', e.target.value)}
          />
        </FormField>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h3>Items</h3>
          <button type="button" onClick={addItem} className="btn-secondary">
            Add Item
          </button>
        </div>
        
        {values.items.map((item, index) => (
          <div key={index} className="item-row">
            <input
              type="text"
              placeholder="Item description"
              value={item.description}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
            />
            <input
              type="number"
              placeholder="Max price per unit"
              value={item.maxPrice}
              onChange={(e) => updateItem(index, 'maxPrice', parseFloat(e.target.value))}
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="btn-danger btn-icon"
              disabled={values.items.length === 1}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      <div className="form-section">
        <FormField label="Special Instructions">
          <textarea
            value={values.specialInstructions}
            onChange={(e) => setValue('specialInstructions', e.target.value)}
            rows={3}
            placeholder="Any special requirements or instructions..."
          />
        </FormField>

        <FormField label="Approval Limit">
          <input
            type="number"
            value={values.approvalLimit}
            onChange={(e) => setValue('approvalLimit', parseFloat(e.target.value))}
          />
        </FormField>
      </div>

      {error && <ErrorMessage error={error} />}

      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Processing...' : 'Submit Autonomous PO'}
        </button>
      </div>
    </form>
  );
};

// ============================================================================
// ANALYTICS COMPONENTS
// ============================================================================

/**
 * Spend analysis chart component
 */
const SpendAnalysisChart: React.FC<{ data?: any[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No spend data available</div>;
  }

  return (
    <div className="chart-container spend-analysis">
      <h4>Spend by Category</h4>
      <div className="chart">
        {/* This would integrate with a charting library like Chart.js or D3 */}
        <div className="bar-chart">
          {data.map((item, index) => (
            <div key={index} className="bar-item">
              <div 
                className="bar"
                style={{ height: `${(item.amount / Math.max(...data.map(d => d.amount))) * 100}%` }}
              />
              <span className="bar-label">{item.category}</span>
              <span className="bar-value">${item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Market intelligence dashboard
 */
export const MarketIntelligenceDashboard: React.FC<{
  category?: string;
  region?: string;
}> = ({ category = 'technology', region = 'global' }) => {
  const { data: marketData, loading, error } = useMarketIntelligence(
    category,
    region,
    true
  );
  
  const { data: aiInsights } = useAIMarketIntelligence();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="market-intelligence-dashboard">
      <div className="dashboard-header">
        <h2>Market Intelligence</h2>
        <div className="filters">
          <select value={category}>
            <option value="technology">Technology</option>
            <option value="materials">Raw Materials</option>
            <option value="services">Services</option>
          </select>
          <select value={region}>
            <option value="global">Global</option>
            <option value="north-america">North America</option>
            <option value="europe">Europe</option>
            <option value="asia-pacific">Asia Pacific</option>
          </select>
        </div>
      </div>

      <div className="intelligence-grid">
        {/* Price Trends */}
        <div className="intelligence-card">
          <h4>Price Trends</h4>
          <PriceTrendChart data={marketData?.priceTrends} />
        </div>

        {/* Supply Risk */}
        <div className="intelligence-card">
          <h4>Supply Risk Assessment</h4>
          <RiskMatrix data={marketData?.riskAssessment} />
        </div>

        {/* Market Opportunities */}
        <div className="intelligence-card">
          <h4>Market Opportunities</h4>
          <OpportunityList opportunities={marketData?.opportunities} />
        </div>

        {/* AI Insights */}
        <div className="intelligence-card">
          <h4>AI-Powered Insights</h4>
          <InsightsList insights={aiInsights?.insights} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

/**
 * Generic form field wrapper
 */
const FormField: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  children: React.ReactNode;
}> = ({ label, required, error, touched, children }) => {
  return (
    <div className={`form-field ${error && touched ? 'error' : ''}`}>
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div className="form-control">
        {children}
      </div>
      {error && touched && (
        <span className="error-message">{error}</span>
      )}
    </div>
  );
};

/**
 * Search input with loading state
 */
const SearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
}> = ({ value, onChange, placeholder, loading }) => {
  return (
    <div className="search-input">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={loading ? 'loading' : ''}
      />
      <div className="search-icon">
        {loading ? '⏳' : '🔍'}
      </div>
    </div>
  );
};

/**
 * Status badge component
 */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': case 'approved': case 'completed': return 'green';
      case 'pending': case 'in-progress': return 'yellow';
      case 'rejected': case 'cancelled': case 'expired': return 'red';
      case 'draft': case 'review': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <span className={`status-badge ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

/**
 * Star rating component
 */
const StarRating: React.FC<{
  rating: number;
  readonly?: boolean;
  onChange?: (rating: number) => void;
}> = ({ rating, readonly = false, onChange }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleClick = (newRating: number) => {
    if (!readonly && onChange) {
      onChange(newRating);
    }
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHoveredRating(star)}
          onMouseLeave={() => !readonly && setHoveredRating(0)}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        >
          ⭐
        </span>
      ))}
      <span className="rating-value">({rating.toFixed(1)})</span>
    </div>
  );
};

/**
 * Pagination component
 */
const Pagination: React.FC<{
  current: number;
  total: number;
  onPageChange: (page: number) => void;
  showSizeChanger?: boolean;
}> = ({ current, total, onPageChange, showSizeChanger }) => {
  const generatePages = () => {
    const pages = [];
    const maxVisible = 7;
    
    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      }
    }
    
    return pages;
  };

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        className="pagination-btn"
      >
        Previous
      </button>
      
      {generatePages().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          className={`pagination-btn ${current === page ? 'active' : ''}`}
          disabled={typeof page !== 'number'}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(current + 1)}
        disabled={current === total}
        className="pagination-btn"
      >
        Next
      </button>
    </div>
  );
};

/**
 * Error message component
 */
const ErrorMessage: React.FC<{
  error: any;
  onRetry?: () => void;
}> = ({ error, onRetry }) => {
  return (
    <div className="error-message">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h4>Something went wrong</h4>
        <p>{error.message || 'An unexpected error occurred'}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-secondary">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Loading skeletons
 */
const DashboardSkeleton: React.FC = () => (
  <div className="dashboard-skeleton">
    <div className="skeleton-metrics">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton-card" />
      ))}
    </div>
    <div className="skeleton-charts">
      <div className="skeleton-chart" />
      <div className="skeleton-chart" />
    </div>
  </div>
);

const ListSkeleton: React.FC<{ count: number }> = ({ count }) => (
  <div className="list-skeleton">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="skeleton-row" />
    ))}
  </div>
);

/**
 * Filter controls component
 */
const FilterControls: React.FC<{
  filters: any;
  onChange: (filters: any) => void;
  options: Record<string, string[]>;
}> = ({ filters, onChange, options }) => {
  const updateFilter = (key: string, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="filter-controls">
      {Object.entries(options).map(([key, values]) => (
        <div key={key} className="filter-group">
          <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
          <select
            value={filters[key] || ''}
            onChange={(e) => updateFilter(key, e.target.value)}
          >
            <option value="">All</option>
            {values.map(value => (
              <option key={value} value={value}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// CHART COMPONENTS (Simplified)
// ============================================================================

const PriceTrendChart: React.FC<{ data?: any[] }> = ({ data }) => (
  <div className="price-trend-chart">
    {data ? 'Price trend visualization would go here' : 'No data available'}
  </div>
);

const SupplierPerformanceChart: React.FC<{ data?: any[] }> = ({ data }) => (
  <div className="supplier-performance-chart">
    {data ? 'Supplier performance chart would go here' : 'No data available'}
  </div>
);

const OrderVolumeChart: React.FC<{ data?: any[] }> = ({ data }) => (
  <div className="order-volume-chart">
    {data ? 'Order volume chart would go here' : 'No data available'}
  </div>
);

const RiskMatrix: React.FC<{ data?: any }> = ({ data }) => (
  <div className="risk-matrix">
    {data ? 'Risk matrix visualization would go here' : 'No data available'}
  </div>
);

const OpportunityList: React.FC<{ opportunities?: any[] }> = ({ opportunities }) => (
  <div className="opportunity-list">
    {opportunities?.length ? (
      opportunities.map((opp, index) => (
        <div key={index} className="opportunity-item">
          <h5>{opp.title}</h5>
          <p>{opp.description}</p>
          <span className="potential-savings">${opp.potentialSavings?.toLocaleString()}</span>
        </div>
      ))
    ) : (
      'No opportunities identified'
    )}
  </div>
);

const InsightsList: React.FC<{ insights?: any[] }> = ({ insights }) => (
  <div className="insights-list">
    {insights?.length ? (
      insights.map((insight, index) => (
        <div key={index} className="insight-item">
          <div className="insight-type">{insight.type}</div>
          <div className="insight-content">{insight.message}</div>
          <div className="insight-confidence">
            Confidence: {(insight.confidence * 100).toFixed(0)}%
          </div>
        </div>
      ))
    ) : (
      'No insights available'
    )}
  </div>
);

const RecentActivity: React.FC<{ activities?: any[] }> = ({ activities }) => (
  <div className="recent-activity">
    <h4>Recent Activity</h4>
    <div className="activity-list">
      {activities?.length ? (
        activities.map((activity, index) => (
          <div key={index} className="activity-item">
            <div className="activity-icon">{activity.icon || '📋'}</div>
            <div className="activity-content">
              <div className="activity-title">{activity.title}</div>
              <div className="activity-description">{activity.description}</div>
              <div className="activity-time">
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="no-activity">No recent activity</div>
      )}
    </div>
  </div>
);

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Dashboard
  ProcurementDashboard,
  MarketIntelligenceDashboard,
  
  // Suppliers
  SupplierList,
  SupplierCard,
  SupplierOnboardingForm,
  
  // Contracts
  ContractList,
  ContractRow,
  
  // Purchase Orders
  AutonomousPOForm,
  
  // Utility Components
  FormField,
  SearchInput,
  StatusBadge,
  StarRating,
  Pagination,
  ErrorMessage,
  DashboardSkeleton,
  ListSkeleton,
  FilterControls,
  
  // Chart Components
  SpendAnalysisChart,
  PriceTrendChart,
  SupplierPerformanceChart,
  OrderVolumeChart,
  RiskMatrix,
  OpportunityList,
  InsightsList,
  RecentActivity,
};

export default {
  ProcurementDashboard,
  MarketIntelligenceDashboard,
  SupplierList,
  SupplierOnboardingForm,
  ContractList,
  AutonomousPOForm,
};
