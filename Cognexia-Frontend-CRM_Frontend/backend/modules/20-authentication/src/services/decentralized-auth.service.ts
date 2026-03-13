import { Injectable } from '@nestjs/common';

@Injectable()
export class DecentralizedAuthService {
  async execute() {
    return { success: true, message: 'Service ready' };
  }
}