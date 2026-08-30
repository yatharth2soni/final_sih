import os
import psycopg2

conn = psycopg2.connect(os.environ.get('DATABASE_URL', 'postgresql://postgres.xzkjkanwijrucsrwintb:Soni_yatharth@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require'))
cur = conn.cursor()
tables = [
    'Company', 'Mine', 'ProductionRecord', 'ComplianceRequirement',
    'ComplianceRecord', 'Inspection', 'Observation', 'Incident',
    'Violation', 'CorrectiveAction', 'Contractor', 'Worker',
    'AttendanceRecord', 'EnvironmentalReading', 'Equipment',
    'Attachment', 'Grievance', 'AuditLog', 'SensorReading',
    'DataQualityAssessment', 'RiskScore'
]
print("==================================================")
print("             POSTGRESQL DATABASE COUNTS           ")
print("==================================================")
for t in tables:
    try:
        cur.execute(f'SELECT COUNT(*) FROM "{t}";')
        cnt = cur.fetchone()[0]
        print(f"- {t:24}: {cnt:8,}")
    except Exception as e:
        print(f"- {t:24}: ERROR ({e})")
cur.close()
conn.close()
