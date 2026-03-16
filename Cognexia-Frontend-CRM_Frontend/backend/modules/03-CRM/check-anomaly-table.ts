import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function checkAnomalyTable() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || 'postgres',
  });

  try {
    await dataSource.initialize();
    
    // Check if table exists
    const tables = await dataSource.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'anomaly_detections'
    `);

    if (tables.length === 0) {
      console.log('❌ Table anomaly_detections does not exist');
      console.log('Creating table...');
      
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS anomaly_detections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID,
          anomaly_type VARCHAR(50) NOT NULL,
          severity VARCHAR(20) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          metric_name VARCHAR(100) NOT NULL,
          expected_value DECIMAL(15, 2) NOT NULL,
          actual_value DECIMAL(15, 2) NOT NULL,
          deviation_percentage DECIMAL(5, 2) NOT NULL,
          context_data JSON,
          auto_resolved BOOLEAN DEFAULT false,
          resolution_action TEXT,
          status VARCHAR(20) DEFAULT 'detected',
          resolved_at TIMESTAMP,
          resolved_by UUID,
          detected_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_anomaly_org_detected 
          ON anomaly_detections(organization_id, detected_at);
        CREATE INDEX IF NOT EXISTS idx_anomaly_type_severity 
          ON anomaly_detections(anomaly_type, severity);
        CREATE INDEX IF NOT EXISTS idx_anomaly_status 
          ON anomaly_detections(status);
      `);
      
      console.log('✅ Table anomaly_detections created successfully');
    } else {
      console.log('✅ Table anomaly_detections exists');
      
      // Check columns
      const columns = await dataSource.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'anomaly_detections'
        ORDER BY ordinal_position
      `);
      
      console.log('\nTable columns:');
      columns.forEach((col: any) => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkAnomalyTable();
