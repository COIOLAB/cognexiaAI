import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionManagementService {
  async execute() {
    return { success: true, message: 'Service ready' };
  }
}