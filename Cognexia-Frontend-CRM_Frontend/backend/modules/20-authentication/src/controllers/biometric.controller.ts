import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Biometric") @Controller("biometric") export class BiometricController { @Get("status") async status() { return { success: true }; } }
