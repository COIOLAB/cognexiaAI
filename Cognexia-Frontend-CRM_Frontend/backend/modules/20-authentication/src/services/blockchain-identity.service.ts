import { Injectable } from '@nestjs/common';

@Injectable()
export class BlockchainIdentityService {
  async execute() {
    return { success: true, message: 'Service ready' };
  }
}