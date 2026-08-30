"""
Khanan Suraksha - Data Quality Engine
Analyzes telemetry datasets (both clean and messy), identifies anomalies, nulls, spikes, and errors,
assigns VALID / WARNING / ERROR tags to each record, and calculates a DATA QUALITY SCORE.
"""

import os
import json
import numpy as np
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime

DATA_DIR = r"c:\Users\soniy\Downloads\khanan-suraksha-bilingual\data"
DB_URL = os.environ.get("DATABASE_URL", "postgresql://postgres.xzkjkanwijrucsrwintb:Soni_yatharth@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require")

def assess_dataset_quality(csv_name, is_messy=False):
    fpath = os.path.join(DATA_DIR, csv_name)
    df = pd.read_csv(fpath, low_memory=False)
    total_records = len(df)
    
    valid_count = 0
    warning_count = 0
    error_count = 0
    
    issues = {
        "missing_or_null_values": 0,
        "temperature_anomalies": 0,
        "vibration_spikes": 0,
        "pressure_out_of_range": 0,
        "rpm_anomalies": 0,
        "oil_temp_anomalies": 0,
        "bearing_temp_anomalies": 0,
        "load_percentage_out_of_range": 0,
        "missing_mine_or_equipment": 0,
        "invalid_shift": 0,
        "negative_or_impossible_values": 0
    }
    
    records_assessed = []
    
    valid_mines = {'JH-001', 'JH-002', 'JH-003', 'OD-001', 'OD-002', 'CG-001', 'CG-002'}
    valid_shifts = {'Morning', 'Afternoon', 'Night'}
    valid_equip = {'Excavator', 'Drill Rig', 'Crusher', 'Loader', 'Haul Truck', 'Roof Bolter', 'Continuous Miner', 'Conveyor'}
    
    for row in df.to_dict('records'):
        row_status = "VALID"
        row_notes = []
        
        # 1. Mine and Equipment Validity
        mine_id = str(row.get('mine_id', '')).strip()
        if not mine_id or mine_id not in valid_mines:
            issues["missing_mine_or_equipment"] += 1
            row_notes.append("Invalid or missing Mine ID")
            row_status = "ERROR"
            
        eq_type = str(row.get('equipment_type', '')).strip()
        if not eq_type or eq_type not in valid_equip:
            issues["missing_mine_or_equipment"] += 1
            row_notes.append("Invalid equipment type")
            row_status = "ERROR"
            
        shift = str(row.get('shift', '')).strip()
        if shift not in valid_shifts:
            issues["invalid_shift"] += 1
            row_notes.append(f"Invalid shift: {shift}")
            if row_status != "ERROR":
                row_status = "WARNING"
                
        # 2. Check for null values
        null_fields = [col for col in df.columns if pd.isna(row[col])]
        if null_fields:
            issues["missing_or_null_values"] += 1
            row_notes.append(f"Null values in: {', '.join(null_fields)}")
            row_status = "ERROR" if len(null_fields) > 2 else "WARNING"
            
        # 3. Numeric range validations
        temp = row.get('temperature_C')
        if pd.notna(temp):
            try:
                t_val = float(temp)
                if t_val < 0 or t_val > 150:
                    issues["temperature_anomalies"] += 1
                    row_notes.append(f"Abnormal temperature: {t_val}°C")
                    row_status = "ERROR" if (t_val < 0 or t_val > 180) else "WARNING"
            except:
                issues["temperature_anomalies"] += 1
                row_status = "ERROR"
                
        vib = row.get('vibration')
        if pd.notna(vib):
            try:
                v_val = float(vib)
                if v_val < 0 or v_val > 8.0:
                    issues["vibration_spikes"] += 1
                    row_notes.append(f"High vibration: {v_val}")
                    if v_val > 10.0 or v_val < 0:
                        row_status = "ERROR"
                    elif row_status == "VALID":
                        row_status = "WARNING"
            except:
                issues["vibration_spikes"] += 1
                row_status = "ERROR"

        pres = row.get('pressure_bar')
        if pd.notna(pres):
            try:
                p_val = float(pres)
                if p_val < 0 or p_val > 250:
                    issues["pressure_out_of_range"] += 1
                    row_notes.append(f"Pressure out of range: {p_val} bar")
                    if p_val < 0 or p_val > 300:
                        row_status = "ERROR"
                    elif row_status == "VALID":
                        row_status = "WARNING"
            except:
                issues["pressure_out_of_range"] += 1
                row_status = "ERROR"

        rpm = row.get('rpm')
        if pd.notna(rpm):
            try:
                r_val = float(rpm)
                if r_val < 0 or r_val > 4000:
                    issues["rpm_anomalies"] += 1
                    row_notes.append(f"Abnormal RPM: {r_val}")
                    if r_val < 0 or r_val > 5000:
                        row_status = "ERROR"
                    elif row_status == "VALID":
                        row_status = "WARNING"
            except:
                issues["rpm_anomalies"] += 1
                row_status = "ERROR"

        oil_temp = row.get('oil_temp_C')
        if pd.notna(oil_temp):
            try:
                ot_val = float(oil_temp)
                if ot_val < 0 or ot_val > 130:
                    issues["oil_temp_anomalies"] += 1
                    row_notes.append(f"Oil temp anomaly: {ot_val}°C")
                    if ot_val > 150 or ot_val < 0:
                        row_status = "ERROR"
                    elif row_status == "VALID":
                        row_status = "WARNING"
            except:
                issues["oil_temp_anomalies"] += 1
                row_status = "ERROR"

        bearing_temp = row.get('bearing_temp_C')
        if pd.notna(bearing_temp):
            try:
                bt_val = float(bearing_temp)
                if bt_val < 0 or bt_val > 140:
                    issues["bearing_temp_anomalies"] += 1
                    row_notes.append(f"Bearing temp anomaly: {bt_val}°C")
                    if bt_val > 160 or bt_val < 0:
                        row_status = "ERROR"
                    elif row_status == "VALID":
                        row_status = "WARNING"
            except:
                issues["bearing_temp_anomalies"] += 1
                row_status = "ERROR"

        load_pct = row.get('load_percentage')
        if pd.notna(load_pct):
            try:
                l_val = float(load_pct)
                if l_val < 0 or l_val > 100:
                    issues["load_percentage_out_of_range"] += 1
                    row_notes.append(f"Load percentage invalid: {l_val}%")
                    if l_val < 0 or l_val > 120:
                        row_status = "ERROR"
                    elif row_status == "VALID":
                        row_status = "WARNING"
            except:
                issues["load_percentage_out_of_range"] += 1
                row_status = "ERROR"

        if row_status == "VALID":
            valid_count += 1
        elif row_status == "WARNING":
            warning_count += 1
        else:
            error_count += 1
            
        records_assessed.append((
            "MESSY" if is_messy else "CLEAN",
            mine_id,
            eq_type,
            shift,
            float(row['operating_hours']) if pd.notna(row.get('operating_hours')) else None,
            float(row['temperature_C']) if pd.notna(row.get('temperature_C')) else None,
            float(row['vibration']) if pd.notna(row.get('vibration')) else None,
            float(row['pressure_bar']) if pd.notna(row.get('pressure_bar')) else None,
            float(row['dust_level_ug']) if pd.notna(row.get('dust_level_ug')) else None,
            float(row['rpm']) if pd.notna(row.get('rpm')) else None,
            float(row['oil_temp_C']) if pd.notna(row.get('oil_temp_C')) else None,
            float(row['load_percentage']) if pd.notna(row.get('load_percentage')) else None,
            float(row['humidity_pct']) if pd.notna(row.get('humidity_pct')) else None,
            float(row['bearing_temp_C']) if pd.notna(row.get('bearing_temp_C')) else None,
            str(row.get('maintenance_status')) if pd.notna(row.get('maintenance_status')) else None,
            int(row['machine_failure']) if pd.notna(row.get('machine_failure')) else 0,
            row_status,
            "; ".join(row_notes) if row_notes else "OK"
        ))

    # Data Quality Score calculation:
    # 100% * (Valid + 0.6 * Warning + 0 * Error) / Total
    score = round(((valid_count + 0.6 * warning_count) / total_records) * 100, 2)
    
    result = {
        "datasetName": csv_name,
        "totalRecords": total_records,
        "validRecords": valid_count,
        "warningRecords": warning_count,
        "errorRecords": error_count,
        "qualityScore": score,
        "issueBreakdown": issues
    }
    
    return result, records_assessed

