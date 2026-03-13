import numpy as np
import tensorflow as tf
from typing import Dict, List, Optional, Union
from datetime import datetime
import joblib
from sklearn.base import BaseEstimator
from ..config import DATA_DIR

class MLModelManager:
    """Manages ML models for the Industry 5.0 platform"""
    
    def __init__(self):
        self.models_dir = DATA_DIR / 'ml_models'
        self.models_dir.mkdir(exist_ok=True)
        self._loaded_models = {}
        
    def save_model(self, model_name: str, model: Union[tf.keras.Model, BaseEstimator],
                  metadata: Dict = None):
        """Save ML model with metadata"""
        model_path = self.models_dir / f"{model_name}"
        model_path.mkdir(exist_ok=True)
        
        if isinstance(model, tf.keras.Model):
            model.save(str(model_path / "model"))
        else:
            joblib.dump(model, model_path / "model.joblib")
        
        # Save metadata
        if metadata:
            with open(model_path / "metadata.json", 'w') as f:
                json.dump({
                    **metadata,
                    'last_updated': datetime.utcnow().isoformat(),
                    'framework': 'tensorflow' if isinstance(model, tf.keras.Model) else 'sklearn'
                }, f)
    
    def load_model(self, model_name: str) -> Union[tf.keras.Model, BaseEstimator]:
        """Load ML model from storage"""
        if model_name in self._loaded_models:
            return self._loaded_models[model_name]
            
        model_path = self.models_dir / f"{model_name}"
        
        try:
            # Try loading as TensorFlow model
            model = tf.keras.models.load_model(str(model_path / "model"))
        except:
            # Try loading as sklearn model
            model = joblib.load(model_path / "model.joblib")
            
        self._loaded_models[model_name] = model
        return model

class AutoMLPipeline:
    """Automated Machine Learning Pipeline"""
    
    def __init__(self):
        self.model_manager = MLModelManager()
        
    def train_model(self, data: np.ndarray, target: np.ndarray,
                   task_type: str, model_name: str) -> Dict:
        """Train a model automatically based on task type"""
        if task_type == 'classification':
            model = self._create_classification_model(data.shape[1])
        elif task_type == 'regression':
            model = self._create_regression_model(data.shape[1])
        elif task_type == 'anomaly_detection':
            model = self._create_anomaly_detection_model(data.shape[1])
        else:
            raise ValueError(f"Unsupported task type: {task_type}")
            
        # Train model
        history = model.fit(data, target, validation_split=0.2,
                          epochs=100, callbacks=[tf.keras.callbacks.EarlyStopping()])
        
        # Save model
        self.model_manager.save_model(
            model_name,
            model,
            metadata={
                'task_type': task_type,
                'input_shape': data.shape[1],
                'training_history': history.history
            }
        )
        
        return {
            'model_name': model_name,
            'task_type': task_type,
            'training_history': history.history
        }
    
    def _create_classification_model(self, input_dim: int) -> tf.keras.Model:
        """Create a classification model"""
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu', input_shape=(input_dim,)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        return model
    
    def _create_regression_model(self, input_dim: int) -> tf.keras.Model:
        """Create a regression model"""
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu', input_shape=(input_dim,)),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(1)
        ])
        model.compile(optimizer='adam', loss='mse', metrics=['mae'])
        return model
    
    def _create_anomaly_detection_model(self, input_dim: int) -> tf.keras.Model:
        """Create an autoencoder for anomaly detection"""
        model = tf.keras.Sequential([
            # Encoder
            tf.keras.layers.Dense(64, activation='relu', input_shape=(input_dim,)),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(16, activation='relu'),
            # Decoder
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(input_dim, activation='sigmoid')
        ])
        model.compile(optimizer='adam', loss='mse')
        return model

class TransferLearningManager:
    """Manages transfer learning for different domains"""
    
    def __init__(self):
        self.model_manager = MLModelManager()
        
    def adapt_model(self, source_model_name: str, target_data: np.ndarray,
                   target_labels: np.ndarray, target_model_name: str) -> Dict:
        """Adapt a model to a new domain"""
        source_model = self.model_manager.load_model(source_model_name)
        
        # Create new model with pretrained weights
        if isinstance(source_model, tf.keras.Model):
            adapted_model = tf.keras.models.clone_model(source_model)
            adapted_model.set_weights(source_model.get_weights())
            
            # Freeze all layers except the last few
            for layer in adapted_model.layers[:-2]:
                layer.trainable = False
            
            # Train on new data
            adapted_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
            history = adapted_model.fit(target_data, target_labels, epochs=50,
                                      validation_split=0.2)
            
            # Save adapted model
            self.model_manager.save_model(
                target_model_name,
                adapted_model,
                metadata={
                    'source_model': source_model_name,
                    'adaptation_history': history.history
                }
            )
            
            return {
                'model_name': target_model_name,
                'source_model': source_model_name,
                'adaptation_history': history.history
            }
        else:
            raise ValueError("Transfer learning currently only supports TensorFlow models")
