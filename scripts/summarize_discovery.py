import json

with open('docs/dataset_discovery_report.json', encoding='utf-8') as f:
    d = json.load(f)

for k, v in d.items():
    print(f"=== {k} ({v.get('row_count')} rows) ===")
    print("Columns:", v.get('columns'))
    print("Null counts:", {c: cnt for c, cnt in v.get('null_counts', {}).items() if cnt > 0})
    print("Sample:", v.get('sample', [{}])[0])
    print()
