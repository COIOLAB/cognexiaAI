import { Injectable } from '@nestjs/common';

@Injectable()
export class BiometricAuthService {
  async execute() {
    return { success: true, message: 'Service ready' };
  }
}