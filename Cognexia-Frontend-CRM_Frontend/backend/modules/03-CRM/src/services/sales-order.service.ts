import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export enum OrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface OrderLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  orderDate: string;
  totalAmount: number;
  currency: string;
  salesRep: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderLineItem[];
  shipping: {
    address: string;
    method: string;
    trackingNumber?: string;
  };
  payment: {
    terms: string;
    method: string;
    status: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class SalesOrderService {
  private orders: SalesOrder[] = [];

  constructor() {
    this.seedOrders();
  }

  private seedOrders() {
    if (this.orders.length > 0) {
      return;
    }

    const now = new Date().toISOString();
    this.orders = [
      {
        id: randomUUID(),
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
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  list(filters: any = {}) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    let results = [...this.orders];

    if (filters.status) {
      results = results.filter((order) => order.status === filters.status);
    }

    if (filters.customerId) {
      results = results.filter((order) => order.customerId === filters.customerId);
    }

    if (filters.salesRepId) {
      results = results.filter((order) => order.salesRep.id === filters.salesRepId);
    }

    if (filters.search) {
      const search = String(filters.search).toLowerCase();
      results = results.filter((order) =>
        [order.orderNumber, order.customerName].some((value) => value.toLowerCase().includes(search))
      );
    }

    const total = results.length;
    const start = (page - 1) * limit;
    const data = results.slice(start, start + limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  getById(id: string) {
    return this.orders.find((order) => order.id === id);
  }

  create(data: any) {
    const now = new Date().toISOString();
    const totals = this.calculateOrderTotals(data.items || []);
    const order: SalesOrder = {
      id: randomUUID(),
      orderNumber: `SO-${new Date().getFullYear()}-${String(this.orders.length + 1).padStart(3, '0')}`,
      customerId: data.customerId,
      customerName: data.customerName || 'Unknown Customer',
      status: OrderStatus.DRAFT,
      orderDate: now,
      totalAmount: totals,
      currency: data.currency || 'USD',
      salesRep: {
        id: data.salesRepId,
        name: data.salesRepName || 'Sales Rep',
        email: data.salesRepEmail || 'sales@cognexia.com',
      },
      items: (data.items || []).map((item: any) => ({
        ...item,
        totalPrice: Number(item.quantity || 0) * Number(item.unitPrice || 0) - Number(item.discount || 0),
      })),
      shipping: data.shipping || { address: '', method: '' },
      payment: data.payment || { terms: '', method: '', status: 'pending' },
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.unshift(order);
    return order;
  }

  update(id: string, data: any) {
    const order = this.getById(id);
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

    Object.assign(order, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    return order;
  }

  cancel(id: string, reason?: string) {
    const order = this.update(id, { status: OrderStatus.CANCELLED });
    if (reason) {
      order.notes = reason;
    }
    return order;
  }

  confirm(id: string) {
    return this.update(id, { status: OrderStatus.CONFIRMED });
  }

  ship(id: string, trackingNumber: string) {
    return this.update(id, {
      status: OrderStatus.SHIPPED,
      shipping: {
        ...this.getById(id)?.shipping,
        trackingNumber,
      },
    });
  }

  deliver(id: string) {
    return this.update(id, { status: OrderStatus.DELIVERED });
  }

  bulkCancel(ids: string[]) {
    ids.forEach((id) => {
      if (this.getById(id)) {
        this.cancel(id);
      }
    });
    return { cancelled: ids.length };
  }

  stats() {
    const totalOrders = this.orders.length;
    const totalValue = this.orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const avgOrderValue = totalOrders ? totalValue / totalOrders : 0;
    const statusBreakdown = this.orders.reduce((acc, order) => {
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

  export(filters: any = {}) {
    const { data } = this.list(filters);
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
