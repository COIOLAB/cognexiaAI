# Quality Management Module (12-quality)

## Overview

The **Quality Management Module** is a comprehensive quality assurance and control system designed for Industry 5.0 manufacturing environments. It provides advanced quality planning, inspection management, statistical process control (SPC), compliance tracking, and AI-powered quality analytics to ensure consistent product quality and regulatory compliance.

## Features

### Core Quality Management
- **Quality Planning**: Comprehensive quality plans and procedures
- **Inspection Management**: Automated and manual inspection workflows
- **Statistical Process Control (SPC)**: Real-time quality monitoring
- **Non-Conformance Management**: Issue tracking and corrective actions
- **Document Control**: Quality documentation and version control

### Advanced Capabilities
- **AI-Powered Quality Analytics**: Machine learning for quality prediction
- **Computer Vision Integration**: Automated visual inspection
- **Supplier Quality Management**: Vendor quality assessment
- **Compliance Management**: Regulatory compliance tracking
- **Quality Cost Analysis**: Cost of quality measurements

## Architecture

### Technology Stack
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL + InfluxDB for quality metrics
- **AI/ML**: TensorFlow.js for quality prediction models
- **Computer Vision**: OpenCV, TensorFlow for visual inspection
- **Statistical Analysis**: R integration for advanced SPC
- **Compliance**: Automated compliance reporting

## Key Components

### Quality Control Service
```typescript
@Injectable()
export class QualityControlService {
  async createQualityPlan(
    productId: string,
    specifications: QualitySpecification[]
  ): Promise<QualityPlan> {
    // Create comprehensive quality plan
    const plan = new QualityPlan({
      productId,
      specifications,
      inspectionPoints: await this.defineInspectionPoints(specifications),
      acceptanceCriteria: await this.defineAcceptanceCriteria(specifications),
      samplingPlan: await this.createSamplingPlan(specifications),
    });
    
    // Generate inspection procedures
    plan.procedures = await this.generateInspectionProcedures(plan);
    
    // Setup SPC charts
    plan.spcCharts = await this.setupSPCCharts(plan);
    
    return await this.qualityPlanRepository.save(plan);
  }
  
  async executeInspection(
    inspectionId: string,
    measurements: QualityMeasurement[]
  ): Promise<InspectionResult> {
    const inspection = await this.inspectionRepository.findById(inspectionId);
    
    // Validate measurements against specifications
    const validationResults = await this.validateMeasurements(
      measurements,
      inspection.specifications
    );
    
    // Update SPC charts
    await this.updateSPCCharts(inspection.productId, measurements);
    
    // Check for non-conformances
    const nonConformances = await this.checkNonConformances(
      measurements,
      inspection.acceptanceCriteria
    );
    
    // Generate inspection result
    const result = new InspectionResult({
      inspectionId,
      measurements,
      validationResults,
      nonConformances,
      overallResult: this.calculateOverallResult(validationResults),
      timestamp: new Date(),
    });
    
    // Trigger corrective actions if needed
    if (nonConformances.length > 0) {
      await this.triggerCorrectiveActions(nonConformances);
    }
    
    return result;
  }
}
```

### Statistical Process Control Service
```typescript
@Injectable()
export class SPCService {
  async updateControlChart(
    chartId: string,
    measurement: QualityMeasurement
  ): Promise<SPCChart> {
    const chart = await this.spcChartRepository.findById(chartId);
    
    // Add new measurement
    chart.addDataPoint(measurement);
    
    // Calculate control limits
    const controlLimits = this.calculateControlLimits(chart.dataPoints);
    chart.updateControlLimits(controlLimits);
    
    // Check for out-of-control conditions
    const outOfControlSignals = await this.detectOutOfControlSignals(chart);
    
    if (outOfControlSignals.length > 0) {
      // Trigger alerts
      await this.alertService.sendSPCAlert(chart, outOfControlSignals);
      
      // Create non-conformance records
      await this.createSPCNonConformances(chart, outOfControlSignals);
    }
    
    // Analyze trends and patterns
    const trendAnalysis = await this.analyzeTrends(chart);
    chart.trendAnalysis = trendAnalysis;
    
    return await this.spcChartRepository.save(chart);
  }
  
  async detectOutOfControlSignals(chart: SPCChart): Promise<OutOfControlSignal[]> {
    const signals: OutOfControlSignal[] = [];
    const recentPoints = chart.getRecentDataPoints(25); // Last 25 points
    
    // Rule 1: Point beyond control limits
    const beyondLimits = this.checkBeyondControlLimits(recentPoints, chart.controlLimits);
    signals.push(...beyondLimits);
    
    // Rule 2: 9 points in a row on same side of center line
    const nineSameSide = this.checkNineConsecutiveSameSide(recentPoints, chart.centerLine);
    signals.push(...nineSameSide);
    
    // Rule 3: 6 points in a row steadily increasing or decreasing
    const sixTrending = this.checkSixConsecutiveTrending(recentPoints);
    signals.push(...sixTrending);
    
    // Rule 4: 14 points in a row alternating up and down
    const fourteenAlternating = this.checkFourteenAlternating(recentPoints);
    signals.push(...fourteenAlternating);
    
    return signals;
  }
}
```

