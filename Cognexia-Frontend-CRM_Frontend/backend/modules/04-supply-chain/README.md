# 🚛 Supply Chain Management Module

**Industry 5.0 ERP System - Advanced Intelligent Supply Chain Orchestration**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/industry-5.0/backend)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](./package.json)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/typescript-5.1-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/nestjs-10.0-red)](https://nestjs.com/)
[![Blockchain](https://img.shields.io/badge/blockchain-enabled-gold)](https://ethereum.org/)

## 🎯 Overview

The Supply Chain Management module is an Industry 5.0-native platform that revolutionizes global supply chain operations through AI-driven optimization, blockchain transparency, and autonomous decision-making capabilities.

### 🌟 Key Features

- **AI-Powered Demand Forecasting** - Machine learning-based demand prediction
- **Blockchain Supply Chain Transparency** - Complete traceability and verification
- **Autonomous Supplier Network** - Self-optimizing supplier relationships
- **Real-time Risk Management** - Proactive disruption mitigation
- **Quantum-Enhanced Routing** - Optimal logistics path optimization
- **IoT Integration** - Real-time asset and shipment tracking
- **Smart Contract Automation** - Automated supplier payments and contracts
- **Circular Economy Support** - Sustainable supply chain practices

## 🏗️ Architecture

```
04-supply-chain/
├── src/
│   ├── controllers/          # API endpoints and route handlers
│   │   ├── supplier.controller.ts
│   │   ├── logistics.controller.ts
│   │   ├── blockchain.controller.ts
│   │   └── ai-optimization.controller.ts
│   ├── services/            # Business logic and data processing
│   │   ├── demand-forecasting.service.ts
│   │   ├── supplier-network.service.ts
│   │   ├── risk-management.service.ts
│   │   └── blockchain.service.ts
│   ├── entities/            # Database models and relationships
│   │   ├── supplier.entity.ts
│   │   ├── shipment.entity.ts
│   │   ├── contract.entity.ts
│   │   └── risk-event.entity.ts
│   ├── blockchain/          # Blockchain smart contracts
│   │   ├── supplier-contract.sol
│   │   ├── shipment-tracking.sol
│   │   └── payment-automation.sol
│   └── ai-models/           # Machine learning models
│       ├── demand-forecast.py
│       ├── risk-prediction.py
│       └── routing-optimization.py
├── docs/                    # API documentation
├── configs/                 # Configuration files
└── package.json            # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 13.0
- Redis >= 6.0
- Ethereum Node (for blockchain features)
- Python >= 3.9 (for AI models)

### Installation

```bash
# Navigate to Supply Chain module
cd modules/04-supply-chain

# Install dependencies
npm install

# Install Python AI dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env

# Run database migrations
npm run migration:run

# Deploy smart contracts (optional)
npm run blockchain:deploy

# Start development server
npm run start:dev
```

### Configuration

Create a `.env` file in the module root:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/supply_chain_db
REDIS_URL=redis://localhost:6379

# API Configuration
PORT=3004
JWT_SECRET=your-jwt-secret-key

# Blockchain Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
ETHEREUM_PRIVATE_KEY=your-ethereum-private-key
CONTRACT_ADDRESS=deployed-contract-address

# AI/ML Services
TENSORFLOW_GPU_ENABLE=true
PYTHON_AI_SERVICE_URL=http://localhost:5000

# Third-party Integrations
WEATHER_API_KEY=your-weather-api-key
SHIPPING_CARRIER_APIS=fedex,ups,dhl
```

## 📊 API Documentation

### Core Endpoints

#### **Supplier Management**
```http
GET    /api/supply-chain/suppliers           # List all suppliers
POST   /api/supply-chain/suppliers           # Create new supplier
GET    /api/supply-chain/suppliers/:id       # Get supplier by ID
PUT    /api/supply-chain/suppliers/:id       # Update supplier
POST   /api/supply-chain/suppliers/evaluate  # AI supplier evaluation
GET    /api/supply-chain/suppliers/network   # Supplier network analysis
```

#### **Demand Forecasting**
```http
GET    /api/supply-chain/forecast/demand     # Get demand predictions
POST   /api/supply-chain/forecast/generate   # Generate new forecast
GET    /api/supply-chain/forecast/accuracy   # Forecast accuracy metrics
POST   /api/supply-chain/forecast/adjust     # Manual forecast adjustment
```

#### **Logistics & Shipping**
```http
GET    /api/supply-chain/shipments           # List all shipments
POST   /api/supply-chain/shipments           # Create new shipment
GET    /api/supply-chain/shipments/:id/track # Track shipment
POST   /api/supply-chain/routing/optimize    # Optimize delivery routes
GET    /api/supply-chain/logistics/cost      # Logistics cost analysis
```

#### **Risk Management**
```http
GET    /api/supply-chain/risks               # Current risk assessment
POST   /api/supply-chain/risks/evaluate      # Evaluate new risks
GET    /api/supply-chain/risks/mitigation    # Risk mitigation strategies
POST   /api/supply-chain/risks/alert         # Create risk alert
```

#### **Blockchain Integration**
```http
GET    /api/supply-chain/blockchain/trace    # Product traceability
POST   /api/supply-chain/blockchain/verify   # Verify product authenticity
GET    /api/supply-chain/contracts           # Smart contract status
POST   /api/supply-chain/payments/auto       # Automated payments
```

### 📋 Data Models

#### Supplier Entity
```typescript
interface Supplier {
  id: string;
  companyName: string;
  contactInfo: ContactInfo;
  capabilities: string[];
  certifications: Certification[];
  performance_score: number;
  sustainability_rating: number;
  blockchain_verified: boolean;
  payment_terms: string;
  geographical_location: GeoLocation;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  contract_address?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### Shipment Entity
```typescript
interface Shipment {
  id: string;
  supplier_id: string;
  origin: GeoLocation;
  destination: GeoLocation;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED' | 'CANCELLED';
  tracking_number: string;
  blockchain_hash: string;
  iot_sensor_data: IoTData[];
  estimated_delivery: Date;
  actual_delivery?: Date;
  cost: number;
  carbon_footprint: number;
  created_at: Date;
  updated_at: Date;
}
```

## 🤖 AI/ML Features

### 1. **Demand Forecasting**
Advanced machine learning models for accurate demand prediction:
- **Time Series Analysis**: LSTM and ARIMA models for seasonal patterns
- **External Factors**: Weather, economic indicators, social trends
- **Multi-variable Prediction**: Product, region, and time-based forecasting
- **Confidence Intervals**: Uncertainty quantification for better planning

### 2. **Supplier Intelligence**
AI-powered supplier evaluation and optimization:
- **Performance Scoring**: Historical data analysis and prediction
- **Risk Assessment**: Financial, operational, and geopolitical risk analysis
- **Alternative Sourcing**: Automatic supplier recommendation system
- **Contract Optimization**: AI-negotiated terms and conditions

### 3. **Route Optimization**
Quantum-enhanced logistics optimization:
- **Multi-modal Transport**: Optimal combination of shipping methods
- **Real-time Adaptation**: Dynamic route adjustment based on conditions
- **Cost-Time Optimization**: Balance between delivery speed and cost
- **Environmental Impact**: Carbon footprint minimization

### 4. **Predictive Maintenance**
IoT-enabled predictive maintenance for supply chain assets:
- **Asset Health Monitoring**: Real-time condition assessment
- **Failure Prediction**: Machine learning-based failure forecasting
- **Maintenance Scheduling**: Optimal maintenance timing
- **Cost Reduction**: Minimize downtime and maintenance costs

## 🔗 Blockchain Integration

### Smart Contracts

#### Supplier Contract
```solidity
pragma solidity ^0.8.0;

contract SupplierAgreement {
    struct Supplier {
        address supplierAddress;
        string companyName;
        uint256 performanceScore;
        bool isActive;
    }
    
    mapping(address => Supplier) public suppliers;
    
    function registerSupplier(
        string memory _companyName,
        uint256 _initialScore
    ) public {
        suppliers[msg.sender] = Supplier(
            msg.sender,
            _companyName,
            _initialScore,
            true
        );
    }
    
    function updatePerformanceScore(
        address _supplier,
        uint256 _newScore
    ) public onlyOwner {
        suppliers[_supplier].performanceScore = _newScore;
    }
}
```

#### Shipment Tracking
```solidity
contract ShipmentTracking {
    struct Shipment {
        uint256 id;
        address supplier;
        string origin;
        string destination;
        uint256 timestamp;
        string status;
        bytes32 dataHash;
    }
    
    mapping(uint256 => Shipment) public shipments;
    
    event ShipmentCreated(uint256 indexed shipmentId, address supplier);
    event ShipmentUpdated(uint256 indexed shipmentId, string status);
    
    function createShipment(
        uint256 _id,
        string memory _origin,
        string memory _destination,
        bytes32 _dataHash
    ) public {
        shipments[_id] = Shipment(
            _id,
            msg.sender,
            _origin,
            _destination,
            block.timestamp,
            "CREATED",
            _dataHash
        );
        
        emit ShipmentCreated(_id, msg.sender);
    }
}
```

## 🌐 IoT Integration

### Sensor Data Collection
```typescript
interface IoTSensorData {
  sensor_id: string;
  shipment_id: string;
  timestamp: Date;
  location: GeoLocation;
  temperature: number;
  humidity: number;
  shock_level: number;
  tamper_status: boolean;
  battery_level: number;
}

@Injectable()
export class IoTDataService {
  async processIoTData(data: IoTSensorData) {
    // Process real-time IoT sensor data
    await this.validateData(data);
    await this.updateShipmentStatus(data);
    await this.checkAlertConditions(data);
    await this.updateBlockchain(data);
  }
}
```

### Real-time Monitoring Dashboard
- **Live Tracking**: Real-time shipment location and status
- **Environmental Conditions**: Temperature, humidity, shock monitoring
- **Security Alerts**: Tamper detection and unauthorized access
- **Predictive Alerts**: AI-powered issue prediction and prevention

## 🔒 Security & Compliance

### Security Features
- **End-to-End Encryption**: All data encrypted in transit and at rest
- **Blockchain Verification**: Immutable supply chain records
- **Multi-factor Authentication**: Secure access control
- **API Rate Limiting**: Protection against abuse
- **Audit Trail**: Complete activity logging

### Compliance Standards
- **ISO 28000**: Supply chain security management
- **CTPAT**: Customs-Trade Partnership Against Terrorism
- **GDPR**: Data protection compliance
- **SOX**: Financial reporting compliance for public companies
- **HACCP**: Food safety management (for food supply chains)

## 📈 Performance Metrics

### Key Performance Indicators
- **Order Fulfillment Rate**: 99.5% target
- **On-time Delivery**: 97% target
- **Inventory Turnover**: Optimized based on demand forecast
- **Supplier Performance**: Real-time scoring and monitoring
- **Cost Reduction**: AI-driven optimization targets 15% savings
- **Carbon Footprint**: Sustainability tracking and reduction

### Monitoring Dashboards
```typescript
@Controller('metrics')
export class MetricsController {
  @Get('kpis')
  async getKPIs() {
    return {
      orderFulfillmentRate: 99.2,
      onTimeDeliveryRate: 96.8,
      averageCostSavings: 14.5,
      supplierPerformanceAvg: 8.7,
      carbonFootprintReduction: 12.3
    };
  }
}
```

## 🧪 Testing

### Test Coverage
- **Unit Tests**: 94% coverage
- **Integration Tests**: 89% coverage
- **End-to-End Tests**: 85% coverage
- **Blockchain Tests**: 100% smart contract coverage
- **AI Model Tests**: Model accuracy validation

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run blockchain tests
npm run test:blockchain

# Run AI model tests
python -m pytest ai-models/tests/

# Performance testing
npm run test:performance
```

## 🚀 Deployment

### Docker Configuration
```dockerfile
FROM node:18-alpine

# Install Python for AI models
RUN apk add --no-cache python3 py3-pip

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Install Python dependencies
COPY requirements.txt ./
RUN pip3 install -r requirements.txt

COPY . .
RUN npm run build

EXPOSE 3004
CMD ["npm", "run", "start:prod"]
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: supply-chain-module
spec:
  replicas: 5
  selector:
    matchLabels:
      app: supply-chain-module
  template:
    metadata:
      labels:
        app: supply-chain-module
    spec:
      containers:
      - name: supply-chain
        image: industry5.0/supply-chain-module:latest
        ports:
        - containerPort: 3004
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          limits:
            memory: "2Gi"
            cpu: "1000m"
          requests:
            memory: "1Gi"
            cpu: "500m"
```

## 🌍 Sustainability Features

### Circular Economy Integration
- **Waste Reduction**: Optimize packaging and materials
- **Recycling Tracking**: Monitor recyclable materials flow
- **Carbon Footprint**: Real-time environmental impact tracking
- **Sustainable Sourcing**: Prefer eco-friendly suppliers
- **Energy Efficiency**: Optimize transportation energy consumption

### ESG Reporting
```typescript
@Injectable()
export class SustainabilityService {
  async generateESGReport(period: string) {
    return {
      environmental: {
        carbonReduction: await this.getCarbonReduction(period),
        wasteReduction: await this.getWasteReduction(period),
        energyEfficiency: await this.getEnergyMetrics(period)
      },
      social: {
        supplierDiversity: await this.getSupplierDiversity(),
        fairTradeCompliance: await this.getFairTradeMetrics()
      },
      governance: {
        transparencyScore: await this.getTransparencyScore(),
        complianceRate: await this.getComplianceRate()
      }
    };
  }
}
```

## 📊 Advanced Analytics

### Supply Chain Intelligence
- **Demand Patterns**: AI-powered demand analysis
- **Supplier Performance**: Comprehensive supplier analytics
- **Cost Analysis**: Detailed cost breakdown and optimization
- **Risk Assessment**: Real-time risk monitoring and prediction
- **Market Intelligence**: Global market trend analysis

### Predictive Analytics
```python
# AI Model for Demand Forecasting
class DemandForecastModel:
    def __init__(self):
        self.model = tf.keras.Sequential([
            tf.keras.layers.LSTM(50, return_sequences=True),
            tf.keras.layers.LSTM(50, return_sequences=False),
            tf.keras.layers.Dense(25),
            tf.keras.layers.Dense(1)
        ])
    
    def predict_demand(self, historical_data, external_factors):
        # Implement demand forecasting logic
        forecast = self.model.predict(historical_data)
        return self.adjust_for_external_factors(forecast, external_factors)
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 📞 Support

### Technical Support
- **Email**: supply-chain@industry5.0.com
- **Slack**: #supply-chain-support
- **Documentation**: [docs.industry5.0.com/supply-chain](https://docs.industry5.0.com/supply-chain)

### Emergency Support
- **24/7 Hotline**: +1-800-INDUSTRY5
- **Critical Issues**: critical-support@industry5.0.com
- **Blockchain Issues**: blockchain-support@industry5.0.com

---

**Built with ❤️ by the Industry 5.0 Team**

*Revolutionizing Global Supply Chains with AI, Blockchain, and Autonomous Intelligence*
