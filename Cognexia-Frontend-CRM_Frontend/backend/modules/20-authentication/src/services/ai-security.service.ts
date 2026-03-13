import { Injectable } from '@nestjs/common';

@Injectable()
export class AiSecurityService {
  async execute() {
    return { success: true, message: 'Service ready' };
  }
}