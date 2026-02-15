import os
import json

def verify_structure():
    required = ['.tmp', 'directives', 'execution']
    results = {}
    for folder in required:
        results[folder] = os.path.exists(folder)
    
    print(json.dumps(results, indent=2))
    return results

if __name__ == "__main__":
    verify_structure()
