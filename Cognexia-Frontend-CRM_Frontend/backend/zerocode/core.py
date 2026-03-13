from typing import Dict, List, Optional, Any, Callable
import json
import ast
from datetime import datetime
import importlib
import inspect
from pathlib import Path
from ..config import DATA_DIR

class WorkflowNode:
    """Represents a node in the workflow"""
    
    def __init__(self, node_type: str, config: Dict):
        self.node_type = node_type
        self.config = config
        self.next_nodes = []
        self.previous_nodes = []
        
    def add_next_node(self, node: 'WorkflowNode'):
        self.next_nodes.append(node)
        node.previous_nodes.append(self)
        
    def execute(self, context: Dict) -> Dict:
        """Execute the node's operation"""
        handler = NodeRegistry.get_handler(self.node_type)
        if not handler:
            raise ValueError(f"No handler found for node type: {self.node_type}")
            
        result = handler(self.config, context)
        return result

class Workflow:
    """Represents a complete workflow"""
    
    def __init__(self, name: str, description: str = None):
        self.name = name
        self.description = description
        self.start_node = None
        self.nodes = []
        self.context = {}
        
    def add_node(self, node: WorkflowNode):
        self.nodes.append(node)
        if not self.start_node:
            self.start_node = node
            
    def execute(self, initial_context: Dict = None) -> Dict:
        """Execute the entire workflow"""
        self.context = initial_context or {}
        self.context['workflow_started'] = datetime.utcnow().isoformat()
        
        current_node = self.start_node
        while current_node:
            try:
                result = current_node.execute(self.context)
                self.context.update(result)
                
                # Determine next node based on conditions
                current_node = self._get_next_node(current_node, result)
                
            except Exception as e:
                self.context['error'] = str(e)
                break
                
        self.context['workflow_completed'] = datetime.utcnow().isoformat()
        return self.context
    
    def _get_next_node(self, current_node: WorkflowNode,
                      result: Dict) -> Optional[WorkflowNode]:
        """Determine the next node based on conditions"""
        if not current_node.next_nodes:
            return None
            
        # Check conditions if any
        for next_node in current_node.next_nodes:
            condition = next_node.config.get('condition')
            if not condition or self._evaluate_condition(condition, result):
                return next_node
                
        return current_node.next_nodes[0]
    
    def _evaluate_condition(self, condition: str, context: Dict) -> bool:
        """Evaluate a condition string"""
        try:
            # Create safe environment for eval
            safe_dict = {
                'context': context,
                'len': len,
                'str': str,
                'int': int,
                'float': float,
                'bool': bool
            }
            return eval(condition, {"__builtins__": {}}, safe_dict)
        except:
            return False
    
    def to_dict(self) -> Dict:
        """Convert workflow to dictionary representation"""
        return {
            'name': self.name,
            'description': self.description,
            'nodes': [
                {
                    'id': i,
                    'type': node.node_type,
                    'config': node.config,
                    'next_nodes': [
                        self.nodes.index(n) for n in node.next_nodes
                    ]
                }
                for i, node in enumerate(self.nodes)
            ]
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Workflow':
        """Create workflow from dictionary representation"""
        workflow = cls(data['name'], data.get('description'))
        
        # Create nodes
        nodes = []
        for node_data in data['nodes']:
            node = WorkflowNode(node_data['type'], node_data['config'])
            nodes.append(node)
            workflow.add_node(node)
        
        # Connect nodes
        for i, node_data in enumerate(data['nodes']):
            for next_node_id in node_data['next_nodes']:
                nodes[i].add_next_node(nodes[next_node_id])
        
        return workflow

class NodeRegistry:
    """Registry for node handlers"""
    
    _handlers = {}
    
    @classmethod
    def register(cls, node_type: str) -> Callable:
        """Decorator to register node handlers"""
        def decorator(func):
            cls._handlers[node_type] = func
            return func
        return decorator
    
    @classmethod
    def get_handler(cls, node_type: str) -> Optional[Callable]:
        """Get handler for node type"""
        return cls._handlers.get(node_type)

class WorkflowBuilder:
    """Helper class to build workflows"""
    
    def __init__(self):
        self.workflow = None
        self.current_node = None
        
    def create_workflow(self, name: str, description: str = None) -> 'WorkflowBuilder':
        """Create a new workflow"""
        self.workflow = Workflow(name, description)
        return self
    
    def add_node(self, node_type: str, config: Dict = None) -> 'WorkflowBuilder':
        """Add a node to the workflow"""
        node = WorkflowNode(node_type, config or {})
        self.workflow.add_node(node)
        
        if self.current_node:
            self.current_node.add_next_node(node)
        
        self.current_node = node
        return self
    
    def add_branch(self, condition: str,
                  builder_func: Callable[['WorkflowBuilder'], None]) -> 'WorkflowBuilder':
        """Add a conditional branch"""
        # Save current node
        previous_node = self.current_node
        
        # Create branch
        branch_builder = WorkflowBuilder()
        branch_builder.workflow = self.workflow
        builder_func(branch_builder)
        
        # Add condition to first node in branch
        if branch_builder.workflow.nodes:
            branch_builder.workflow.nodes[0].config['condition'] = condition
            previous_node.add_next_node(branch_builder.workflow.nodes[0])
        
        return self
    
    def build(self) -> Workflow:
        """Build and return the workflow"""
        return self.workflow

# Register common node handlers
@NodeRegistry.register('python_code')
def handle_python_code(config: Dict, context: Dict) -> Dict:
    """Execute Python code node"""
    code = config.get('code', '')
    if not code:
        return {}
        
    # Create safe globals
    safe_globals = {
        '__builtins__': {
            'len': len,
            'range': range,
            'str': str,
            'int': int,
            'float': float,
            'bool': bool,
            'list': list,
            'dict': dict,
            'print': print
        }
    }
    
    # Execute code
    local_vars = {'context': context, 'result': {}}
    exec(code, safe_globals, local_vars)
    return local_vars.get('result', {})

@NodeRegistry.register('api_call')
def handle_api_call(config: Dict, context: Dict) -> Dict:
    """Execute API call node"""
    import requests
    
    method = config.get('method', 'GET')
    url = config.get('url')
    headers = config.get('headers', {})
    data = config.get('data')
    
    if not url:
        return {}
    
    response = requests.request(method, url, headers=headers, json=data)
    return {'response': response.json()}

@NodeRegistry.register('condition')
def handle_condition(config: Dict, context: Dict) -> Dict:
    """Execute condition node"""
    condition = config.get('condition')
    if_true = config.get('if_true', {})
    if_false = config.get('if_false', {})
    
    result = WorkflowBuilder()._evaluate_condition(condition, context)
    return if_true if result else if_false

@NodeRegistry.register('data_transform')
def handle_data_transform(config: Dict, context: Dict) -> Dict:
    """Execute data transformation node"""
    mappings = config.get('mappings', {})
    result = {}
    
    for output_key, input_path in mappings.items():
        value = context
        for key in input_path.split('.'):
            value = value.get(key, {})
        result[output_key] = value
    
    return result

class WorkflowManager:
    """Manages workflow storage and execution"""
    
    def __init__(self):
        self.workflows_dir = DATA_DIR / 'workflows'
        self.workflows_dir.mkdir(exist_ok=True)
    
    def save_workflow(self, workflow: Workflow):
        """Save workflow to storage"""
        workflow_data = workflow.to_dict()
        file_path = self.workflows_dir / f"{workflow.name}.json"
        
        with open(file_path, 'w') as f:
            json.dump(workflow_data, f, indent=2)
    
    def load_workflow(self, name: str) -> Optional[Workflow]:
        """Load workflow from storage"""
        file_path = self.workflows_dir / f"{name}.json"
        
        if not file_path.exists():
            return None
            
        with open(file_path, 'r') as f:
            workflow_data = json.load(f)
            
        return Workflow.from_dict(workflow_data)
    
    def execute_workflow(self, name: str, context: Dict = None) -> Dict:
        """Execute a stored workflow"""
        workflow = self.load_workflow(name)
        if not workflow:
            raise ValueError(f"Workflow not found: {name}")
            
        return workflow.execute(context)
    
    def list_workflows(self) -> List[str]:
        """List all available workflows"""
        return [f.stem for f in self.workflows_dir.glob("*.json")]
