import { Injectable } from '@nestjs/common';

@Injectable()
export class RoleService {
  async execute() {
    return { success: true, message: 'Service ready' };
  }
}