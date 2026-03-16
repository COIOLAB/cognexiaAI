# Manufacturing Module API Documentation

## 📋 Overview

This document provides comprehensive API documentation for the Manufacturing Module, including all endpoints, request/response formats, authentication requirements, and usage examples.

## 🔐 Authentication

All API endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Getting an Authentication Token

```typescript
// Example login to get JWT token
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

const { token } = await response.json();
```

## 🏭 Work Centers API

### GET /manufacturing/work-centers

Retrieve all work centers with optional filtering and pagination.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `department` | string | No | Filter by department name |
| `status` | string | No | Filter by status (OPERATIONAL, MAINTENANCE, BREAKDOWN, OFFLINE) |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20) |
| `search` | string | No | Search in name, code, or description |

**Example Request:**
```http
GET /manufacturing/work-centers?department=Machining&status=OPERATIONAL&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "CNC Machine Center 1",
      "code": "CNC001",
      "description": "High precision CNC machining center",
      "department": "Machining",
      "location": "Building A, Floor 2",
      "capacity_per_hour": 50,
      "current_efficiency": 85.5,
      "status": "OPERATIONAL",
      "cost_per_hour": 125.00,
      "setup_time_minutes": 30,
      "teardown_time_minutes": 15,
      "ai_optimization_enabled": true,
      "energy_efficiency_rating": 4.2,
      "carbon_footprint": 12.5,
      "worker_safety_rating": 9.8,
      "equipment_type": "CNC_MILL",
      "manufacturer": "FANUC",
      "model": "ROBODRILL α-T21iFL",
      "serial_number": "SN12345",
      "installation_date": "2023-01-15",
      "last_maintenance_date": "2024-01-10T14:30:00Z",
      "next_maintenance_date": "2024-04-10T14:30:00Z",
      "digital_twin_id": "dt-550e8400-e29b-41d4-a716",
      "iot_sensors": [
        {
          "type": "temperature",
          "id": "temp_001",
          "location": "spindle"
        },
        {
          "type": "vibration",
          "id": "vib_001",
          "location": "base"
        }
      ],
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "is_active": true,
      "version": 1,
      "tags": ["precision", "automated", "high-volume"],
      "custom_fields": {
        "certifications": ["ISO 9001", "AS9100"],
        "max_workpiece_size": "500x400x300mm"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### POST /manufacturing/work-centers

Create a new work center.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Assembly Line 2",
  "code": "ASM002",
  "description": "Secondary assembly line for medium-volume production",
  "department": "Assembly",
  "location": "Building B, Floor 1",
  "capacity_per_hour": 100,
  "cost_per_hour": 75.00,
  "setup_time_minutes": 45,
  "equipment_type": "ASSEMBLY_LINE",
  "manufacturer": "Bosch Rexroth",
  "ai_optimization_enabled": true,
  "sustainability_metrics": {
    "energy_target": 85.0,
    "waste_reduction_goal": 15.0
  },
  "tags": ["assembly", "medium-volume"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Assembly Line 2",
    "code": "ASM002",
    "description": "Secondary assembly line for medium-volume production",
    "department": "Assembly",
    "location": "Building B, Floor 1",
    "capacity_per_hour": 100,
    "current_efficiency": 100.00,
    "status": "OPERATIONAL",
    "cost_per_hour": 75.00,
    "setup_time_minutes": 45,
    "teardown_time_minutes": 0,
    "ai_optimization_enabled": true,
    "created_at": "2024-01-20T10:30:00Z",
    "updated_at": "2024-01-20T10:30:00Z",
    "is_active": true,
    "version": 1
  }
}
```

### PUT /manufacturing/work-centers/:id

