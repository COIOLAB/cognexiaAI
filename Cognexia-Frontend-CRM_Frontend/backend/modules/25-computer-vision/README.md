# Computer Vision Module (25-computer-vision)

## Overview

The **Computer Vision Module** provides advanced visual inspection and analysis capabilities for Industry 5.0 manufacturing environments. It leverages cutting-edge AI and machine learning technologies to perform automated quality inspection, defect detection, and visual analytics for manufacturing processes.

## Features

### Core Vision Capabilities
- **Visual Quality Inspection**: Automated defect detection and classification
- **Object Detection**: Real-time object recognition and tracking
- **Dimensional Measurement**: Precise dimensional analysis and measurement
- **Surface Analysis**: Surface quality assessment and texture analysis
- **Assembly Verification**: Automated assembly completeness checks

### Advanced AI Features
- **Deep Learning Models**: Convolutional Neural Networks for image analysis
- **Real-time Processing**: High-speed image processing and analysis
- **3D Vision**: Stereo vision and depth analysis
- **Adaptive Learning**: Self-improving vision models
- **Edge Deployment**: On-device vision processing

## Architecture

### Technology Stack
- **Framework**: NestJS with TypeScript
- **AI/ML**: TensorFlow.js, OpenCV, YOLO, PyTorch integration
- **Computer Vision**: OpenCV.js, MediaPipe
- **Image Processing**: Sharp, Jimp for image manipulation
- **3D Vision**: Three.js for 3D visualization
- **Hardware Acceleration**: GPU acceleration support

## Key Components

### Vision Analysis Service
```typescript
@Injectable()
export class VisionAnalysisService {
  async analyzeImage(
    imageBuffer: Buffer,
    analysisType: VisionAnalysisType,
    criteria: InspectionCriteria
  ): Promise<VisionAnalysisResult> {
    // Preprocess image
    const preprocessedImage = await this.preprocessImage(imageBuffer);
    
    // Load appropriate model
    const model = await this.loadModel(analysisType);
    
    // Run inference
    const predictions = await model.predict(preprocessedImage);
    
    // Post-process results
    const results = await this.postProcessResults(
      predictions,
      criteria,
      analysisType
    );
    
    // Generate analysis report
    const report = await this.generateAnalysisReport(
      results,
      criteria,
      preprocessedImage
    );
    
    return {
      analysisType,
      results,
      report,
      confidence: results.confidence,
      processingTime: results.processingTime,
      timestamp: new Date(),
    };
  }
}
```

### Defect Detection Service
```typescript
@Injectable()
export class DefectDetectionService {
  async detectDefects(
    image: ImageData,
    defectTypes: DefectType[]
  ): Promise<DefectDetectionResult> {
    const detectedDefects: Defect[] = [];
    
    for (const defectType of defectTypes) {
      // Load defect-specific model
      const model = await this.loadDefectModel(defectType);
      
      // Run defect detection
      const detection = await model.detect(image);
      
      // Filter by confidence threshold
      const validDefects = detection.filter(
        d => d.confidence >= defectType.threshold
      );
      
      detectedDefects.push(...validDefects);
    }
    
    // Remove duplicate detections
    const uniqueDefects = this.removeDuplicateDetections(detectedDefects);
    
    // Calculate overall quality score
    const qualityScore = this.calculateQualityScore(
      uniqueDefects,
      defectTypes
    );
    
    return {
      defects: uniqueDefects,
      qualityScore,
      passFailStatus: qualityScore >= 0.8 ? 'PASS' : 'FAIL',
      recommendations: await this.generateRecommendations(uniqueDefects),
    };
  }
}
```

## API Endpoints

### Image Analysis
- `POST /api/computer-vision/analyze` - Analyze image
- `POST /api/computer-vision/batch-analyze` - Batch image analysis
- `GET /api/computer-vision/analysis/:id` - Get analysis result
- `POST /api/computer-vision/compare` - Compare images

### Quality Inspection
- `POST /api/computer-vision/inspect` - Visual quality inspection
- `POST /api/computer-vision/inspect/defects` - Defect detection
- `GET /api/computer-vision/inspection-results` - Get inspection results
- `POST /api/computer-vision/calibrate` - Calibrate inspection system

### Model Management
- `GET /api/computer-vision/models` - List available models
- `POST /api/computer-vision/models/train` - Train new model
- `PUT /api/computer-vision/models/:id/deploy` - Deploy model
- `GET /api/computer-vision/models/:id/performance` - Model performance

## Real-time Processing

### Stream Processing Service
```typescript
@Injectable()
export class StreamProcessingService {
  async processVideoStream(
    streamUrl: string,
    processingConfig: StreamProcessingConfig
  ): Promise<void> {
    const stream = await this.createVideoStream(streamUrl);
    
    stream.on('frame', async (frame: Frame) => {
      try {
        // Process frame
        const analysis = await this.visionService.analyzeFrame(
          frame,
          processingConfig.analysisType
        );
        
        // Check for alerts
        if (analysis.alertConditions?.length > 0) {
          await this.alertService.sendRealTimeAlert(analysis);
        }
        
        // Store results if needed
        if (processingConfig.storeResults) {
          await this.storeAnalysisResult(analysis);
        }
        
        // Emit real-time updates
        this.eventEmitter.emit('vision-analysis', analysis);
        
      } catch (error) {
        this.logger.error(`Frame processing error: ${error.message}`);
      }
    });
  }
}
```

## Configuration

### Environment Variables
```env
# Computer Vision Configuration
VISION_GPU_ACCELERATION=true
MAX_IMAGE_SIZE=10MB
BATCH_PROCESSING_SIZE=32
MODEL_INFERENCE_TIMEOUT=5000

# AI/ML Configuration
DEFAULT_CONFIDENCE_THRESHOLD=0.8
MODEL_UPDATE_INTERVAL=24h
CONTINUOUS_LEARNING=true

# Hardware Configuration
CUDA_ENABLED=true
OPENCV_THREADS=8
GPU_MEMORY_LIMIT=4GB
```

## Integration Points

- **Quality Module**: Automated quality inspection integration
- **Shop Floor Control**: Real-time production monitoring
- **IoT Module**: Camera and sensor data integration
- **Analytics Module**: Vision analytics and reporting
- **Digital Twin**: Visual twin validation

## Testing

### Test Coverage
- Unit Tests: 92%+
- Integration Tests: 87%+
- Vision Tests: 94%+
- Performance Tests: 88%+

## License

This module is part of the Industry 5.0 ERP system and is licensed under the MIT License.

## Support

For technical support:
- Email: computer-vision@ezai-mfgninja.com
- Documentation: https://docs.ezai-mfgninja.com/computer-vision
- Issue Tracker: https://github.com/ezai-mfg-ninja/industry5.0-computer-vision/issues
