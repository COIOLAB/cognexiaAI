import numpy as np
from typing import Dict, List, Optional, Tuple
import spacy
from spacy.training import Example
from transformers import (
    pipeline, AutoTokenizer, AutoModel, AutoModelForSequenceClassification,
    Trainer, TrainingArguments
)
import torch
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import DBSCAN
import joblib
from pathlib import Path
from datetime import datetime
import json
from ..config import DATA_DIR

class SelfLearningNLP:
    """Advanced self-learning NLP system for Industry 5.0"""
    
    def __init__(self):
        self.models_dir = DATA_DIR / 'nlp_models'
        self.models_dir.mkdir(exist_ok=True)
        
        # Initialize base models
        self.nlp = spacy.load('en_core_web_lg')
        self.sentiment_analyzer = pipeline('sentiment-analysis')
        self.qa_model = pipeline('question-answering')
        self.summarizer = pipeline('summarization')
        
        # Custom models
        self.custom_models = {}
        self.entity_patterns = {}
        self.intent_classifier = None
        
        # Training data storage
        self.training_data = []
        self.training_clusters = {}
        
        # Load or initialize custom models
        self._initialize_custom_models()
    
    def process_and_learn(self, text: str, metadata: Dict = None) -> Dict:
        """Process text and learn from it"""
        # Process text
        results = self._process_text(text)
        
        # Store for learning
        self.training_data.append({
            'text': text,
            'metadata': metadata or {},
            'analysis': results,
            'timestamp': datetime.utcnow().isoformat()
        })
        
        # Trigger learning if enough new data
        if len(self.training_data) % 100 == 0:  # Every 100 samples
            self._trigger_learning_cycle()
        
        return results
    
    def _process_text(self, text: str) -> Dict:
        """Process text with all available models"""
        doc = self.nlp(text)
        
        # Basic NLP analysis
        results = {
            'entities': [
                {
                    'text': ent.text,
                    'label': ent.label_,
                    'start': ent.start_char,
                    'end': ent.end_char
                }
                for ent in doc.ents
            ],
            'keywords': [
                {
                    'text': token.text,
                    'pos': token.pos_,
                    'importance': token.dep_
                }
                for token in doc if not token.is_stop and token.is_alpha
            ],
            'sentiment': self.sentiment_analyzer(text)[0],
            'custom_entities': self._extract_custom_entities(text),
            'intent': self._classify_intent(text),
            'domain_concepts': self._extract_domain_concepts(text)
        }
        
        # Generate summary if text is long enough
        if len(text) > 100:
            results['summary'] = self.summarizer(
                text,
                max_length=130,
                min_length=30,
                do_sample=False
            )[0]['summary_text']
        
        return results
    
    def _trigger_learning_cycle(self):
        """Trigger a learning cycle to update models"""
        print("Starting learning cycle...")
        
        # Cluster similar texts
        self._cluster_training_data()
        
        # Update entity patterns
        self._learn_new_entities()
        
        # Update intent classification
        self._update_intent_classifier()
        
        # Update domain concept extraction
        self._update_domain_concepts()
        
        # Save updated models
        self._save_models()
        
        print("Learning cycle completed")
    
    def _cluster_training_data(self):
        """Cluster training data to find patterns"""
        # Get embeddings for all texts
        embeddings = []
        for item in self.training_data:
            doc = self.nlp(item['text'])
            embeddings.append(doc.vector)
        
        # Cluster using DBSCAN
        clustering = DBSCAN(eps=0.5, min_samples=5)
        clusters = clustering.fit_predict(embeddings)
        
        # Organize data by clusters
        self.training_clusters = {}
        for idx, cluster_id in enumerate(clusters):
            if cluster_id == -1:  # Noise points
                continue
            if cluster_id not in self.training_clusters:
                self.training_clusters[cluster_id] = []
            self.training_clusters[cluster_id].append(self.training_data[idx])
    
    def _learn_new_entities(self):
        """Learn new entity patterns from clustered data"""
        for cluster_id, cluster_data in self.training_clusters.items():
            # Extract potential entities using noun phrases
            noun_phrases = []
            for item in cluster_data:
                doc = self.nlp(item['text'])
                noun_phrases.extend([np.text for np in doc.noun_chunks])
            
            # Find common patterns
            if len(noun_phrases) > 5:
                common_patterns = self._find_common_patterns(noun_phrases)
                
                # Add to entity patterns
                for pattern in common_patterns:
                    if pattern not in self.entity_patterns:
                        self.entity_patterns[pattern] = {
                            'count': 1,
                            'examples': [pattern],
                            'cluster_id': cluster_id
                        }
                    else:
                        self.entity_patterns[pattern]['count'] += 1
                        if pattern not in self.entity_patterns[pattern]['examples']:
                            self.entity_patterns[pattern]['examples'].append(pattern)
    
    def _update_intent_classifier(self):
        """Update intent classification model"""
        # Prepare training data
        texts = []
        intents = []
        
        for cluster_id, cluster_data in self.training_clusters.items():
            # Use metadata if available
            for item in cluster_data:
                if 'intent' in item.get('metadata', {}):
                    texts.append(item['text'])
                    intents.append(item['metadata']['intent'])
        
        if len(texts) > 100:  # Only train with sufficient data
            # Convert to BERT format
            tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
            model = AutoModelForSequenceClassification.from_pretrained(
                'bert-base-uncased',
                num_labels=len(set(intents))
            )
            
            # Train model
            training_args = TrainingArguments(
                output_dir=str(self.models_dir / 'intent_classifier'),
                num_train_epochs=3,
                per_device_train_batch_size=16,
                save_steps=1000,
                save_total_limit=2,
            )
            
            trainer = Trainer(
                model=model,
                args=training_args,
                train_dataset=texts,  # Simplified for example
                tokenizer=tokenizer
            )
            
            trainer.train()
            self.intent_classifier = model
    
    def _update_domain_concepts(self):
        """Update domain concept extraction"""
        # Extract frequent patterns from clusters
        domain_patterns = {}
        
        for cluster_id, cluster_data in self.training_clusters.items():
            # Extract patterns using dependency parsing
            for item in cluster_data:
                doc = self.nlp(item['text'])
                for token in doc:
                    if token.dep_ in ['nsubj', 'dobj', 'pobj']:
                        pattern = f"{token.head.lemma_}_{token.dep_}_{token.lemma_}"
                        if pattern not in domain_patterns:
                            domain_patterns[pattern] = {
                                'count': 1,
                                'examples': [token.text]
                            }
                        else:
                            domain_patterns[pattern]['count'] += 1
                            if token.text not in domain_patterns[pattern]['examples']:
                                domain_patterns[pattern]['examples'].append(token.text)
        
        # Filter significant patterns
        self.domain_patterns = {
            k: v for k, v in domain_patterns.items()
            if v['count'] >= 5  # Minimum frequency threshold
        }
    
    def _extract_custom_entities(self, text: str) -> List[Dict]:
        """Extract custom entities using learned patterns"""
        doc = self.nlp(text)
        custom_entities = []
        
        # Apply learned patterns
        for pattern, info in self.entity_patterns.items():
            if pattern.lower() in text.lower():
                custom_entities.append({
                    'text': pattern,
                    'type': f"CUSTOM_{info['cluster_id']}",
                    'confidence': info['count'] / len(self.training_data)
                })
        
        return custom_entities
    
    def _classify_intent(self, text: str) -> Dict:
        """Classify intent using custom classifier"""
        if self.intent_classifier:
            # Use custom trained classifier
            tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
            inputs = tokenizer(text, return_tensors='pt')
            outputs = self.intent_classifier(**inputs)
            intent_id = outputs.logits.argmax().item()
            confidence = torch.softmax(outputs.logits, dim=1)[0][intent_id].item()
            
            return {
                'intent': f"INTENT_{intent_id}",
                'confidence': confidence
            }
        else:
            # Fallback to rule-based classification
            intents = {
                'troubleshoot': ['problem', 'issue', 'error', 'wrong', 'fix'],
                'maintain': ['maintenance', 'service', 'check', 'inspect'],
                'install': ['install', 'setup', 'configure', 'deploy'],
                'info': ['what', 'how', 'when', 'where', 'why']
            }
            
            text_lower = text.lower()
            for intent, keywords in intents.items():
                if any(keyword in text_lower for keyword in keywords):
                    return {
                        'intent': intent,
                        'confidence': 0.7
                    }
            
            return {
                'intent': 'other',
                'confidence': 0.5
            }
    
    def _extract_domain_concepts(self, text: str) -> List[Dict]:
        """Extract domain-specific concepts"""
        doc = self.nlp(text)
        concepts = []
        
        # Apply learned domain patterns
        for pattern, info in self.domain_patterns.items():
            head_lemma, dep, child_lemma = pattern.split('_')
            
            for token in doc:
                if (token.head.lemma_ == head_lemma and
                    token.dep_ == dep and
                    token.lemma_ == child_lemma):
                    concepts.append({
                        'text': token.text,
                        'pattern': pattern,
                        'frequency': info['count']
                    })
        
        return concepts
    
    def _find_common_patterns(self, texts: List[str]) -> List[str]:
        """Find common patterns in text"""
        # Simple frequency-based pattern extraction
        from collections import Counter
        
        # Tokenize all texts
        tokens = []
        for text in texts:
            doc = self.nlp(text)
            tokens.extend([token.text for token in doc])
        
        # Find frequent patterns
        counter = Counter(tokens)
        return [token for token, count in counter.items() if count >= 3]
    
    def _initialize_custom_models(self):
        """Initialize or load custom models"""
        model_path = self.models_dir / 'custom_models.joblib'
        if model_path.exists():
            self.custom_models = joblib.load(model_path)
    
    def _save_models(self):
        """Save all custom models and patterns"""
        # Save custom models
        joblib.dump(self.custom_models,
                   self.models_dir / 'custom_models.joblib')
        
        # Save patterns
        with open(self.models_dir / 'entity_patterns.json', 'w') as f:
            json.dump(self.entity_patterns, f, indent=2)
        
        with open(self.models_dir / 'domain_patterns.json', 'w') as f:
            json.dump(self.domain_patterns, f, indent=2)
    
    def generate_training_insights(self) -> Dict:
        """Generate insights about the learning process"""
        return {
            'total_samples': len(self.training_data),
            'num_clusters': len(self.training_clusters),
            'num_entity_patterns': len(self.entity_patterns),
            'num_domain_patterns': len(self.domain_patterns),
            'latest_update': datetime.utcnow().isoformat(),
            'model_statistics': {
                'entity_pattern_coverage': sum(p['count'] for p in self.entity_patterns.values()),
                'domain_pattern_coverage': sum(p['count'] for p in self.domain_patterns.values())
            }
        }
