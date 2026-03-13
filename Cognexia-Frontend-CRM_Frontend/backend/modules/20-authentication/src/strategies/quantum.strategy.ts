import { Injectable } from '@nestjs/common';

@Injectable()  
export class QuantumStrategy {
  async validate() {
    return { success: true };
  }
}