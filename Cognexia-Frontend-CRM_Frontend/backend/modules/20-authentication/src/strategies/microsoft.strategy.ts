import { Injectable } from '@nestjs/common';

@Injectable()  
export class MicrosoftStrategy {
  async validate() {
    return { success: true };
  }
}