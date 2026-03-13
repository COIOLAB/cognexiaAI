import { Injectable } from '@nestjs/common';

@Injectable()  
export class BiometricStrategy {
  async validate() {
    return { success: true };
  }
}