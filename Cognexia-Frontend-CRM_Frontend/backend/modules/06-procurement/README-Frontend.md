# Industry 5.0 Procurement Frontend SDK

A comprehensive React SDK and component library for the Industry 5.0 Procurement System. This frontend package provides type-safe hooks, reusable components, and a complete example application for building procurement management interfaces.

## 🚀 Features

- **Type-Safe SDK**: Fully typed TypeScript SDK with error handling and retries
- **React Hooks**: Custom hooks for seamless integration with React applications
- **UI Components**: Production-ready components for dashboards, forms, and data visualization
- **Real-time Updates**: Built-in polling and real-time data synchronization
- **Authentication**: Complete auth flow with JWT token management
- **Responsive Design**: Mobile-first responsive components with dark mode support
- **Accessibility**: WCAG compliant with screen reader support

## 📦 Installation

```bash
npm install @industry5.0/procurement-frontend
# or
yarn add @industry5.0/procurement-frontend
```

## 🏁 Quick Start

### 1. Basic Setup

```tsx
import React from 'react';
import ProcurementSDK from '@industry5.0/procurement-frontend/sdk';
import { ProcurementProvider } from '@industry5.0/procurement-frontend/hooks';
import { ProcurementDashboard } from '@industry5.0/procurement-frontend/components';

// Initialize the SDK
const sdk = new ProcurementSDK({
  baseURL: 'https://api.company.com/procurement',
  apiKey: process.env.REACT_APP_PROCUREMENT_API_KEY,
});

function App() {
  return (
    <ProcurementProvider sdk={sdk}>
      <ProcurementDashboard />
    </ProcurementProvider>
  );
}

export default App;
```

### 2. Using Hooks

```tsx
import React from 'react';
import {
  useSuppliers,
  useDashboardMetrics,
  useSupplierOnboarding,
} from '@industry5.0/procurement-frontend/hooks';

function SupplierManagement() {
  // Fetch suppliers with pagination
  const { data: suppliers, loading, error, pagination, setPage } = useSuppliers(
    { status: 'active' }, // filters
    { page: 1, limit: 20 } // pagination
  );

  // Real-time dashboard metrics
  const { data: metrics } = useDashboardMetrics(
    { timeframe: '30d' },
    true // enable real-time updates
  );

  // Supplier onboarding mutation
  const { mutate: onboardSupplier, loading: onboarding } = useSupplierOnboarding();

  const handleOnboard = async (supplierData: any) => {
    try {
      const result = await onboardSupplier({ supplierData });
      console.log('Supplier onboarded:', result);
    } catch (error) {
      console.error('Onboarding failed:', error);
    }
  };

  if (loading) return <div>Loading suppliers...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Total Spend: ${metrics?.totalSpend?.toLocaleString()}</h2>
      <div>
        {suppliers?.map(supplier => (
          <div key={supplier.id}>{supplier.name}</div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Using Components

```tsx
import React, { useState } from 'react';
import {
  SupplierList,
  SupplierOnboardingForm,
  ContractList,
  AutonomousPOForm,
} from '@industry5.0/procurement-frontend/components';

function ProcurementInterface() {
  const [activeView, setActiveView] = useState('suppliers');

  return (
    <div>
      <nav>
        <button onClick={() => setActiveView('suppliers')}>Suppliers</button>
        <button onClick={() => setActiveView('contracts')}>Contracts</button>
        <button onClick={() => setActiveView('orders')}>Purchase Orders</button>
      </nav>

      {activeView === 'suppliers' && (
        <SupplierList
          filters={{ status: 'active' }}
          onSupplierSelect={(supplier) => console.log('Selected:', supplier)}
          selectable
        />
      )}

      {activeView === 'contracts' && (
        <ContractList
          filters={{ status: 'active' }}
          onContractSelect={(contract) => console.log('Selected:', contract)}
        />
      )}

      {activeView === 'orders' && (
        <AutonomousPOForm
          onSuccess={(po) => console.log('PO created:', po)}
        />
      )}
    </div>
  );
}
```

## 📚 API Reference

### SDK Client

The `ProcurementSDK` class provides methods for all procurement operations:

```tsx
import ProcurementSDK from '@industry5.0/procurement-frontend/sdk';