Update an existing work center.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "current_efficiency": 92.5,
  "status": "OPERATIONAL",
  "last_maintenance_date": "2024-01-20T09:00:00Z",
  "next_maintenance_date": "2024-04-20T09:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "current_efficiency": 92.5,
    "status": "OPERATIONAL",
    "last_maintenance_date": "2024-01-20T09:00:00Z",
    "next_maintenance_date": "2024-04-20T09:00:00Z",
    "updated_at": "2024-01-20T11:15:00Z",
    "version": 2
  }
}
```

### DELETE /manufacturing/work-centers/:id

Soft delete a work center (sets is_active to false).

**Response:**
```json
{
  "success": true,
  "message": "Work center deleted successfully"
}
```

## 📦 Production Orders API

### GET /manufacturing/production-orders

Retrieve production orders with filtering and sorting.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status (PLANNING, SCHEDULED, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED) |
| `priority` | string | No | Filter by priority (LOW, MEDIUM, HIGH, CRITICAL) |
| `start_date` | string | No | Filter orders starting after this date (ISO format) |
| `end_date` | string | No | Filter orders ending before this date (ISO format) |
| `product_code` | string | No | Filter by product code |
| `production_line_id` | string | No | Filter by assigned production line |
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |
| `sort` | string | No | Sort by field (created_at, planned_start_date, priority) |
| `order` | string | No | Sort order (asc, desc) |

**Example Request:**
```http
GET /manufacturing/production-orders?status=IN_PROGRESS&priority=HIGH&sort=planned_start_date&order=asc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "order_number": "PO20240120001",
      "product_code": "WIDGET-001",
      "quantity_planned": 1000,
      "quantity_completed": 650,
      "quantity_scrapped": 15,
      "planned_start_date": "2024-01-15T08:00:00Z",
      "planned_end_date": "2024-01-22T17:00:00Z",
      "actual_start_date": "2024-01-15T08:15:00Z",
      "actual_end_date": null,
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "progress_percentage": 65.0,
      "current_operation": "Assembly",
      "bill_of_materials": {
        "id": "bom-001",
        "product_name": "Widget Type A",
        "version": "1.2"
      },
      "assigned_production_line": {
        "id": "line-001",
        "name": "Main Production Line",
        "code": "MAIN001"
      },
      "estimated_cost": 15000.00,
      "actual_cost": 9750.00,
      "cost_variance": -5250.00,
      "quality_requirements": {
        "dimensional_tolerance": "±0.1mm",
        "surface_finish": "Ra 1.6",
        "material_cert_required": true
      },
      "quality_results": {
        "first_pass_yield": 0.985,
        "defect_rate": 0.015
      },
      "ai_optimization_applied": {
        "schedule_optimization": true,
        "route_optimization": true,
        "quality_prediction": true
      },
      "sustainability_impact": {
        "energy_consumption_kwh": 245.5,
        "carbon_footprint_kg": 123.2,
        "waste_generated_kg": 12.8
      },
      "created_at": "2024-01-10T14:30:00Z",
      "updated_at": "2024-01-20T16:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### POST /manufacturing/production-orders

Create a new production order.

**Request Body:**
```json
{
  "product_code": "WIDGET-002",
  "quantity_planned": 500,
  "planned_start_date": "2024-01-25T08:00:00Z",
  "planned_end_date": "2024-01-30T17:00:00Z",
  "priority": "MEDIUM",
  "bill_of_materials_id": "bom-002",
  "assigned_production_line_id": "line-002",
  "customer_order_reference": "CO-2024-0156",
  "quality_requirements": {
    "dimensional_tolerance": "±0.05mm",
    "surface_finish": "Ra 0.8",
    "material_cert_required": true,
    "inspection_frequency": "every_100_units"
  },
  "sustainability_goals": {
    "energy_efficiency_target": 90.0,
    "waste_reduction_target": 10.0
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "order_number": "PO20240120002",
    "product_code": "WIDGET-002",
    "quantity_planned": 500,
    "quantity_completed": 0,
    "quantity_scrapped": 0,
    "planned_start_date": "2024-01-25T08:00:00Z",
    "planned_end_date": "2024-01-30T17:00:00Z",
    "priority": "MEDIUM",
    "status": "PLANNING",
    "progress_percentage": 0.0,
    "estimated_cost": 7500.00,
    "actual_cost": 0.00,
    "created_at": "2024-01-20T15:30:00Z",
    "updated_at": "2024-01-20T15:30:00Z"
  }
}
```

