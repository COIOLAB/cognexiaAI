import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Quantum Auth')
@Controller('quantum-auth')
export class QuantumAuthController {
  @Get('status')
  async status() {
    return { success: true, message: 'Quantum auth ready' };
  }
}