const sdk = new ProcurementSDK({
  baseURL: 'https://api.company.com/procurement',
  timeout: 30000,
  retries: 3,
  apiKey: 'your-api-key',
});

// Set authentication token
sdk.setAuthToken({
  accessToken: 'jwt-token',
  refreshToken: 'refresh-token',
  expiresIn: 3600,
});

// Supplier operations
const suppliers = await sdk.searchSuppliers({ category: 'technology' });
const supplier = await sdk.getSupplier('supplier-id');
const newSupplier = await sdk.onboardSupplier(supplierData);

// Contract operations
const contracts = await sdk.searchContracts({ status: 'active' });
const contract = await sdk.createContract(contractData);
const analysis = await sdk.analyzeContract('contract-id');

// Purchase order operations
const po = await sdk.processAutonomousPO(requestData);
const batchResult = await sdk.batchProcessPOs([request1, request2]);

// Analytics and insights
const metrics = await sdk.getDashboardMetrics({ timeframe: '30d' });
const insights = await sdk.getAIMarketIntelligence();
const forecast = await sdk.getDemandForecast('technology', 6);
```

### React Hooks

#### Data Fetching Hooks

```tsx
// Basic async data fetching
const { data, loading, error, refetch } = useAsync(
  () => sdk.getSupplier('supplier-id'),
  [supplierId] // dependencies
);

// Paginated data
const {
  data,
  loading,
  error,
  pagination,
  setPage,
  nextPage,
  previousPage
} = usePaginated(
  (pagination) => sdk.searchSuppliers({}, pagination),
  1, // initial page
  20 // initial limit
);

// Real-time data with polling
const { data, loading, error } = useRealtime(
  () => sdk.getDashboardMetrics(),
  {
    interval: 30000, // 30 seconds
    enabled: true,
    onUpdate: (newData) => console.log('Data updated:', newData),
    onError: (error) => console.error('Polling error:', error),
  }
);
```

#### Mutation Hooks

```tsx
// Generic mutation
const { mutate, loading, error, data, reset } = useMutation(
  (params) => sdk.onboardSupplier(params)
);

// Specific mutations
const { mutate: createContract } = useContractCreation();
const { mutate: processAutonomousPO } = useAutonomousPO();
const { mutate: recordOnBlockchain } = useBlockchainRecording();

// Usage
const handleSubmit = async () => {
  try {
    const result = await createContract({
      contractData: formData,
      createdBy: currentUser.id,
    });
    console.log('Contract created:', result);
  } catch (error) {
    console.error('Creation failed:', error);
  }
};
```

#### Utility Hooks

```tsx
// Debounced search
const {
  query,
  setQuery,
  results,
  loading,
  error
} = useDebouncedSearch(
  (searchTerm) => sdk.searchSuppliers({ search: searchTerm }),
  300 // debounce delay in ms
);

// Form state management
const {
  values,
  errors,
  touched,
  setValue,
  setFieldTouched,
  setFieldError,
  reset
} = useFormState({
  companyName: '',
  email: '',
  category: '',
});
```

### React Components

#### Dashboard Components

```tsx
import {
  ProcurementDashboard,
  MarketIntelligenceDashboard,
} from '@industry5.0/procurement-frontend/components';

// Main dashboard with real-time metrics
<ProcurementDashboard
  timeframe="30d"
  departments={['IT', 'Operations']}
  className="custom-dashboard"
/>

// Market intelligence dashboard
<MarketIntelligenceDashboard
  category="technology"
  region="global"
/>
```

#### Supplier Components

```tsx
import {
  SupplierList,
  SupplierOnboardingForm,
} from '@industry5.0/procurement-frontend/components';

// Supplier listing with search and filters
<SupplierList
  filters={{ status: 'active', category: 'technology' }}
  onSupplierSelect={(supplier) => setSelectedSupplier(supplier)}
  selectable
/>

// Supplier onboarding form
<SupplierOnboardingForm
  onSuccess={(supplier) => {
    console.log('New supplier:', supplier);
    setShowForm(false);
  }}
  onCancel={() => setShowForm(false)}
/>
```

#### Contract and Purchase Order Components

```tsx
import {
  ContractList,
  AutonomousPOForm,
} from '@industry5.0/procurement-frontend/components';

// Contract management
<ContractList
  filters={{ status: 'active' }}
  onContractSelect={(contract) => setSelectedContract(contract)}
/>