## API Endpoints

### Quality Planning
- `POST /api/quality/plans` - Create quality plan
- `GET /api/quality/plans` - List quality plans
- `PUT /api/quality/plans/:id` - Update quality plan
- `GET /api/quality/plans/:id/procedures` - Get inspection procedures

### Inspection Management
- `POST /api/quality/inspections` - Create inspection
- `PUT /api/quality/inspections/:id/execute` - Execute inspection
- `GET /api/quality/inspections/:id/results` - Get inspection results
- `POST /api/quality/inspections/:id/measurements` - Add measurements

### Statistical Process Control
- `GET /api/quality/spc/charts` - List SPC charts
- `POST /api/quality/spc/charts` - Create SPC chart
- `PUT /api/quality/spc/charts/:id/data` - Add data point
- `GET /api/quality/spc/charts/:id/analysis` - Get trend analysis

### Non-Conformance Management
- `POST /api/quality/non-conformances` - Create non-conformance
- `GET /api/quality/non-conformances` - List non-conformances
- `PUT /api/quality/non-conformances/:id/resolve` - Resolve non-conformance
- `GET /api/quality/non-conformances/analysis` - Non-conformance analysis

## AI-Powered Quality Analytics

### Quality Prediction Service
```typescript
@Injectable()
export class QualityPredictionService {
  async predictQualityIssues(
    productionData: ProductionData,
    historicalQualityData: QualityData[]
  ): Promise<QualityPrediction> {
    // Load trained quality prediction model
    const model = await this.loadQualityPredictionModel();
    
    // Prepare features
    const features = this.extractQualityFeatures(
      productionData,
      historicalQualityData
    );
    
    // Make prediction
    const prediction = model.predict(features);
    
    // Calculate confidence intervals
    const confidence = this.calculateConfidence(prediction, historicalQualityData);
    
    // Generate recommendations
    const recommendations = await this.generateQualityRecommendations(
      prediction,
      productionData
    );
    
    return {
      predictedDefectRate: prediction.defectRate,
      qualityScore: prediction.qualityScore,
      confidence,
      recommendations,
      riskFactors: prediction.riskFactors,
      timestamp: new Date(),
    };
  }
  
  async trainQualityModel(
    trainingData: QualityTrainingData[]
  ): Promise<ModelTrainingResult> {
    // Prepare training dataset
    const dataset = this.prepareTrainingDataset(trainingData);
    
    // Split into training and validation sets
    const { training, validation } = this.splitDataset(dataset, 0.8);
    
    // Create and configure model
    const model = this.createQualityModel();
    
    // Train model
    const history = await model.fit(training.features, training.labels, {
      epochs: 100,
      validationData: [validation.features, validation.labels],
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss=${logs.loss}, accuracy=${logs.accuracy}`);
        }
      }
    });
    
    // Evaluate model performance
    const evaluation = await this.evaluateModel(model, validation);
    
    // Save model
    await this.saveQualityModel(model);
    
    return {
      modelAccuracy: evaluation.accuracy,
      validationLoss: evaluation.loss,
      trainingHistory: history,
      featureImportance: evaluation.featureImportance,
    };
  }
}
```

### Computer Vision Quality Inspection
```typescript
@Injectable()
export class VisualInspectionService {
  async inspectProduct(
    imageData: Buffer,
    inspectionCriteria: VisualInspectionCriteria
  ): Promise<VisualInspectionResult> {
    // Load computer vision model
    const model = await this.loadVisualInspectionModel();
    
    // Preprocess image
    const preprocessedImage = await this.preprocessImage(imageData);
    
    // Run defect detection
    const detectionResults = await this.detectDefects(preprocessedImage, model);
    
    // Classify defect types
    const classificationResults = await this.classifyDefects(
      detectionResults,
      inspectionCriteria
    );
    
    // Calculate quality metrics
    const qualityMetrics = this.calculateVisualQualityMetrics(
      classificationResults,
      inspectionCriteria
    );
    
    // Generate inspection report
    const report = new VisualInspectionResult({
      overallResult: qualityMetrics.overallResult,
      defectsDetected: classificationResults,
      qualityScore: qualityMetrics.qualityScore,
      confidenceLevel: qualityMetrics.confidence,
      processingTime: qualityMetrics.processingTime,
      recommendations: await this.generateVisualRecommendations(classificationResults),
    });
    
    return report;
  }
}
```

## Quality Metrics and KPIs

### Key Quality Indicators
```typescript
interface QualityKPIs {
  // Primary Metrics
  defectRate: number;
  firstPassYield: number;
  overallYield: number;
  customerComplaintRate: number;
  
