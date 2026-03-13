import { Injectable } from '@nestjs/common';

@Injectable()
export class TwoFactorService {
  async execute() {
    return { success: true, message: 'Service ready' };
  }
}