## 🔧 Work Orders API

### GET /manufacturing/work-orders

Retrieve work orders with filtering.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `production_order_id` | string | No | Filter by production order |
| `work_center_id` | string | No | Filter by work center |
| `status` | string | No | Filter by status |
| `operation_type` | string | No | Filter by operation type |
| `assigned_worker` | string | No | Filter by assigned worker |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440000",
      "work_order_number": "WO20240120001",
      "production_order_id": "770e8400-e29b-41d4-a716-446655440000",
      "work_center_id": "550e8400-e29b-41d4-a716-446655440000",
      "operation_sequence": 10,
      "operation_name": "Rough Machining",
      "operation_description": "Rough machine the part to near-net shape",
      "operation_type": "PRODUCTION",
      "planned_start_time": "2024-01-15T08:00:00Z",
      "planned_end_time": "2024-01-15T12:00:00Z",
      "actual_start_time": "2024-01-15T08:15:00Z",
      "actual_end_time": "2024-01-15T11:45:00Z",
      "setup_time_minutes": 45,
      "run_time_minutes": 210,
      "queue_time_minutes": 15,
      "quantity_planned": 100,
      "quantity_completed": 98,
      "quantity_scrapped": 2,
      "status": "COMPLETED",
      "progress_percentage": 100.0,
      "priority": "HIGH",
      "required_skills": ["cnc_machining", "blueprint_reading"],
      "assigned_workers": [
        {
          "worker_id": "worker-001",
          "name": "John Smith",
          "role": "Machine Operator"
        }
      ],
      "required_tools": ["end_mill_10mm", "drill_5mm", "measuring_tools"],
      "work_instructions": "Follow blueprint BP-WIDGET-001-Rev-C. Set spindle speed to 1200 RPM, feed rate 300 mm/min.",
      "quality_specifications": {
        "dimensional_checks": ["length", "width", "height"],
        "surface_finish": "Ra 3.2",
        "inspection_points": 5
      },
      "safety_requirements": ["safety_glasses", "hearing_protection", "closed_toe_shoes"]
    }
  ]
}
```

### POST /manufacturing/work-orders

Create a new work order.

**Request Body:**
```json
{
  "production_order_id": "770e8400-e29b-41d4-a716-446655440000",
  "work_center_id": "550e8400-e29b-41d4-a716-446655440000",
  "operation_sequence": 20,
  "operation_name": "Finish Machining",
  "operation_description": "Finish machine to final dimensions",
  "operation_type": "PRODUCTION",
  "planned_start_time": "2024-01-15T13:00:00Z",
  "planned_end_time": "2024-01-15T16:00:00Z",
  "setup_time_minutes": 30,
  "run_time_minutes": 150,
  "quantity_planned": 98,
  "priority": "HIGH",
  "required_skills": ["precision_machining", "measurement"],
  "required_tools": ["finish_end_mill_6mm", "precision_measuring_tools"],
  "work_instructions": "Finish to final dimensions per blueprint. Maintain ±0.02mm tolerance.",
  "quality_specifications": {
    "dimensional_tolerance": "±0.02mm",
    "surface_finish": "Ra 0.8",
    "inspection_frequency": "every_10_units"
  }
}
```

## 🔍 Quality Checks API

### GET /manufacturing/quality-checks

Retrieve quality check records.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status (PENDING, PASSED, FAILED, IN_REVIEW) |
| `check_type` | string | No | Filter by check type |
| `work_order_id` | string | No | Filter by work order |
| `inspector_id` | string | No | Filter by inspector |
| `date_from` | string | No | Filter checks from date |
| `date_to` | string | No | Filter checks to date |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440000",
      "check_number": "QC20240120001",
      "work_order_id": "990e8400-e29b-41d4-a716-446655440000",
      "production_order_id": "770e8400-e29b-41d4-a716-446655440000",
      "check_type": "DIMENSIONAL",
      "check_description": "Dimensional inspection of critical features",
      "check_parameters": {
        "features": ["length", "width", "height", "hole_diameter"],
        "measurement_method": "coordinate_measuring_machine",
        "temperature": "20°C ± 1°C"
      },
      "acceptance_criteria": {
        "length": {"nominal": 100.0, "tolerance": "±0.05"},
        "width": {"nominal": 50.0, "tolerance": "±0.03"},
        "height": {"nominal": 25.0, "tolerance": "±0.02"},
        "hole_diameter": {"nominal": 10.0, "tolerance": "+0.02/-0.00"}
      },
      "scheduled_time": "2024-01-15T14:00:00Z",
      "performed_time": "2024-01-15T14:15:00Z",
      "inspector_id": "inspector-001",
      "status": "PASSED",
      "results": {
        "length": 100.02,
        "width": 49.98,
        "height": 25.01,
        "hole_diameter": 10.01
      },
      "measurements": [
        {
          "feature": "length",
          "measured_value": 100.02,
          "nominal_value": 100.0,
          "tolerance": "±0.05",
          "deviation": 0.02,
          "status": "PASS"
        }
      ],
      "defects_found": [],
      "corrective_actions": [],
      "statistical_data": {
        "cp": 1.67,
        "cpk": 1.45,
        "mean": 100.015,
        "std_dev": 0.018
      },
      "approved_by": "supervisor-001",
      "approved_at": "2024-01-15T14:30:00Z"
    }
  ]
}
```