  // Process Capability
  cpk: number;
  cp: number;
  ppk: number;
  pp: number;
  
  // Cost of Quality
  preventionCosts: number;
  appraisalCosts: number;
  internalFailureCosts: number;
  externalFailureCosts: number;
  
  // Supplier Quality
  supplierDefectRate: number;
  supplierQualityRating: number;
  incomingQualityLevel: number;
}
```

### Quality Dashboard Service
```typescript
@Injectable()
export class QualityDashboardService {
  async generateQualityDashboard(
    timeRange: TimeRange,
    filters: QualityFilters
  ): Promise<QualityDashboard> {
    const [
      qualityMetrics,
      spcAnalysis,
      nonConformanceAnalysis,
      supplierQuality,
      trendAnalysis
    ] = await Promise.all([
      this.calculateQualityMetrics(timeRange, filters),
      this.analyzeSPCData(timeRange, filters),
      this.analyzeNonConformances(timeRange, filters),
      this.analyzeSupplierQuality(timeRange, filters),
      this.analyzeTrends(timeRange, filters),
    ]);
    
    return {
      metrics: qualityMetrics,
      spcCharts: spcAnalysis.charts,
      nonConformances: nonConformanceAnalysis,
      supplierMetrics: supplierQuality,
      trends: trendAnalysis,
      alerts: await this.getActiveQualityAlerts(),
      recommendations: await this.generateQualityRecommendations(qualityMetrics),
    };
  }
}
```

## Compliance Management

### Regulatory Compliance Service
```typescript
@Injectable()
export class ComplianceService {
  async checkCompliance(
    standard: ComplianceStandard,
    auditData: AuditData
  ): Promise<ComplianceReport> {
    let complianceScore = 0;
    const findings: ComplianceFinding[] = [];
    
    // Check against standard requirements
    for (const requirement of standard.requirements) {
      const checkResult = await this.checkRequirement(requirement, auditData);
      
      if (checkResult.compliant) {
        complianceScore += requirement.weight;
      } else {
        findings.push({
          requirementId: requirement.id,
          severity: checkResult.severity,
          description: checkResult.description,
          evidence: checkResult.evidence,
          correctiveActions: await this.suggestCorrectiveActions(requirement),
        });
      }
    }
    
    const overallCompliance = complianceScore / standard.totalPossibleScore;
    
    return {
      standard: standard.name,
      overallComplianceScore: overallCompliance,
      findings,
      recommendedActions: await this.prioritizeCorrectiveActions(findings),
      nextAuditDate: this.calculateNextAuditDate(standard, overallCompliance),
    };
  }
}
```

## Integration Points

### Quality System Integrations
- **Shop Floor Control**: Real-time quality data collection
- **Production Planning**: Quality constraints in planning
- **Supplier Management**: Vendor quality assessments
- **Computer Vision**: Automated visual inspection
- **Laboratory Systems**: LIMS integration
- **Customer Service**: Quality complaint handling

## Configuration

### Environment Variables
```env
# Quality Configuration
QUALITY_SAMPLING_ENABLED=true
SPC_MONITORING_INTERVAL=60000
VISUAL_INSPECTION_ENABLED=true

# AI/ML Configuration
QUALITY_MODEL_UPDATE_INTERVAL=24h
PREDICTION_ACCURACY_THRESHOLD=0.85

# Compliance Configuration
COMPLIANCE_STANDARDS=ISO9001,IATF16949,FDA21CFR
AUDIT_REMINDER_DAYS=30
```

## Testing

### Test Coverage
- Unit Tests: 95%+
- Integration Tests: 90%+
- SPC Tests: 98%+
- Compliance Tests: 92%+

### Testing Commands
```bash
# Run all tests
npm run test

# Run SPC tests
npm run test:spc

# Run computer vision tests
npm run test:vision

# Run compliance tests
npm run test:compliance
```

## Deployment

### Production Deployment
```bash
# Build application
npm run build

# Start production server
npm run start:prod

# Health check
curl http://localhost:3000/api/quality/health
```

## Monitoring and Alerting

### Quality Alerts
- **Out-of-Control Conditions**: SPC chart violations
- **High Defect Rates**: Threshold exceedances
- **Supplier Quality Issues**: Vendor performance alerts
- **Compliance Deviations**: Regulatory compliance alerts
- **Trend Deterioration**: Quality trend warnings

## License

This module is part of the Industry 5.0 ERP system and is licensed under the MIT License.

## Support

For technical support:
- Email: quality@ezai-mfgninja.com
- Documentation: https://docs.ezai-mfgninja.com/quality
- Issue Tracker: https://github.com/ezai-mfg-ninja/industry5.0-quality/issues