def run_quality_pipeline():
    print("==================================================")
    print("       KHANAN SURAKSHA - DATA QUALITY ENGINE      ")
    print("==================================================")
    
    clean_res, clean_records = assess_dataset_quality("complex_mine_sensor_data.csv", is_messy=False)
    print(f"\n[1] Clean Sensor Dataset: {clean_res['datasetName']}")
    print(f"    - Total: {clean_res['totalRecords']:,}")
    print(f"    - Valid: {clean_res['validRecords']:,}")
    print(f"    - Warning: {clean_res['warningRecords']:,}")
    print(f"    - Error: {clean_res['errorRecords']:,}")
    print(f"    - DATA QUALITY SCORE: {clean_res['qualityScore']}%")
    
    messy_res, messy_records = assess_dataset_quality("messy_complex_mine_sensor_data.csv", is_messy=True)
    print(f"\n[2] Messy Sensor Dataset: {messy_res['datasetName']}")
    print(f"    - Total: {messy_res['totalRecords']:,}")
    print(f"    - Valid: {messy_res['validRecords']:,}")
    print(f"    - Warning: {messy_res['warningRecords']:,}")
    print(f"    - Error: {messy_res['errorRecords']:,}")
    print(f"    - DATA QUALITY SCORE: {messy_res['qualityScore']}%")
    
    # Save assessments to Postgres database
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        # Save DataQualityAssessment
        for res in [clean_res, messy_res]:
            cur.execute("""
                INSERT INTO "DataQualityAssessment" (
                    "id", "datasetName", "totalRecords", "validRecords",
                    "warningRecords", "errorRecords", "qualityScore",
                    "issueBreakdown", "evaluatedAt", "createdAt", "updatedAt"
                )
                VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), NOW())
                ON CONFLICT ("datasetName") DO UPDATE SET
                    "totalRecords" = EXCLUDED."totalRecords",
                    "validRecords" = EXCLUDED."validRecords",
                    "warningRecords" = EXCLUDED."warningRecords",
                    "errorRecords" = EXCLUDED."errorRecords",
                    "qualityScore" = EXCLUDED."qualityScore",
                    "issueBreakdown" = EXCLUDED."issueBreakdown",
                    "evaluatedAt" = NOW(),
                    "updatedAt" = NOW();
            """, (
                res["datasetName"],
                res["totalRecords"],
                res["validRecords"],
                res["warningRecords"],
                res["errorRecords"],
                res["qualityScore"],
                json.dumps(res["issueBreakdown"])
            ))
        
        # Batch insert sample of sensor readings (e.g. 5,000 clean + 5,000 messy for telemetry storage)
        print("\nIngesting assessed sensor telemetry records into database...")
        cur.execute('DELETE FROM "SensorReading";')
        
        sample_records = clean_records[:5000] + messy_records[:5000]
        
        insert_query = """
            INSERT INTO "SensorReading" (
                "id", "datasetType", "mineCode", "equipmentType", "shift",
                "operatingHours", "temperatureC", "vibration", "pressureBar",
                "dustLevelUg", "rpm", "oilTempC", "loadPercentage",
                "humidityPct", "bearingTempC", "maintenanceStatus",
                "machineFailure", "qualityStatus", "qualityNotes", "createdAt"
            ) VALUES %s
        """
        
        values = [
            (
                f"SENS-{i:06d}", r[0], r[1], r[2], r[3],
                r[4], r[5], r[6], r[7], r[8], r[9], r[10],
                r[11], r[12], r[13], r[14], r[15], r[16], r[17],
                datetime.utcnow()
            )
            for i, r in enumerate(sample_records)
        ]
        
        execute_values(cur, insert_query, values, page_size=2000)
        conn.commit()
        print(f"[OK] Ingested {len(values):,} assessed sensor telemetry rows.")
        cur.close()
        conn.close()
    except Exception as e:
        print("Error saving to database:", e)
        
    return clean_res, messy_res

if __name__ == "__main__":
    run_quality_pipeline()
