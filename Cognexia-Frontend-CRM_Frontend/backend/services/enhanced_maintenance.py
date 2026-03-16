from typing import Dict, List, Optional
from datetime import datetime
from ..models.maintenance import (
    MaintenanceTask, SparePart, MaintenanceHistory,
    EquipmentSensor, PredictiveModel, MaintenanceAlert,
    MaintenanceTechnician, TaskStatus, AlertSeverity
)
from ..ai.core import MLModelManager, AutoMLPipeline, TransferLearningManager
from ..quantum.core import QuantumOptimizer, QuantumAnomalyDetection
from ..nlp.core import IndustryNLP
from ..zerocode.core import WorkflowBuilder, WorkflowManager

class EnhancedMaintenanceService:
    """Enhanced maintenance service with AI, Quantum, and NLP capabilities"""
    
    def __init__(self):
        self.ml_manager = MLModelManager()
        self.auto_ml = AutoMLPipeline()
        self.transfer_learning = TransferLearningManager()
        self.quantum_optimizer = QuantumOptimizer()
        self.quantum_anomaly = QuantumAnomalyDetection()
        self.nlp = IndustryNLP()
        self.workflow_manager = WorkflowManager()
        
        # Initialize default workflows
        self._initialize_workflows()
    
    def optimize_maintenance_schedule(self, tasks: List[Dict],
                                   constraints: Dict) -> Dict:
        """Optimize maintenance schedule using quantum computing"""
        # Convert tasks to quantum-compatible format
        quantum_tasks = [
            {
                'id': task['id'],
                'duration': task.get('estimated_duration', 60),
                'priority': task.get('priority', 1),
                'dependencies': task.get('dependencies', [])
            }
            for task in tasks
        ]
        
        # Get quantum-optimized schedule
        schedule = self.quantum_optimizer.optimize_maintenance_schedule(
            quantum_tasks,
            constraints
        )
        
        # Update tasks with scheduled times
        for task in schedule['schedule']:
            MaintenanceTask.get(task['id'])._data.update({
                'scheduled_time': task['scheduled_time'],
                'schedule_confidence': schedule['success_probability']
            })
        
        return schedule
    
    def analyze_sensor_data(self, sensor_id: str,
                          data: List[float]) -> Dict:
        """Analyze sensor data using ML and quantum computing"""
        # Get sensor details
        sensor = EquipmentSensor.get(sensor_id)
        if not sensor:
            raise ValueError(f"Sensor not found: {sensor_id}")
        
        # Train/update ML model for the sensor
        model_name = f"sensor_{sensor_id}_predictor"
        try:
            model = self.ml_manager.load_model(model_name)
        except:
            # Train new model
            model_result = self.auto_ml.train_model(
                data[:-1],  # Features
                data[1:],   # Target (next value)
                'regression',
                model_name
            )
        
        # Perform quantum anomaly detection
        anomalies = self.quantum_anomaly.detect_anomalies(data)
        
        # Create alerts for anomalies
        if any(score > 0.8 for score in anomalies['anomaly_scores']):
            MaintenanceAlert({
                'equipmentId': sensor.equipment_id,
                'title': f'Quantum Anomaly Detected in {sensor.sensor_type}',
                'description': 'Unusual pattern detected in sensor readings',
                'severity': AlertSeverity.HIGH
            }).save()
        
        return {
            'predictions': model.predict(data[-5:]),
            'anomalies': anomalies
        }
    
    def process_maintenance_logs(self, logs: List[str]) -> Dict:
        """Process maintenance logs using NLP"""
        # Analyze logs
        analysis = self.nlp.analyze_maintenance_logs(logs)
        
        # Extract maintenance tasks from analysis
        tasks = []
        for entity in analysis['entities']:
            if entity['label'] in ['EQUIPMENT', 'COMPONENT', 'ISSUE']:
                tasks.append({
                    'name': f"Investigate {entity['text']}",
                    'description': f"Check {entity['text']} based on maintenance log analysis",
                    'priority': 'HIGH' if entity['label'] == 'ISSUE' else 'MEDIUM'
                })
        
        # Create maintenance tasks
        for task in tasks:
            MaintenanceTask(task).save()
        
        return {
            'analysis': analysis,
            'tasks_created': len(tasks)
        }
    
    def create_predictive_workflow(self, equipment_type: str) -> str:
        """Create zero-code predictive maintenance workflow"""
        builder = WorkflowBuilder()
        
        # Build workflow
        workflow = (builder
            .create_workflow(
                f"predictive_maintenance_{equipment_type}",
                f"Predictive maintenance workflow for {equipment_type}"
            )
            .add_node('data_collection', {
                'type': 'sensor_data',
                'equipment_type': equipment_type,
                'interval': '1h'
            })
            .add_node('data_transform', {
                'mappings': {
                    'temperature': 'data.temperature',
                    'vibration': 'data.vibration',
                    'pressure': 'data.pressure'
                }
            })
            .add_node('python_code', {
                'code': '''
                    import numpy as np
                    # Prepare data for model
                    data = np.array([
                        context['temperature'],
                        context['vibration'],
                        context['pressure']
                    ])
                    result['prepared_data'] = data.tolist()
                '''
            })
            .add_node('condition', {
                'condition': 'len(context.get("prepared_data", [])) >= 24',
                'if_true': {'ready': True},
                'if_false': {'ready': False}
            })
            .add_branch(
                'context.get("ready", False)',
                lambda b: b
                    .add_node('ml_prediction', {
                        'model_name': f'{equipment_type}_predictor',
                        'input': 'prepared_data'
                    })
                    .add_node('condition', {
                        'condition': 'context["ml_prediction"]["failure_prob"] > 0.7',
                        'if_true': {
                            'alert': {
                                'type': 'MAINTENANCE_NEEDED',
                                'priority': 'HIGH'
                            }
                        }
                    })
            )
            .build())
        
        # Save workflow
        self.workflow_manager.save_workflow(workflow)
        return workflow.name
    
    def _initialize_workflows(self):
        """Initialize default maintenance workflows"""
        # Preventive Maintenance Workflow
        preventive = (WorkflowBuilder()
            .create_workflow(
                "preventive_maintenance",
                "Standard preventive maintenance workflow"
            )
            .add_node('data_collection', {
                'type': 'equipment_status'
            })
            .add_node('condition', {
                'condition': 'context["last_maintenance_days"] > 30',
                'if_true': {
                    'schedule_maintenance': True
                }
            })
            .build())
        
        # Reactive Maintenance Workflow
        reactive = (WorkflowBuilder()
            .create_workflow(
                "reactive_maintenance",
                "Reactive maintenance workflow"
            )
            .add_node('alert_handler', {
                'type': 'equipment_alert'
            })
            .add_node('nlp_analysis', {
                'type': 'alert_classification'
            })
            .add_node('task_creation', {
                'priority': 'HIGH'
            })
            .build())
        
        # Save workflows
        self.workflow_manager.save_workflow(preventive)
        self.workflow_manager.save_workflow(reactive)
    
    def enhance_maintenance_model(self, equipment_type: str,
                                historical_data: Dict) -> Dict:
        """Enhance maintenance model using transfer learning"""
        # Prepare data
        features = historical_data['features']
        labels = historical_data['maintenance_needed']
        
        # Adapt existing model or create new one
        try:
            result = self.transfer_learning.adapt_model(
                'base_maintenance_model',
                features,
                labels,
                f'{equipment_type}_maintenance_model'
            )
        except ValueError:
            # Train new model if no base model exists
            result = self.auto_ml.train_model(
                features,
                labels,
                'classification',
                f'{equipment_type}_maintenance_model'
            )
        
        return {
            'model_name': result['model_name'],
            'accuracy': result.get('accuracy', 0.0),
            'training_history': result.get('training_history', {})
        }
    
    def get_maintenance_insights(self, equipment_id: str) -> Dict:
        """Get AI-powered maintenance insights"""
        # Get equipment history
        history = MaintenanceHistory._db.query(
            lambda x: x.get('equipmentId') == equipment_id
        )
        
        # Analyze maintenance logs
        logs = [h['description'] for h in history]
        log_analysis = self.nlp.analyze_maintenance_logs(logs)
        
        # Get sensor data
        sensors = EquipmentSensor._db.query(
            lambda x: x.get('equipmentId') == equipment_id
        )
        sensor_data = {
            sensor['sensorType']: sensor.get('currentValue')
            for sensor in sensors
        }
        
        # Perform quantum analysis
        anomalies = self.quantum_anomaly.detect_anomalies(
            list(sensor_data.values())
        )
        
        return {
            'log_analysis': log_analysis,
            'sensor_status': sensor_data,
            'anomalies': anomalies,
            'recommendations': self._generate_recommendations(
                log_analysis,
                sensor_data,
                anomalies
            )
        }
    
    def _generate_recommendations(self, log_analysis: Dict,
                                sensor_data: Dict,
                                anomalies: Dict) -> List[Dict]:
        """Generate maintenance recommendations"""
        recommendations = []
        
        # Check for repeated issues in logs
        issue_keywords = [
            kw['text'] for kw in log_analysis['keywords']
            if kw['importance'] in ['ROOT', 'dobj']
        ]
        
        if len(set(issue_keywords)) < len(issue_keywords):
            recommendations.append({
                'type': 'RECURRING_ISSUE',
                'description': 'Detected recurring issues in maintenance logs',
                'priority': 'HIGH'
            })
        
        # Check for anomalies
        if any(score > 0.7 for score in anomalies['anomaly_scores']):
            recommendations.append({
                'type': 'ANOMALY_DETECTED',
                'description': 'Unusual patterns detected in sensor readings',
                'priority': 'HIGH'
            })
        
        # Check sensor thresholds
        for sensor_type, value in sensor_data.items():
            if isinstance(value, (int, float)):
                if value > 90:  # Example threshold
                    recommendations.append({
                        'type': 'SENSOR_WARNING',
                        'description': f'High {sensor_type} reading detected',
                        'priority': 'MEDIUM'
                    })
        
        return recommendations
