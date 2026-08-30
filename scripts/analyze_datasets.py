import os
import glob
import pandas as pd
import numpy as np
import json

data_dir = r"c:\Users\soniy\Downloads\khanan-suraksha-bilingual\data"
csv_files = sorted(glob.glob(os.path.join(data_dir, "*.csv")))

report = {}

for fpath in csv_files:
    fname = os.path.basename(fpath)
    try:
        df = pd.read_csv(fpath, low_memory=False)
        row_count = len(df)
        cols = list(df.columns)
        
        # null counts
        null_counts = df.isnull().sum().to_dict()
        
        # duplicate rows
        dup_rows = int(df.duplicated().sum())
        
        # dtypes
        dtypes = {col: str(df[col].dtype) for col in cols}
        
        # candidate unique identifiers (unique non-null count == row count)
        unique_cols = [col for col in cols if df[col].nunique(dropna=True) == row_count and df[col].isnull().sum() == 0]
        
        # date fields heuristic
        date_cols = [col for col in cols if any(k in col.lower() for k in ['date', 'time', 'due', 'created', 'updated', 'at', 'month', 'year', 'period'])]
        
        # coordinate fields
        coord_cols = [col for col in cols if any(k in col.lower() for k in ['lat', 'lon', 'coord', 'location', 'geo'])]
        
        # categorical columns (few unique values)
        categorical_cols = {col: df[col].dropna().unique().tolist()[:10] for col in cols if df[col].nunique() <= 15}
        
        # foreign key heuristic
        fk_cols = [col for col in cols if col.lower().endswith('_id') or col.lower().endswith('id') or col.lower() in ['mine_code', 'company_code', 'contractor_id', 'worker_id', 'equipment_id', 'inspection_id', 'violation_id']]
        
        # sample head
        sample = df.head(3).to_dict(orient='records')
        
        report[fname] = {
            "row_count": row_count,
            "columns": cols,
            "dtypes": dtypes,
            "null_counts": null_counts,
            "duplicate_rows": dup_rows,
            "unique_identifiers": unique_cols,
            "date_fields": date_cols,
            "coordinate_fields": coord_cols,
            "categorical_samples": categorical_cols,
            "fk_candidates": fk_cols,
            "sample": sample
        }
    except Exception as e:
        report[fname] = {"error": str(e)}

with open(r"c:\Users\soniy\Downloads\khanan-suraksha-bilingual\docs\dataset_discovery_report.json", "w", encoding="utf-8") as out:
    json.dump(report, out, indent=2, default=str)

print("Discovery analysis complete. Found", len(report), "datasets.")
for k, v in report.items():
    if "row_count" in v:
        print(f"- {k}: {v['row_count']} rows, {len(v['columns'])} cols")
    else:
        print(f"- {k}: ERROR {v.get('error')}")
