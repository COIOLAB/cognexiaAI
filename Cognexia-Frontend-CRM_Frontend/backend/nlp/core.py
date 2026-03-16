import numpy as np
from typing import Dict, List, Optional, Tuple
import spacy
from transformers import pipeline, AutoTokenizer, AutoModel
import torch
from sklearn.metrics.pairwise import cosine_similarity
from ..config import DATA_DIR

class IndustryNLP:
    """NLP capabilities for Industry 5.0"""
    
    def __init__(self):
        # Load NLP models
        self.nlp = spacy.load('en_core_web_lg')
        self.sentiment_analyzer = pipeline('sentiment-analysis')
        self.qa_model = pipeline('question-answering')
        self.summarizer = pipeline('summarization')
        
        # Initialize document store
        self.doc_embeddings = {}
        self.documents = {}
    
    def analyze_maintenance_logs(self, logs: List[str]) -> Dict:
        """Analyze maintenance logs for insights"""
        results = {
            'entities': [],
            'keywords': [],
            'sentiments': [],
            'summary': ''
        }
        
        # Process each log
        combined_text = ' '.join(logs)
        doc = self.nlp(combined_text)
        
        # Extract entities
        results['entities'] = [
            {
                'text': ent.text,
                'label': ent.label_,
                'start': ent.start_char,
                'end': ent.end_char
            }
            for ent in doc.ents
        ]
        
        # Extract keywords
        results['keywords'] = [
            {
                'text': token.text,
                'pos': token.pos_,
                'importance': token.dep_
            }
            for token in doc if not token.is_stop and token.is_alpha
        ]
        
        # Analyze sentiment
        results['sentiments'] = self.sentiment_analyzer(logs)
        
        # Generate summary
        if len(combined_text) > 100:
            results['summary'] = self.summarizer(
                combined_text,
                max_length=130,
                min_length=30,
                do_sample=False
            )[0]['summary_text']
        else:
            results['summary'] = combined_text
        
        return results
    
    def process_maintenance_query(self, query: str,
                                context: List[str]) -> Dict:
        """Process natural language maintenance queries"""
        # Combine context
        context_text = ' '.join(context)
        
        # Get answer from QA model
        answer = self.qa_model(
            question=query,
            context=context_text
        )
        
        # Analyze query intent
        doc = self.nlp(query)
        intent = self._classify_query_intent(doc)
        
        return {
            'answer': answer,
            'intent': intent,
            'confidence': float(answer['score']),
            'relevant_context': self._extract_relevant_context(doc, context)
        }
    
    def index_technical_document(self, doc_id: str,
                               content: str) -> Dict:
        """Index technical documentation for search"""
        # Process document
        doc = self.nlp(content)
        
        # Generate document embedding
        embedding = doc.vector
        
        # Store document and embedding
        self.documents[doc_id] = {
            'content': content,
            'sections': self._split_into_sections(content),
            'entities': [
                {
                    'text': ent.text,
                    'label': ent.label_
                }
                for ent in doc.ents
            ]
        }
        self.doc_embeddings[doc_id] = embedding
        
        return {
            'doc_id': doc_id,
            'num_sections': len(self.documents[doc_id]['sections']),
            'entities_found': len(self.documents[doc_id]['entities'])
        }
    
    def search_technical_docs(self, query: str,
                            top_k: int = 5) -> List[Dict]:
        """Search indexed technical documentation"""
        # Process query
        query_doc = self.nlp(query)
        query_embedding = query_doc.vector
        
        # Calculate similarities
        similarities = {}
        for doc_id, doc_embedding in self.doc_embeddings.items():
            similarity = cosine_similarity(
                query_embedding.reshape(1, -1),
                doc_embedding.reshape(1, -1)
            )[0][0]
            similarities[doc_id] = similarity
        
        # Get top results
        top_docs = sorted(similarities.items(),
                         key=lambda x: x[1],
                         reverse=True)[:top_k]
        
        results = []
        for doc_id, score in top_docs:
            doc_data = self.documents[doc_id]
            relevant_sections = self._find_relevant_sections(
                query_doc,
                doc_data['sections']
            )
            
            results.append({
                'doc_id': doc_id,
                'score': float(score),
                'relevant_sections': relevant_sections,
                'entities': doc_data['entities']
            })
        
        return results
    
    def _classify_query_intent(self, doc) -> str:
        """Classify the intent of a maintenance query"""
        # Simple rule-based intent classification
        intents = {
            'troubleshoot': ['problem', 'issue', 'error', 'wrong', 'fix'],
            'maintain': ['maintenance', 'service', 'check', 'inspect'],
            'install': ['install', 'setup', 'configure', 'deploy'],
            'info': ['what', 'how', 'when', 'where', 'why']
        }
        
        doc_text = doc.text.lower()
        for intent, keywords in intents.items():
            if any(keyword in doc_text for keyword in keywords):
                return intent
        
        return 'other'
    
    def _extract_relevant_context(self, query_doc,
                                context: List[str]) -> List[str]:
        """Extract relevant context based on query"""
        relevant = []
        query_embedding = query_doc.vector
        
        for ctx in context:
            ctx_doc = self.nlp(ctx)
            similarity = cosine_similarity(
                query_embedding.reshape(1, -1),
                ctx_doc.vector.reshape(1, -1)
            )[0][0]
            
            if similarity > 0.5:  # Threshold for relevance
                relevant.append(ctx)
        
        return relevant
    
    def _split_into_sections(self, content: str) -> List[Dict]:
        """Split document into logical sections"""
        # Simple section splitting by paragraphs
        paragraphs = content.split('\n\n')
        sections = []
        
        for i, para in enumerate(paragraphs):
            if para.strip():
                doc = self.nlp(para)
                sections.append({
                    'id': f'section_{i}',
                    'content': para,
                    'embedding': doc.vector
                })
        
        return sections
    
    def _find_relevant_sections(self, query_doc,
                              sections: List[Dict]) -> List[Dict]:
        """Find sections relevant to query"""
        relevant = []
        query_embedding = query_doc.vector
        
        for section in sections:
            similarity = cosine_similarity(
                query_embedding.reshape(1, -1),
                section['embedding'].reshape(1, -1)
            )[0][0]
            
            if similarity > 0.5:  # Threshold for relevance
                relevant.append({
                    'section_id': section['id'],
                    'content': section['content'],
                    'relevance_score': float(similarity)
                })
        
        return sorted(relevant, key=lambda x: x['relevance_score'], reverse=True)
