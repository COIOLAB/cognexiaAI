import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Security')
@Controller('security')
export class SecurityController {
  @Get('audit')
  @ApiOperation({ summary: 'Security audit' })
  async audit() {
    return { success: true, message: 'Security audit ready' };
  }
}
