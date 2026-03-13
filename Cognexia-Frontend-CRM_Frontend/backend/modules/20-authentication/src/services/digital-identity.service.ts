import { Injectable } from '@nestjs/common';

@Injectable()
export class DigitalIdentityService {
  async execute() {
    return { success: true, message: 'Service ready' };
  }
}