// Autonomous purchase order form
<AutonomousPOForm
  onSuccess={(po) => {
    console.log('PO created:', po);
    refreshOrders();
  }}
/>
```

## 🎨 Styling

The components come with a complete CSS styling system that includes:

- CSS custom properties for theming
- Responsive design with mobile-first approach
- Dark mode support
- Accessibility features
- Print-friendly styles

```css
/* Import the base styles */
@import '@industry5.0/procurement-frontend/styles';

/* Customize theme variables */
:root {
  --primary-500: #your-brand-color;
  --primary-600: #your-brand-color-dark;
}
```

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
REACT_APP_API_URL=https://api.company.com/procurement
REACT_APP_API_KEY=your-api-key

# Optional: Real-time update intervals
REACT_APP_METRICS_INTERVAL=30000
REACT_APP_ALERTS_INTERVAL=15000
```

### SDK Configuration

```tsx
const sdk = new ProcurementSDK({
  // Required
  baseURL: 'https://api.company.com/procurement',
  
  // Optional
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  apiKey: 'your-api-key',
  
  // Request interceptors
  requestInterceptor: (config) => {
    // Add custom headers, logging, etc.
    return config;
  },
  
  // Response interceptors
  responseInterceptor: (response) => {
    // Handle responses, transform data, etc.
    return response;
  },
  
  // Error interceptors
  errorInterceptor: (error) => {
    // Custom error handling, reporting, etc.
    return Promise.reject(error);
  },
});
```

## 🧪 Testing

The package includes comprehensive testing utilities:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { MockProcurementProvider } from '@industry5.0/procurement-frontend/testing';
import { ProcurementDashboard } from '@industry5.0/procurement-frontend/components';

test('renders dashboard with metrics', async () => {
  render(
    <MockProcurementProvider>
      <ProcurementDashboard timeframe="30d" />
    </MockProcurementProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Total Spend')).toBeInTheDocument();
  });
});
```

## 📖 Examples

### Complete Application

```tsx
import React, { useState, useEffect } from 'react';
import ProcurementSDK from '@industry5.0/procurement-frontend/sdk';
import { ProcurementProvider } from '@industry5.0/procurement-frontend/hooks';
import {
  ProcurementDashboard,
  SupplierList,
  ContractList,
} from '@industry5.0/procurement-frontend/components';

const App: React.FC = () => {
  const [sdk] = useState(() => new ProcurementSDK({
    baseURL: process.env.REACT_APP_API_URL!,
    apiKey: process.env.REACT_APP_API_KEY,
  }));

  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ProcurementProvider sdk={sdk}>
      <div className="app">
        <nav>
          <button onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button onClick={() => setActiveTab('suppliers')}>Suppliers</button>
          <button onClick={() => setActiveTab('contracts')}>Contracts</button>
        </nav>

        {activeTab === 'dashboard' && <ProcurementDashboard />}
        {activeTab === 'suppliers' && <SupplierList />}
        {activeTab === 'contracts' && <ContractList />}
      </div>
    </ProcurementProvider>
  );
};

export default App;
```

### Custom Hook Example

```tsx
import { useCallback } from 'react';
import { useProcurementSDK, useMutation } from '@industry5.0/procurement-frontend/hooks';

// Custom hook for supplier analytics
export function useSupplierAnalytics(supplierId: string) {
  const { sdk } = useProcurementSDK();

  const fetchAnalytics = useCallback(async () => {
    const [performance, forecast, riskAssessment] = await Promise.all([
      sdk.getSupplierPerformanceReport(supplierId),
      sdk.getDemandForecast(supplierId),
      sdk.analyzeSupplierWithAI(supplierId),
    ]);

    return {
      performance,
      forecast,
      riskAssessment,
    };
  }, [sdk, supplierId]);

  return useAsync(fetchAnalytics, [supplierId]);
}
```

## 🔄 Real-time Features

### Dashboard Metrics

```tsx
import { useDashboardMetrics } from '@industry5.0/procurement-frontend/hooks';

