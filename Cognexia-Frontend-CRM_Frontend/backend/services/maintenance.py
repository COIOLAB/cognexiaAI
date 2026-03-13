from datetime import datetime, timedelta
from typing import List, Dict, Optional
from ..models.maintenance import (
    MaintenanceTask, SparePart, MaintenanceHistory,
    EquipmentSensor, PredictiveModel, MaintenanceAlert,
    MaintenanceTechnician, TaskStatus, AlertSeverity
)
from ..sync.manager import sync_manager

class MaintenanceService:
    @staticmethod
    def create_task(work_order_id: str, name: str, description: str, estimated_duration: int = None) -> MaintenanceTask:
        """Create a new maintenance task"""
        task = MaintenanceTask({
            'workOrderId': work_order_id,
            'name': name,
            'description': description,
            'status': TaskStatus.PENDING,
            'estimatedDuration': estimated_duration
        })
        task.save()
        
        # Queue for sync
        sync_manager.queue_change('maintenance_tasks', task.id, 'create', task.to_dict())
        return task

    @staticmethod
    def update_task_status(task_id: str, status: TaskStatus, actual_duration: int = None) -> bool:
        """Update task status and duration"""
        task = MaintenanceTask.get(task_id)
        if not task:
            return False
            
        updates = {'status': status}
        if actual_duration is not None:
            updates['actualDuration'] = actual_duration
            
        task._data.update(updates)
        success = task.save()
        
        if success:
            sync_manager.queue_change('maintenance_tasks', task.id, 'update', task.to_dict())
        return success

    @staticmethod
    def manage_spare_parts(part_number: str, quantity: int) -> Optional[SparePart]:
        """Update spare part inventory"""
        # Find or create spare part
        db = SparePart._db
        existing = db.query(lambda x: x.get('partNumber') == part_number)
        
        if existing:
            part = SparePart(existing[0])
            part.update_stock(quantity)
        else:
            return None
            
        sync_manager.queue_change('spare_parts', part.id, 'update', part.to_dict())
        return part

    @staticmethod
    def record_maintenance(equipment_id: str, maintenance_type: str, description: str,
                         performed_by: str, cost: float = None) -> MaintenanceHistory:
        """Record maintenance activity"""
        history = MaintenanceHistory({
            'equipmentId': equipment_id,
            'maintenanceType': maintenance_type,
            'description': description,
            'performedBy': performed_by,
            'performedDate': datetime.utcnow().isoformat(),
            'cost': cost
        })
        history.save()
        
        sync_manager.queue_change('maintenance_history', history.id, 'create', history.to_dict())
        return history

    @staticmethod
    def process_sensor_reading(sensor_id: str, value: float) -> Optional[MaintenanceAlert]:
        """Process a new sensor reading and create alert if needed"""
        sensor = EquipmentSensor.get(sensor_id)
        if not sensor:
            return None
            
        # Update sensor reading
        sensor.update_reading(value)
        sync_manager.queue_change('equipment_sensors', sensor.id, 'update', sensor.to_dict())
        
        # Check if alert was created
        db = MaintenanceAlert._db
        recent_alerts = db.query(
            lambda x: x.get('equipmentId') == sensor.equipment_id and not x.get('isResolved'),
            limit=1
        )
        
        return MaintenanceAlert(recent_alerts[0]) if recent_alerts else None

    @staticmethod
    def update_predictive_model(equipment_type: str, accuracy: float, parameters: Dict) -> PredictiveModel:
        """Update or create predictive maintenance model"""
        db = PredictiveModel._db
        existing = db.query(lambda x: x.get('equipmentType') == equipment_type)
        
        if existing:
            model = PredictiveModel(existing[0])
            model._data.update({
                'accuracy': accuracy,
                'parameters': parameters,
                'lastTrained': datetime.utcnow().isoformat()
            })
        else:
            model = PredictiveModel({
                'equipmentType': equipment_type,
                'modelName': f"pred_model_{equipment_type}",
                'modelType': 'predictive_maintenance',
                'accuracy': accuracy,
                'parameters': parameters,
                'lastTrained': datetime.utcnow().isoformat()
            })
        
        model.save()
        sync_manager.queue_change('predictive_models', model.id, 'update', model.to_dict())
        return model

    @staticmethod
    def assign_technician(task_id: str, required_skills: List[str]) -> Optional[MaintenanceTechnician]:
        """Find and assign suitable technician for a task"""
        db = MaintenanceTechnician._db
        available_technicians = db.query(
            lambda x: x.get('isActive') and 
                     all(skill in x.get('skills', []) for skill in required_skills)
        )
        
        if not available_technicians:
            return None
            
        # Simple assignment - choose first available technician
        technician = MaintenanceTechnician(available_technicians[0])
        
        # Update task with assigned technician
        task = MaintenanceTask.get(task_id)
        if task:
            task._data['assignedTechnicianId'] = technician.id
            task.save()
            sync_manager.queue_change('maintenance_tasks', task.id, 'update', task.to_dict())
            
        return technician

    @staticmethod
    def get_pending_maintenance(equipment_id: str) -> List[Dict]:
        """Get pending maintenance tasks for equipment"""
        db = MaintenanceTask._db
        tasks = db.query(
            lambda x: x.get('equipmentId') == equipment_id and 
                     x.get('status') in [TaskStatus.PENDING, TaskStatus.IN_PROGRESS]
        )
        return tasks

    @staticmethod
    def get_maintenance_history(equipment_id: str, start_date: datetime = None,
                              end_date: datetime = None) -> List[Dict]:
        """Get maintenance history for equipment"""
        db = MaintenanceHistory._db
        
        def date_filter(x):
            performed_date = datetime.fromisoformat(x.get('performedDate'))
            return (x.get('equipmentId') == equipment_id and
                    (not start_date or performed_date >= start_date) and
                    (not end_date or performed_date <= end_date))
        
        history = db.query(date_filter)
        return sorted(history, key=lambda x: x.get('performedDate'), reverse=True)

    @staticmethod
    def get_active_alerts(severity: AlertSeverity = None) -> List[Dict]:
        """Get active maintenance alerts"""
        db = MaintenanceAlert._db
        
        def alert_filter(x):
            return (not x.get('isResolved') and
                    (not severity or x.get('severity') == severity))
        
        alerts = db.query(alert_filter)
        return sorted(alerts, key=lambda x: x.get('createdAt'), reverse=True)
