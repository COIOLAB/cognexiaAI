import { Injectable } from '@nestjs/common';

@Injectable()
export class RiskAssessmentService {
  async execute() {
    return { success: true, message: 'Service ready' };
  }
}