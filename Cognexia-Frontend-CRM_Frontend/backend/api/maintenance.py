from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from ..services.maintenance import MaintenanceService
from ..models.maintenance import TaskStatus, SensorType, AlertSeverity

router = APIRouter(prefix="/api/maintenance")

# Request/Response Models
class TaskCreate(BaseModel):
    work_order_id: str
    name: str
    description: str
    estimated_duration: Optional[int] = None

class TaskUpdate(BaseModel):
    status: TaskStatus
    actual_duration: Optional[int] = None

class SparePartUpdate(BaseModel):
    part_number: str
    quantity: int

class MaintenanceRecord(BaseModel):
    equipment_id: str
    maintenance_type: str
    description: str
    performed_by: str
    cost: Optional[float] = None

class SensorReading(BaseModel):
    sensor_id: str
    value: float

class PredictiveModelUpdate(BaseModel):
    equipment_type: str
    accuracy: float
    parameters: dict

class TechnicianAssignment(BaseModel):
    task_id: str
    required_skills: List[str]

# API Routes
@router.post("/tasks")
async def create_maintenance_task(task: TaskCreate):
    """Create a new maintenance task"""
    try:
        result = MaintenanceService.create_task(
            task.work_order_id,
            task.name,
            task.description,
            task.estimated_duration
        )
        return {"success": True, "task_id": result.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/tasks/{task_id}")
async def update_task(task_id: str, update: TaskUpdate):
    """Update task status and duration"""
    try:
        success = MaintenanceService.update_task_status(
            task_id,
            update.status,
            update.actual_duration
        )
        if not success:
            raise HTTPException(status_code=404, detail="Task not found")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/spare-parts")
async def update_spare_parts(update: SparePartUpdate):
    """Update spare parts inventory"""
    try:
        result = MaintenanceService.manage_spare_parts(
            update.part_number,
            update.quantity
        )
        if not result:
            raise HTTPException(status_code=404, detail="Spare part not found")
        return {"success": True, "current_stock": result.current_stock}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/history")
async def record_maintenance_activity(record: MaintenanceRecord):
    """Record maintenance activity"""
    try:
        result = MaintenanceService.record_maintenance(
            record.equipment_id,
            record.maintenance_type,
            record.description,
            record.performed_by,
            record.cost
        )
        return {"success": True, "record_id": result.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sensors/readings")
async def process_sensor_reading(reading: SensorReading):
    """Process new sensor reading"""
    try:
        alert = MaintenanceService.process_sensor_reading(
            reading.sensor_id,
            reading.value
        )
        response = {"success": True}
        if alert:
            response["alert"] = {
                "id": alert.id,
                "severity": alert.severity,
                "title": alert._data.get("title")
            }
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/models")
async def update_predictive_model(model: PredictiveModelUpdate):
    """Update predictive maintenance model"""
    try:
        result = MaintenanceService.update_predictive_model(
            model.equipment_type,
            model.accuracy,
            model.parameters
        )
        return {"success": True, "model_id": result.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/technicians/assign")
async def assign_technician(assignment: TechnicianAssignment):
    """Assign technician to task"""
    try:
        technician = MaintenanceService.assign_technician(
            assignment.task_id,
            assignment.required_skills
        )
        if not technician:
            raise HTTPException(
                status_code=404,
                detail="No suitable technician found"
            )
        return {
            "success": True,
            "technician_id": technician.id,
            "name": f"{technician._data.get('firstName')} {technician._data.get('lastName')}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/equipment/{equipment_id}/pending")
async def get_pending_maintenance(equipment_id: str):
    """Get pending maintenance for equipment"""
    try:
        tasks = MaintenanceService.get_pending_maintenance(equipment_id)
        return {"success": True, "tasks": tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/equipment/{equipment_id}/history")
async def get_maintenance_history(
    equipment_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """Get maintenance history for equipment"""
    try:
        history = MaintenanceService.get_maintenance_history(
            equipment_id,
            start_date,
            end_date
        )
        return {"success": True, "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts")
async def get_active_alerts(severity: Optional[AlertSeverity] = None):
    """Get active maintenance alerts"""
    try:
        alerts = MaintenanceService.get_active_alerts(severity)
        return {"success": True, "alerts": alerts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
