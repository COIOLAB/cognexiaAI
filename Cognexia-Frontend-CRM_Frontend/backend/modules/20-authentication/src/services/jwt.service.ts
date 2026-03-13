import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtService {
  async sign(payload: any): Promise<string> {
    return 'jwt-token-placeholder';
  }

  async verify(token: string): Promise<any> {
    return { valid: true };
  }
}