function LiveDashboard() {
  const { data: metrics, loading } = useDashboardMetrics(
    { timeframe: '30d', departments: ['IT', 'Finance'] },
    true // Enable real-time updates (polls every 30 seconds)
  );

  return (
    <div>
      <h2>Live Procurement Metrics</h2>
      <div>Total Spend: ${metrics?.totalSpend?.toLocaleString()}</div>
      <div>Active Suppliers: {metrics?.activeSuppliers}</div>
      <div>Processing Orders: {metrics?.processingOrders}</div>
    </div>
  );
}
```

### Alert Monitoring

```tsx
import { useDashboardAlerts } from '@industry5.0/procurement-frontend/hooks';

function AlertMonitor() {
  const { data: alerts } = useDashboardAlerts({
    severity: 'high',
    unacknowledgedOnly: true,
  });

  useEffect(() => {
    if (alerts && alerts.length > 0) {
      // Trigger browser notifications
      alerts.forEach(alert => {
        new Notification(alert.title, {
          body: alert.message,
          icon: '/alert-icon.png',
        });
      });
    }
  }, [alerts]);

  return (
    <div className="alert-monitor">
      {alerts?.map(alert => (
        <div key={alert.id} className={`alert alert-${alert.severity}`}>
          {alert.message}
        </div>
      ))}
    </div>
  );
}
```

## 📊 Data Visualization

### Chart Integration

```tsx
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useSupplierAnalytics } from '@industry5.0/procurement-frontend/hooks';

function SupplierSpendChart({ timeframe = '30d' }) {
  const { data: analytics } = useSupplierAnalytics(timeframe);

  const chartData = useMemo(() => {
    return analytics?.spendByCategory?.map(item => ({
      category: item.category,
      amount: item.amount,
      count: item.orderCount,
    })) || [];
  }, [analytics]);

  return (
    <div className="chart-container">
      <h3>Spend by Category</h3>
      <BarChart width={600} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        <Bar dataKey="amount" fill="#3b82f6" />
      </BarChart>
    </div>
  );
}
```

## 🔐 Authentication

### JWT Authentication

```tsx
import { useProcurementSDK } from '@industry5.0/procurement-frontend/hooks';

function AuthenticatedApp() {
  const { sdk, auth } = useProcurementSDK();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const authResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const tokens = await authResponse.json();
      
      // Set the auth token in the SDK
      auth.setToken(tokens);
      
      // SDK will now include the token in all requests
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    auth.setToken(null);
    // Redirect to login page
  };

  if (!auth.isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <ProcurementDashboard />;
}
```

## 🛡️ Error Handling

The SDK provides comprehensive error handling with custom error types:

```tsx
import { ProcurementSDKError } from '@industry5.0/procurement-frontend/sdk';

