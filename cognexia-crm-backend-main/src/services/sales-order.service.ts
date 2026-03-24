import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { SalesOrder, OrderStatus } from '../entities/sales-order.entity';

@Injectable()
export class SalesOrderService implements OnModuleInit {
  constructor(
    @InjectRepository(SalesOrder)
    private readonly salesOrderRepository: Repository<SalesOrder>,
  ) {}

  async onModuleInit() {
    await this.seedOrders();
  }

  private async seedOrders() {
    const count = await this.salesOrderRepository.count();
    if (count > 0) {
      return;
    }

    const now = new Date();
    const order = this.salesOrderRepository.create({
      orderNumber: 'SO-2026-001',
      customerId: 'CUST-001',
      customerName: 'TechCorp Industries',
      status: OrderStatus.CONFIRMED,
      orderDate: now,
      totalAmount: 125000,
      currency: 'USD',
      salesRep: {
        id: 'REP-001',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@cognexia.com',
      },
      items: [
        {
          productId: 'PROD-001',
          productName: 'Enterprise CRM Suite',
          quantity: 25,
          unitPrice: 5000,
          discount: 0,
          totalPrice: 125000,
        },
      ],
      shipping: {
        address: '123 Tech Avenue, San Francisco, CA',
        method: 'Digital Delivery',
      },
      payment: {
        terms: 'NET30',
        method: 'Invoice',
        status: 'pending',
      },
      notes: 'Initial rollout',
    });

    await this.salesOrderRepository.save(order);
  }

  async list(filters: any = {}) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.salesOrderRepository.createQueryBuilder('order');

    if (filters.status) {
      queryBuilder.andWhere('order.status = :status', { status: filters.status });
    }

    if (filters.customerId) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters.salesRepId) {
      queryBuilder.andWhere("order.salesRep->>'id' = :salesRepId", { salesRepId: filters.salesRepId });
    }

    if (filters.search) {
      const search = `%${filters.search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(order.orderNumber) LIKE :search OR LOWER(order.customerName) LIKE :search)',
        { search },
      );
    }

    queryBuilder.orderBy('order.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string) {
    return await this.salesOrderRepository.findOne({ where: { id } });
  }

  async create(data: any) {
    const now = new Date();
    const count = await this.salesOrderRepository.count();
    const orderNumber = `SO-${now.getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    
    const items = (data.items || []).map((item: any) => ({
      ...item,
      totalPrice: Number(item.quantity || 0) * Number(item.unitPrice || 0) - Number(item.discount || 0),
    }));

    const totalAmount = this.calculateOrderTotals(items);

    const order = this.salesOrderRepository.create({
      orderNumber,
      customerId: data.customerId,
      customerName: data.customerName || 'Unknown Customer',
      status: OrderStatus.DRAFT,
      orderDate: data.orderDate ? new Date(data.orderDate) : now,
      totalAmount,
      currency: data.currency || 'USD',
      salesRep: {
        id: data.salesRepId,
        name: data.salesRepName || 'Sales Rep',
        email: data.salesRepEmail || 'sales@cognexia.com',
      },
      items,
      shipping: data.shipping || { address: '', method: '' },
      payment: data.payment || { terms: '', method: '', status: 'pending' },
      notes: data.notes,
    });

    return await this.salesOrderRepository.save(order);
  }

  async update(id: string, data: any) {
    const order = await this.getById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (data.items) {
      order.items = data.items.map((item: any) => ({
        ...item,
        totalPrice: Number(item.quantity || 0) * Number(item.unitPrice || 0) - Number(item.discount || 0),
      }));
      order.totalAmount = this.calculateOrderTotals(order.items);
    }

    Object.assign(order, data);

    return await this.salesOrderRepository.save(order);
  }

  async cancel(id: string, reason?: string) {
    const updateData: any = { status: OrderStatus.CANCELLED };
    if (reason) {
      updateData.notes = reason;
    }
    return await this.update(id, updateData);
  }

  async confirm(id: string) {
    return await this.update(id, { status: OrderStatus.CONFIRMED });
  }

  async ship(id: string, trackingNumber: string) {
    const order = await this.getById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return await this.update(id, {
      status: OrderStatus.SHIPPED,
      shipping: {
        ...order.shipping,
        trackingNumber,
      },
    });
  }

  async deliver(id: string) {
    return await this.update(id, { status: OrderStatus.DELIVERED });
  }

  async bulkCancel(ids: string[]) {
    let cancelled = 0;
    for (const id of ids) {
      try {
        await this.cancel(id);
        cancelled++;
      } catch (e) {
        // Skip if not found
      }
    }
    return { cancelled };
  }

  async stats() {
    const orders = await this.salesOrderRepository.find();
    const totalOrders = orders.length;
    const totalValue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const avgOrderValue = totalOrders ? totalValue / totalOrders : 0;
    const statusBreakdown = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);

    return {
      totalOrders,
      totalValue,
      avgOrderValue,
      statusBreakdown,
    };
  }

  async export(filters: any = {}) {
    const { data } = await this.list(filters);
    const headers = ['orderNumber', 'customerName', 'status', 'orderDate', 'totalAmount'];
    const rows = data.map((order) =>
      [order.orderNumber, order.customerName, order.status, order.orderDate, order.totalAmount].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  private calculateOrderTotals(items: Array<{ quantity: number; unitPrice: number; discount?: number }>) {
    return items.reduce((sum, item) => {
      const lineTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0) - Number(item.discount || 0);
      return sum + lineTotal;
    }, 0);
  }
}