### POST /manufacturing/quality-checks

Create a new quality check.

**Request Body:**
```json
{
  "work_order_id": "990e8400-e29b-41d4-a716-446655440000",
  "check_type": "SURFACE_FINISH",
  "check_description": "Surface finish measurement on critical surfaces",
  "check_parameters": {
    "surfaces": ["top_surface", "side_surface_a"],
    "measurement_method": "profilometer",
    "cutoff_length": "0.8mm"
  },
  "acceptance_criteria": {
    "top_surface": {"max_ra": 1.6},
    "side_surface_a": {"max_ra": 3.2}
  },
  "scheduled_time": "2024-01-15T16:00:00Z",
  "inspector_id": "inspector-002"
}
```

## 🤖 IoT Devices API

### GET /manufacturing/iot-devices

Retrieve IoT devices and their current status.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `device_type` | string | No | Filter by device type |
| `work_center_id` | string | No | Filter by work center |
| `status` | string | No | Filter by device status |
| `location` | string | No | Filter by physical location |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440000",
      "device_id": "TEMP_001",
      "device_name": "Temperature Sensor - Spindle",
      "device_type": "TEMPERATURE",
      "work_center_id": "550e8400-e29b-41d4-a716-446655440000",
      "physical_location": "CNC Spindle Housing",
      "installation_date": "2023-01-15",
      "configuration": {
        "sample_rate": 1000,
        "units": "celsius",
        "range": {"min": -10, "max": 150},
        "alarm_thresholds": {"high": 80, "critical": 100}
      },
      "firmware_version": "v2.1.3",
      "software_version": "v1.0.8",
      "communication_protocol": "MQTT",
      "status": "OPERATIONAL",
      "health_score": 98.5,
      "last_communication": "2024-01-20T16:45:00Z",
      "battery_level": 85.0,
      "signal_strength": 92.0,
      "sensor_types": ["temperature", "vibration"],
      "data_collection_frequency": "1Hz",
      "alert_thresholds": {
        "temperature_high": 80,
        "temperature_critical": 100,
        "vibration_high": 0.5,
        "communication_timeout": 300
      },
      "current_readings": {
        "temperature": 45.2,
        "vibration": 0.12,
        "timestamp": "2024-01-20T16:45:00Z"
      },
      "calibration_due_date": "2024-06-15",
      "warranty_expiry_date": "2026-01-15"
    }
  ]
}
```

### POST /manufacturing/iot-devices

Register a new IoT device.

**Request Body:**
```json
{
  "device_id": "PRESSURE_001",
  "device_name": "Hydraulic Pressure Sensor",
  "device_type": "PRESSURE",
  "work_center_id": "550e8400-e29b-41d4-a716-446655440000",
  "physical_location": "Hydraulic System - Main Line",
  "configuration": {
    "sample_rate": 10,
    "units": "bar",
    "range": {"min": 0, "max": 300},
    "alarm_thresholds": {"low": 50, "high": 250, "critical": 280}
  },
  "communication_protocol": "MQTT",
  "sensor_types": ["pressure"],
  "data_collection_frequency": "10Hz",
  "installation_date": "2024-01-20"
}
```

### PUT /manufacturing/iot-devices/:deviceId/readings

Update device readings (typically called by IoT devices).

**Request Body:**
```json
{
  "readings": {
    "pressure": 125.5,
    "temperature": 42.1,
    "flow_rate": 15.2,
    "timestamp": "2024-01-20T16:50:00Z"
  },
  "device_status": {
    "battery_level": 87.0,
    "signal_strength": 95.0,
    "health_score": 99.2
  }
}
```

## 🔄 Digital Twins API

### GET /manufacturing/digital-twins

Retrieve digital twin configurations and data.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `twin_type` | string | No | Filter by twin type (EQUIPMENT, PROCESS, PRODUCT, FACILITY) |
| `asset_type` | string | No | Filter by asset type |
| `work_center_id` | string | No | Filter by work center |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440000",
      "twin_name": "CNC Machine Digital Twin",
      "twin_type": "EQUIPMENT",
      "physical_asset_id": "550e8400-e29b-41d4-a716-446655440000",
      "asset_type": "CNC_MACHINE",
      "work_center_id": "550e8400-e29b-41d4-a716-446655440000",
      "model_definition": {
        "geometry": "3d_cad_model.step",
        "kinematics": "machine_kinematics.json",
        "control_system": "fanuc_control_model.xml"
      },
      "simulation_parameters": {
        "spindle_speed_rpm": 1200,
        "feed_rate_mm_min": 300,
        "cutting_depth_mm": 2.0,
        "coolant_flow_rate": 5.0
      },
      "physics_models": [
        "thermal_model",
        "vibration_model",
        "cutting_force_model"
      ],
      "data_sources": [
        "TEMP_001",
        "VIB_001",
        "POWER_001"
      ],
      "real_time_sync_enabled": true,
      "sync_frequency": "REAL_TIME",
      "last_sync_time": "2024-01-20T16:45:00Z",
      "simulation_results": {
        "predicted_tool_life": 145.5,
        "thermal_distribution": "thermal_map.json",
        "vibration_analysis": "vibration_spectrum.json",
        "energy_consumption": 12.5
      },
      "predictive_analytics": {
        "next_maintenance_date": "2024-04-15T09:00:00Z",
        "failure_risk_score": 0.15,
        "performance_optimization": {
          "recommended_speed": 1150,
          "recommended_feed": 320
        }
      },
      "optimization_recommendations": [
        {
          "type": "energy_efficiency",
          "description": "Reduce spindle speed by 50 RPM during light cuts",
          "potential_savings": "8% energy reduction"
        }
      ],
      "status": "OPERATIONAL",
      "accuracy_score": 94.2,
      "model_confidence": 91.8,
      "last_validation_date": "2024-01-10"
    }
  ]
}
```

