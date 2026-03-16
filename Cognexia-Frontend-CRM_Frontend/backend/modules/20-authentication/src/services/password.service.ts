import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordService {
  async execute() {
    return { success: true, message: 'Service ready' };
  }
}