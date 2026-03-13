import { Injectable } from '@nestjs/common';

@Injectable()
export class OauthService {
  async execute() {
    return { success: true, message: 'Service ready' };
  }
}