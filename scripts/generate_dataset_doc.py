import json
import os
import glob
import pandas as pd
import numpy as np

data_dir = r"c:\Users\soniy\Downloads\khanan-suraksha-bilingual\data"
csv_files = sorted(glob.glob(os.path.join(data_dir, "*.csv")))

lines = ["# Khanan Suraksha - Dataset Discovery & Mapping Report\n\n"]
lines.append("This document analyzes all 15 CSV datasets in `data/` and specifies the mapping to the PostgreSQL / Prisma database schema.\n\n")

for fpath in csv_files:
    fname = os.path.basename(fpath)
    df = pd.read_csv(fpath, low_memory=False)
    lines.append(f"## {fname}\n\n")
    lines.append(f"- **Row Count:** {len(df):,}\n")
    lines.append(f"- **Columns ({len(df.columns)}):** `{', '.join(df.columns)}`\n")
    lines.append(f"- **Duplicates:** {df.duplicated().sum()}\n")
    
    nulls = df.isnull().sum()
    null_cols = {col: int(nulls[col]) for col in df.columns if nulls[col] > 0}
    if null_cols:
        lines.append(f"- **Null Values:** {null_cols}\n")
    else:
        lines.append("- **Null Values:** None\n")
    
    # Check key columns
    unique_candidates = [col for col in df.columns if df[col].nunique(dropna=True) == len(df) and df[col].isnull().sum() == 0]
    lines.append(f"- **Unique ID Candidates:** `{', '.join(unique_candidates) if unique_candidates else 'None'}`\n")
    
    # Types & stats
    lines.append("\n### Column Details\n\n")
    lines.append("| Column | Inferred Type | Null Count | Unique Count | Sample Values |\n")
    lines.append("| --- | --- | --- | --- | --- |\n")
    for col in df.columns:
        vals = [str(x) for x in df[col].dropna().unique()[:3]]
        sample_str = ", ".join(vals).replace("\n", " ").replace("|", "/")
        if len(sample_str) > 60:
            sample_str = sample_str[:57] + "..."
        lines.append(f"| `{col}` | `{df[col].dtype}` | {nulls[col]} | {df[col].nunique(dropna=False)} | {sample_str} |\n")
    lines.append("\n---\n\n")

with open(r"c:\Users\soniy\Downloads\khanan-suraksha-bilingual\docs\dataset_analysis.md", "w", encoding="utf-8") as out:
    out.writelines(lines)

print("Generated docs/dataset_analysis.md successfully!")
