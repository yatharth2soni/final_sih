import psycopg2
import uuid
from datetime import datetime

import os
conn = psycopg2.connect(os.environ.get('DATABASE_URL', 'postgresql://postgres.xzkjkanwijrucsrwintb:Soni_yatharth@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require'))
cur = conn.cursor()

try:
    cur.execute('DELETE FROM "AuditLog";')
    cur.execute('ALTER SEQUENCE "AuditLog_sequence_seq" RESTART WITH 1;')
    cur.execute("""
        INSERT INTO "AuditLog" ("id", "occurredAt", "action", "entityType", "entityId", "prevHash", "payloadHash", "hmacHash", "chainVersion", "isHistorical", "createdAt")
        VALUES (%s, NOW(), 'TEST_ACTION', 'TestEntity', 'ENT-1', 'prev', 'payload', 'hmac', '1.0.0', true, NOW())
        RETURNING "sequence";
    """, (str(uuid.uuid4()),))
    seq = cur.fetchone()[0]
    conn.commit()
    print("Successfully inserted with sequence:", seq)
except Exception as e:
    conn.rollback()
    print("Error:", e)
cur.close()
conn.close()