try {
  const supplier = await sdk.getSupplier('invalid-id');
} catch (error) {
  if (error instanceof ProcurementSDKError) {
    switch (error.type) {
      case 'AUTHENTICATION_ERROR':
        // Handle auth errors
        redirectToLogin();
        break;
      case 'AUTHORIZATION_ERROR':
        // Handle permission errors
        showPermissionDenied();
        break;
      case 'VALIDATION_ERROR':
        // Handle validation errors
        displayValidationErrors(error.details);
        break;
      case 'NOT_FOUND_ERROR':
        // Handle not found
        showNotFoundMessage();
        break;
      case 'RATE_LIMIT_ERROR':
        // Handle rate limiting
        showRateLimitMessage();
        break;
      default:
        // Handle general errors
        showGenericError(error.message);
    }
  }
}
```

## 🎯 Advanced Usage

### Custom Error Boundary

```tsx
import React, { ErrorInfo, ReactNode } from 'react';
import { ProcurementSDKError } from '@industry5.0/procurement-frontend/sdk';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ProcurementErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (error instanceof ProcurementSDKError) {
      // Log to procurement monitoring service
      console.error('Procurement SDK Error:', {
        type: error.type,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
        errorInfo,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong with the procurement system</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Performance Optimization

```tsx
import { memo, useMemo } from 'react';
import { useSuppliers } from '@industry5.0/procurement-frontend/hooks';

// Memoized supplier card for better performance
const SupplierCard = memo<{ supplier: any; onSelect?: (supplier: any) => void }>(
  ({ supplier, onSelect }) => {
    const metrics = useMemo(() => ({
      rating: supplier.rating,
      orders: supplier.orderCount,
      volume: supplier.totalVolume,
    }), [supplier]);

    return (
      <div className="supplier-card" onClick={() => onSelect?.(supplier)}>
        <h4>{supplier.name}</h4>
        <div>Rating: {metrics.rating}/5</div>
        <div>Orders: {metrics.orders}</div>
        <div>Volume: ${metrics.volume?.toLocaleString()}</div>
      </div>
    );
  }
);

// Virtualized list for large datasets
function VirtualizedSupplierList() {
  const { data: suppliers } = useSuppliers({ limit: 1000 });

  const renderItem = useCallback(({ index, style }) => (
    <div style={style}>
      <SupplierCard supplier={suppliers[index]} />
    </div>
  ), [suppliers]);

  return (
    <FixedSizeList
      height={600}
      itemCount={suppliers?.length || 0}
      itemSize={120}
      itemData={suppliers}
    >
      {renderItem}
    </FixedSizeList>
  );
}
```

## 🚀 Deployment

### Building for Production

```bash
# Install dependencies
npm install

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test:coverage

# Build
npm run build
```

### Environment Configuration

Create environment-specific configuration files:

```typescript
// config/production.ts
export const config = {
  api: {
    baseURL: 'https://api.company.com/procurement',
    timeout: 30000,
    retries: 3,
  },
  features: {
    realTimeUpdates: true,
    blockchainIntegration: true,
    aiInsights: true,
  },
  monitoring: {
    errorReporting: true,
    performanceTracking: true,
  },
};
```

## 📈 Performance Monitoring

### Analytics Integration

```tsx
import { useEffect } from 'react';
import { useProcurementSDK } from '@industry5.0/procurement-frontend/hooks';

function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  const { sdk } = useProcurementSDK();

  useEffect(() => {
    // Track SDK usage
    const originalRequest = sdk.request;
    sdk.request = async function(...args) {
      const startTime = Date.now();
      try {
        const result = await originalRequest.apply(this, args);
        
        // Track successful requests
        analytics.track('procurement_api_success', {
          endpoint: args[0],
          duration: Date.now() - startTime,
        });
        
        return result;
      } catch (error) {
        // Track failed requests
        analytics.track('procurement_api_error', {
          endpoint: args[0],
          error: error.message,
          duration: Date.now() - startTime,
        });
        throw error;
      }
    };
  }, [sdk]);

  return <>{children}</>;
}
```

## 🔗 Integration Examples

### With React Router

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  ProcurementDashboard,
  SupplierList,
  ContractList,
} from '@industry5.0/procurement-frontend/components';

function RoutedApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProcurementDashboard />} />
        <Route path="/suppliers" element={<SupplierList />} />
        <Route path="/suppliers/:id" element={<SupplierDetails />} />
        <Route path="/contracts" element={<ContractList />} />
        <Route path="/contracts/:id" element={<ContractDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### With State Management (Zustand)

```tsx
import { create } from 'zustand';
import { ProcurementSDK } from '@industry5.0/procurement-frontend/sdk';

interface ProcurementStore {
  sdk: ProcurementSDK;
  currentUser: any;
  selectedSupplier: any;
  selectedContract: any;
  setSelectedSupplier: (supplier: any) => void;
  setSelectedContract: (contract: any) => void;
}

const useProcurementStore = create<ProcurementStore>((set) => ({
  sdk: new ProcurementSDK({
    baseURL: process.env.REACT_APP_API_URL!,
  }),
  currentUser: null,
  selectedSupplier: null,
  selectedContract: null,
  setSelectedSupplier: (supplier) => set({ selectedSupplier: supplier }),
  setSelectedContract: (contract) => set({ selectedContract: contract }),
}));
```

## 🤝 Contributing

See the main repository's contributing guidelines for information on how to contribute to this project.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions and support:

- 📧 Email: procurement-support@company.com
- 📖 Documentation: https://docs.company.com/procurement
- 🐛 Issues: https://github.com/industry5-0/procurement-frontend/issues
- 💬 Slack: #procurement-dev

## 🔄 Changelog

### v2.0.0
- Complete TypeScript rewrite
- React 18 support with concurrent features
- Real-time data synchronization
- Enhanced error handling
- Improved accessibility
- Dark mode support
- Mobile-responsive design

### v1.5.0
- Added blockchain integration hooks
- Market intelligence components
- AI-powered insights
- Advanced analytics dashboard
- Performance optimizations

### v1.0.0
- Initial release
- Basic supplier and contract management
- Dashboard components
- Authentication integration
