import { Injectable } from '@nestjs/common';

@Injectable()  
export class GoogleStrategy {
  async validate() {
    return { success: true };
  }
}