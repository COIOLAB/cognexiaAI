import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RobotCalibration } from '../entities/robot-calibration.entity';

@Injectable()
export class RobotCalibrationService {
  private readonly logger = new Logger(RobotCalibrationService.name);

  constructor(
    @InjectRepository(RobotCalibration)
    private readonly calibrationRepository: Repository<RobotCalibration>,
  ) {}

  async getHistory(filters: {
    robotId?: string;
    status?: string;
  }) {
    const query = this.calibrationRepository.createQueryBuilder('calibration')
      .leftJoinAndSelect('calibration.robot', 'robot');

    if (filters.robotId) {
      query.andWhere('calibration.robotId = :robotId', { robotId: filters.robotId });
    }

    if (filters.status) {
      query.andWhere('calibration.status = :status', { status: filters.status });
    }

    query.orderBy('calibration.createdAt', 'DESC');

    const [calibrations, total] = await query.getManyAndCount();

    return {
      calibrations,
      total,
      metrics: {
        pending: calibrations.filter(c => c.status === 'PENDING').length,
        inProgress: calibrations.filter(c => c.status === 'IN_PROGRESS').length,
        completed: calibrations.filter(c => c.status === 'COMPLETED').length,
        failed: calibrations.filter(c => c.status === 'FAILED').length,
      },
    };
  }

  async findById(id: string) {
    const calibration = await this.calibrationRepository.findOne({
      where: { id },
      relations: ['robot'],
    });

    if (!calibration) {
      throw new NotFoundException(`Calibration with ID ${id} not found`);
    }

    return calibration;
  }

  async schedule(calibrationDto: any) {
    const calibration = this.calibrationRepository.create({
      ...calibrationDto,
      status: 'PENDING',
      progress: 0,
      executionHistory: [{
        timestamp: new Date(),
        status: 'PENDING',
        message: 'Calibration scheduled',
      }],
    });

    return await this.calibrationRepository.save(calibration);
  }

  async start(id: string) {
    const calibration = await this.findById(id);

    if (calibration.status !== 'PENDING') {
      throw new Error('Calibration can only be started from PENDING status');
    }

    calibration.status = 'IN_PROGRESS';
    calibration.startedAt = new Date();
    calibration.executionHistory.push({
      timestamp: new Date(),
      status: 'IN_PROGRESS',
      message: 'Calibration process started',
    });

    return await this.calibrationRepository.save(calibration);
  }

  async updateStatus(id: string, statusUpdate: any) {
    const calibration = await this.findById(id);

    calibration.status = statusUpdate.status;
    if (statusUpdate.progress !== undefined) {
      calibration.progress = statusUpdate.progress;
    }

    // Update timestamps based on status
    switch (statusUpdate.status) {
      case 'COMPLETED':
        calibration.completedAt = new Date();
        calibration.progress = 100;
        break;
      case 'FAILED':
        calibration.completedAt = new Date();
        break;
    }

    calibration.executionHistory.push({
      timestamp: new Date(),
      status: statusUpdate.status,
      progress: statusUpdate.progress || calibration.progress,
      message: `Calibration status updated to ${statusUpdate.status}`,
    });

    return await this.calibrationRepository.save(calibration);
  }

  async getResults(id: string) {
    const calibration = await this.findById(id);

    if (calibration.status !== 'COMPLETED') {
      throw new Error('Results are only available for completed calibrations');
    }

    return {
      calibrationId: calibration.id,
      robotId: calibration.robotId,
      type: calibration.type,
      status: calibration.status,
      startedAt: calibration.startedAt,
      completedAt: calibration.completedAt,
      duration: calibration.completedAt.getTime() - calibration.startedAt.getTime(),
      results: calibration.results,
      metrics: calibration.metrics,
      qualityChecks: calibration.qualityChecks,
      parameters: calibration.parameters,
      verificationStatus: calibration.verificationStatus,
    };
  }

  async verify(id: string) {
    const calibration = await this.findById(id);

    if (calibration.status !== 'COMPLETED') {
      throw new Error('Only completed calibrations can be verified');
    }

    // Perform verification checks
    const verificationResults = await this.performVerification(calibration);

    // Update verification status
    calibration.verificationStatus = verificationResults.passed ? 'VERIFIED' : 'FAILED';
    calibration.verificationResults = verificationResults;
    calibration.verifiedAt = new Date();

    calibration.executionHistory.push({
      timestamp: new Date(),
      status: calibration.status,
      message: `Verification ${verificationResults.passed ? 'passed' : 'failed'}`,
      details: verificationResults,
    });

    await this.calibrationRepository.save(calibration);

    return verificationResults;
  }

  async apply(id: string) {
    const calibration = await this.findById(id);

    if (calibration.verificationStatus !== 'VERIFIED') {
      throw new Error('Only verified calibrations can be applied');
    }

    // Apply calibration to robot
    const applicationResult = await this.applyToRobot(calibration);

    // Update application status
    calibration.applicationStatus = applicationResult.success ? 'APPLIED' : 'FAILED';
    calibration.appliedAt = new Date();

    calibration.executionHistory.push({
      timestamp: new Date(),
      status: calibration.status,
      message: `Calibration ${applicationResult.success ? 'applied successfully' : 'application failed'}`,
      details: applicationResult,
    });

    await this.calibrationRepository.save(calibration);

    return applicationResult;
  }

  private async performVerification(calibration: RobotCalibration) {
    // Implement verification logic here
    // For now, return mock results
    return {
      passed: true,
      timestamp: new Date(),
      checks: [
        { name: 'Parameter Range Check', passed: true },
        { name: 'Accuracy Check', passed: true },
        { name: 'Consistency Check', passed: true },
      ],
      metrics: {
        accuracy: 0.99,
        precision: 0.98,
        reliability: 0.97,
      },
    };
  }

  private async applyToRobot(calibration: RobotCalibration) {
    // Implement robot calibration application logic here
    // For now, return mock results
    return {
      success: true,
      timestamp: new Date(),
      parameters: calibration.parameters,
      backupCreated: true,
      robotResponse: {
        status: 'OK',
        message: 'Calibration applied successfully',
      },
    };
  }
}