### PUT /manufacturing/digital-twins/:id/sync

Update digital twin with real-time data.

**Request Body:**
```json
{
  "real_time_data": {
    "temperature": 45.2,
    "vibration": 0.12,
    "spindle_speed": 1200,
    "power_consumption": 12.5,
    "timestamp": "2024-01-20T16:50:00Z"
  },
  "simulation_parameters": {
    "ambient_temperature": 22.0,
    "material_hardness": 35
  }
}
```

## 📊 Manufacturing Dashboard API

### GET /manufacturing/dashboard

Get comprehensive dashboard data for manufacturing overview.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `time_period` | string | No | Time period for metrics (today, week, month, quarter) |
| `production_line_id` | string | No | Filter by production line |
| `department` | string | No | Filter by department |

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "timestamp": "2024-01-20T17:00:00Z",
      "time_period": "today"
    },
    "production_orders": {
      "total": 45,
      "in_progress": 12,
      "completed": 28,
      "on_hold": 3,
      "cancelled": 2,
      "avg_progress": 67.5,
      "completion_rate": 0.622,
      "on_time_delivery": 0.893
    },
    "work_centers": {
      "total": 8,
      "operational": 7,
      "maintenance": 1,
      "breakdown": 0,
      "offline": 0,
      "avg_efficiency": 87.2,
      "avg_utilization": 82.5,
      "avg_oee": 73.8
    },
    "quality_metrics": {
      "defect_rate": 0.012,
      "first_pass_yield": 0.986,
      "scrap_rate": 0.008,
      "rework_rate": 0.004,
      "customer_complaints": 2,
      "quality_cost_percentage": 1.2
    },
    "production_performance": {
      "planned_vs_actual": {
        "planned_units": 5000,
        "actual_units": 4750,
        "variance": -250,
        "variance_percentage": -5.0
      },
      "throughput": {
        "units_per_hour": 187.5,
        "cycle_time_avg": 19.2,
        "takt_time": 20.0
      }
    },
    "sustainability_metrics": {
      "energy_consumption_kwh": 1245.5,
      "energy_efficiency": 87.2,
      "carbon_footprint_kg": 623.2,
      "waste_generated_kg": 45.8,
      "water_consumption_liters": 892.5,
      "renewable_energy_percentage": 35.0
    },
    "industry_5_0_metrics": {
      "human_centric_score": 8.7,
      "sustainability_score": 8.2,
      "resilience_score": 7.9,
      "ai_optimization_usage": 0.75,
      "human_robot_collaboration": 0.68
    },
    "alerts": [
      {
        "id": "alert-001",
        "type": "QUALITY",
        "severity": "MEDIUM",
        "message": "Defect rate trending upward on Assembly Line 1",
        "timestamp": "2024-01-20T16:30:00Z",
        "source": "quality_monitoring"
      },
      {
        "id": "alert-002",
        "type": "MAINTENANCE",
        "severity": "LOW",
        "message": "Scheduled maintenance due for CNC Machine Center 2",
        "timestamp": "2024-01-20T15:45:00Z",
        "source": "predictive_maintenance"
      }
    ],
    "trends": {
      "efficiency_trend": {
        "current": 87.2,
        "previous_period": 85.1,
        "change": 2.1,
        "direction": "up"
      },
      "quality_trend": {
        "current": 0.986,
        "previous_period": 0.982,
        "change": 0.004,
        "direction": "up"
      }
    }
  }
}
```

## 📈 Analytics and Reporting API

### GET /manufacturing/analytics/oee

Get Overall Equipment Effectiveness (OEE) analysis.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `work_center_id` | string | No | Specific work center |
| `date_from` | string | Yes | Start date (ISO format) |
| `date_to` | string | Yes | End date (ISO format) |
| `granularity` | string | No | Data granularity (hour, day, week) |

**Response:**
```json
{
  "success": true,
  "data": {
    "oee_summary": {
      "overall_oee": 73.8,
      "availability": 87.2,
      "performance": 92.1,
      "quality": 91.8
    },
    "work_center_breakdown": [
      {
        "work_center_id": "550e8400-e29b-41d4-a716-446655440000",
        "work_center_name": "CNC Machine Center 1",
        "oee": 78.5,
        "availability": 89.5,
        "performance": 94.2,
        "quality": 93.1,
        "planned_production_time": 480,
        "actual_production_time": 430,
        "ideal_cycle_time": 2.5,
        "total_pieces": 172,
        "good_pieces": 160,
        "downtime_events": [
          {
            "reason": "tool_change",
            "duration_minutes": 25,
            "category": "planned"
          },
          {
            "reason": "material_shortage",
            "duration_minutes": 25,
            "category": "unplanned"
          }
        ]
      }
    ],
    "time_series": [
      {
        "timestamp": "2024-01-20T08:00:00Z",
        "oee": 75.2,
        "availability": 88.0,
        "performance": 91.5,
        "quality": 93.4
      }
    ]
  }
}
```

## 🚨 Error Responses

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "quantity_planned",
      "message": "Must be a positive integer"
    },
    "timestamp": "2024-01-20T17:00:00Z",
    "request_id": "req_123456789"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input parameters |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate code) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `DATABASE_ERROR` | 500 | Database connection or query error |
| `EXTERNAL_SERVICE_ERROR` | 502 | External service unavailable |

## 🔄 Real-time WebSocket Events

### Connection

Connect to WebSocket endpoint:
```
ws://localhost:3000/manufacturing/ws
```

### Authentication

Send authentication message after connection:
```json
{
  "type": "auth",
  "token": "your-jwt-token"
}
```

### Subscription Events

#### Production Order Updates
```json
{
  "type": "subscribe",
  "channel": "production_orders",
  "filters": {
    "status": ["IN_PROGRESS", "COMPLETED"],
    "priority": ["HIGH", "CRITICAL"]
  }
}
```

#### Equipment Status Changes
```json
{
  "type": "subscribe",
  "channel": "equipment_status",
  "filters": {
    "work_center_ids": ["550e8400-e29b-41d4-a716-446655440000"]
  }
}
```

#### Quality Alerts
```json
{
  "type": "subscribe",
  "channel": "quality_alerts",
  "filters": {
    "severity": ["HIGH", "CRITICAL"]
  }
}
```

### Event Messages

Receive real-time updates:
```json
{
  "type": "event",
  "channel": "production_orders",
  "event": "UPDATE",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "progress_percentage": 75.0,
    "status": "IN_PROGRESS",
    "updated_at": "2024-01-20T17:15:00Z"
  },
  "timestamp": "2024-01-20T17:15:00Z"
}
```

## 📋 Rate Limiting

API endpoints are rate limited based on authentication:

| User Type | Requests/Hour | Burst Limit |
|-----------|---------------|-------------|
| Anonymous | 100 | 10/minute |
| Authenticated | 1000 | 50/minute |
| Premium | 5000 | 100/minute |
| System | Unlimited | Unlimited |

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642694400
```

