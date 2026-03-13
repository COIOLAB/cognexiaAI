import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Blockchain Auth')
@Controller('blockchain-auth')
export class BlockchainAuthController {
  @Get('status')
  async status() {
    return { success: true, message: 'Blockchain auth ready' };
  }
}
