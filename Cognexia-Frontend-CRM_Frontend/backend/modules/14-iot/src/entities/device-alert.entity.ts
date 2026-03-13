import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IoTDevice } from './iot-device.entity';

@Entity('device_alerts')
export class DeviceAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  deviceId: string;

  @Column()
  alertType: string;

  @Column()
  severity: string;

  @Column()
  message: string;

  @Column({ type: 'json', nullable: true })
  details?: any;

  @Column({ default: false })
  resolved: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => IoTDevice)
  @JoinColumn({ name: 'deviceId' })
  device: IoTDevice;
}