## 🔧 SDK and Code Examples

### JavaScript/TypeScript SDK

```typescript
import { ManufacturingAPI } from '@industry5/manufacturing-sdk';

const api = new ManufacturingAPI({
  baseURL: 'https://api.yourcompany.com',
  apiKey: 'your-api-key'
});

// Get production orders
const orders = await api.productionOrders.list({
  status: 'IN_PROGRESS',
  page: 1,
  limit: 20
});

// Create work center
const workCenter = await api.workCenters.create({
  name: 'New CNC Machine',
  code: 'CNC003',
  department: 'Machining'
});

// Subscribe to real-time updates
api.realtime.subscribe('production_orders', (event) => {
  console.log('Production order updated:', event.data);
});
```

### Python SDK

```python
from industry5_manufacturing import ManufacturingAPI

api = ManufacturingAPI(
    base_url='https://api.yourcompany.com',
    api_key='your-api-key'
)

# Get dashboard data
dashboard = api.dashboard.get(time_period='today')

# Create quality check
quality_check = api.quality_checks.create({
    'work_order_id': 'wo-123',
    'check_type': 'DIMENSIONAL',
    'acceptance_criteria': {
        'length': {'min': 99.8, 'max': 100.2}
    }
})
```

---

For additional support or questions about the API, please refer to the main documentation or contact the development team.
