#!/usr/bin/env python3

import os
import re
from pathlib import Path

def analyze_module_completeness():
    """Analyze all modules to identify missing components"""
    
    modules_dir = r"C:\Users\nshrm\Desktop\Industry5.0\backend\modules"
    
    # Module analysis results
    results = {}
    
    # Get all module directories
    for module_dir in Path(modules_dir).iterdir():
        if module_dir.is_dir() and not module_dir.name.startswith('.'):
            module_name = module_dir.name
            module_src = module_dir / "src"
            
            if not module_src.exists():
                results[module_name] = {"status": "MISSING_SRC", "details": "No src directory"}
                continue
            
            # Read module file to understand expected components
            module_file = module_src / f"{module_name.replace('-', '-')}.module.ts"
            if not module_file.exists():
                # Try alternative naming
                for f in module_src.glob("*.module.ts"):
                    module_file = f
                    break
            
            if not module_file.exists():
                results[module_name] = {"status": "MISSING_MODULE_FILE", "details": "No .module.ts file"}
                continue
            
            # Parse module file
            try:
                with open(module_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Extract controllers, services, entities from module imports
                controllers = re.findall(r'import\s*{\s*([^}]+)\s*}\s*from\s*[\'"]\.\/controllers\/([^\'\"]+)[\'"]', content)
                services = re.findall(r'import\s*{\s*([^}]+)\s*}\s*from\s*[\'"]\.\/services\/([^\'\"]+)[\'"]', content)
                entities = re.findall(r'import\s*{\s*([^}]+)\s*}\s*from\s*[\'"]\.\/entities\/([^\'\"]+)[\'"]', content)
                
                # Check what exists vs what's imported
                controllers_dir = module_src / "controllers"
                services_dir = module_src / "services" 
                entities_dir = module_src / "entities"
                
                analysis = {
                    "status": "ANALYZED",
                    "controllers": {
                        "expected": len(controllers),
                        "exists": len(list(controllers_dir.glob("*.ts"))) if controllers_dir.exists() else 0,
                        "missing": []
                    },
                    "services": {
                        "expected": len(services),
                        "exists": len(list(services_dir.glob("*.ts"))) if services_dir.exists() else 0,
                        "missing": []
                    },
                    "entities": {
                        "expected": len(entities), 
                        "exists": len(list(entities_dir.glob("*.ts"))) if entities_dir.exists() else 0,
                        "missing": []
                    }
                }
                
                results[module_name] = analysis
                
            except Exception as e:
                results[module_name] = {"status": "ERROR", "details": str(e)}
    
    return results

def print_analysis_results(results):
    """Print formatted analysis results"""
    
    print("=" * 80)
    print("INDUSTRY 5.0 BACKEND - MODULE COMPLETENESS ANALYSIS")
    print("=" * 80)
    
    missing_modules = []
    incomplete_modules = []
    complete_modules = []
    
    for module_name, data in sorted(results.items()):
        print(f"\n📁 MODULE: {module_name}")
        print("-" * 50)
        
        if data["status"] in ["MISSING_SRC", "MISSING_MODULE_FILE", "ERROR"]:
            print(f"❌ STATUS: {data['status']}")
            print(f"   Details: {data.get('details', 'N/A')}")
            missing_modules.append(module_name)
        
        elif data["status"] == "ANALYZED":
            controllers = data["controllers"]
            services = data["services"] 
            entities = data["entities"]
            
            total_expected = controllers["expected"] + services["expected"] + entities["expected"]
            total_exists = controllers["exists"] + services["exists"] + entities["exists"]
            
            if total_exists == 0:
                print("❌ STATUS: EMPTY MODULE")
                missing_modules.append(module_name)
            elif total_exists < total_expected * 0.5:  # Less than 50% complete
                print(f"⚠️  STATUS: SEVERELY INCOMPLETE ({total_exists}/{total_expected} files)")
                incomplete_modules.append(module_name)
            elif total_exists < total_expected:
                print(f"🔶 STATUS: PARTIALLY INCOMPLETE ({total_exists}/{total_expected} files)")
                incomplete_modules.append(module_name)
            else:
                print(f"✅ STATUS: COMPLETE ({total_exists}/{total_expected} files)")
                complete_modules.append(module_name)
            
            print(f"   Controllers: {controllers['exists']}/{controllers['expected']}")
            print(f"   Services: {services['exists']}/{services['expected']}")
            print(f"   Entities: {entities['exists']}/{entities['expected']}")
    
    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"✅ Complete Modules: {len(complete_modules)}")
    print(f"🔶 Incomplete Modules: {len(incomplete_modules)}")
    print(f"❌ Missing/Broken Modules: {len(missing_modules)}")
    print(f"📊 Total Modules: {len(results)}")
    
    if incomplete_modules:
        print(f"\n🔶 INCOMPLETE MODULES:")
        for module in incomplete_modules:
            print(f"   - {module}")
    
    if missing_modules:
        print(f"\n❌ MISSING/BROKEN MODULES:")
        for module in missing_modules:
            print(f"   - {module}")

if __name__ == "__main__":
    results = analyze_module_completeness()
    print_analysis_results(results)
