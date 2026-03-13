import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('iot_gateways')
export class IoTGateway {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'json', nullable: true })
  configuration?: any;

  @Column({ type: 'json', nullable: true })
  connectedDevices?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
