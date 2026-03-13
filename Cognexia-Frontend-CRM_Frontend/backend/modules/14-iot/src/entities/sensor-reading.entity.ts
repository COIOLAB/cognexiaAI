import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IoTDevice } from './iot-device.entity';

@Entity('sensor_readings')
export class SensorReading {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  deviceId: string;

  @Column()
  sensorType: string;

  @Column('decimal')
  value: number;

  @Column({ nullable: true })
  unit?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: any;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => IoTDevice)
  @JoinColumn({ name: 'deviceId' })
  device: IoTDevice;
}
