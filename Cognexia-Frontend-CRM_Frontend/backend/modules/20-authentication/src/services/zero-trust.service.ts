import { Injectable } from '@nestjs/common';

@Injectable()
export class ZeroTrustService {
  async execute() {
    return { success: true, message: 'Service ready' };
  }
}