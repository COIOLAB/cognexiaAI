import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IVRMenu } from '../entities/ivr-menu.entity';
import { CreateIVRMenuDto, UpdateIVRMenuDto } from '../dto/telephony.dto';

@Injectable()
export class IVRMenuService {
  constructor(
    @InjectRepository(IVRMenu)
    private readonly ivrMenuRepository: Repository<IVRMenu>,
  ) {}

  async listMenus(tenantId: string) {
    return this.ivrMenuRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async getMenu(tenantId: string, id: string) {
    const menu = await this.ivrMenuRepository.findOne({
      where: { id, tenantId },
    });
    if (!menu) {
      throw new NotFoundException('IVR menu not found');
    }
    return menu;
  }

  async createMenu(tenantId: string, dto: CreateIVRMenuDto) {
    const menu = this.ivrMenuRepository.create({
      tenantId,
      isActive: true,
      ...dto,
    });
    return this.ivrMenuRepository.save(menu);
  }

  async updateMenu(tenantId: string, id: string, dto: UpdateIVRMenuDto) {
    const menu = await this.getMenu(tenantId, id);
    Object.assign(menu, dto);
    return this.ivrMenuRepository.save(menu);
  }

  async deleteMenu(tenantId: string, id: string) {
    const menu = await this.getMenu(tenantId, id);
    await this.ivrMenuRepository.remove(menu);
    return { message: 'IVR menu deleted' };
  }
}
