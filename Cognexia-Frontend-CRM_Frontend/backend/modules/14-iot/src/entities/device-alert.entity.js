var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IoTDevice } from './iot-device.entity';
let DeviceAlert = class DeviceAlert {
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], DeviceAlert.prototype, "id", void 0);
__decorate([
    Column('uuid'),
    __metadata("design:type", String)
], DeviceAlert.prototype, "deviceId", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], DeviceAlert.prototype, "alertType", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], DeviceAlert.prototype, "severity", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], DeviceAlert.prototype, "message", void 0);
__decorate([
    Column({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], DeviceAlert.prototype, "details", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], DeviceAlert.prototype, "resolved", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], DeviceAlert.prototype, "createdAt", void 0);
__decorate([
    ManyToOne(() => IoTDevice),
    JoinColumn({ name: 'deviceId' }),
    __metadata("design:type", IoTDevice)
], DeviceAlert.prototype, "device", void 0);
DeviceAlert = __decorate([
    Entity('device_alerts')
], DeviceAlert);
export { DeviceAlert };
//# sourceMappingURL=device-alert.entity.js.map