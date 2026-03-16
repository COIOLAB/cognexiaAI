import { Injectable } from '@nestjs/common';

@Injectable()
export class BlockchainAuthService {
  async execute() {
    return { success: true, message: 'Service ready' };
  }
}