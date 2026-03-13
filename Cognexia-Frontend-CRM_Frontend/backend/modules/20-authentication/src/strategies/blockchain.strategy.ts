import { Injectable } from '@nestjs/common';

@Injectable()  
export class BlockchainStrategy {
  async validate() {
    return { success: true };
  }
}