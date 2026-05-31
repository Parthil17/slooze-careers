import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { AuthUser, Country } from '@slooze/shared';
import { CountryAccessService } from '../permissions/country-access.service';
import { PermissionsService } from '../permissions/permissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private countryAccess: CountryAccessService,
    private permissionsService: PermissionsService,
  ) {}

  async create(user: AuthUser, dto: CreateOrderDto) {
    if (!this.permissionsService.canAccessCountry(user, dto.country)) {
      throw new ForbiddenException('You cannot create orders in this country');
    }

    return this.prisma.order.create({
      data: {
        userId: user.id,
        country: dto.country as unknown as import('@prisma/client').Country,
        status: OrderStatus.DRAFT,
        totalAmount: 0,
      },
      include: { items: { include: { menuItem: true } } },
    });
  }

  findAll(user: AuthUser) {
    const countryWhere = this.countryAccess.orderWhere(user);
    const userWhere =
      user.role === Role.MEMBER ? { userId: user.id } : {};

    return this.prisma.order.findMany({
      where: { ...countryWhere, ...userWhere },
      include: {
        items: { include: { menuItem: true } },
        user: { select: { id: true, name: true, email: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: AuthUser, id: string) {
    const order = await this.countryAccess.assertOrderAccess(user, id);
    return this.prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: { include: { menuItem: true } },
        user: { select: { id: true, name: true, email: true } },
        payment: true,
      },
    });
  }

  async addItem(user: AuthUser, orderId: string, dto: AddOrderItemDto) {
    const order = await this.countryAccess.assertOrderAccess(user, orderId);

    if (order.userId !== user.id && user.role === Role.MEMBER) {
      throw new ForbiddenException('You can only modify your own orders');
    }

    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Can only add items to draft orders');
    }

    const menuItem = await this.countryAccess.assertMenuItemAccess(
      user,
      dto.menuItemId,
    );

    if (menuItem.restaurant.country !== order.country) {
      throw new BadRequestException(
        'Menu item must belong to the same country as the order',
      );
    }

    const existing = await this.prisma.orderItem.findFirst({
      where: { orderId, menuItemId: dto.menuItemId },
    });

    if (existing) {
      await this.prisma.orderItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + dto.quantity },
      });
    } else {
      await this.prisma.orderItem.create({
        data: {
          orderId,
          menuItemId: dto.menuItemId,
          quantity: dto.quantity,
          price: menuItem.price,
        },
      });
    }

    return this.recalculateTotal(orderId);
  }

  async checkout(user: AuthUser, orderId: string) {
    const order = await this.countryAccess.assertOrderAccess(user, orderId);

    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Only draft orders can be checked out');
    }

    const withItems = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!withItems?.items.length) {
      throw new BadRequestException('Order must have at least one item');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PLACED },
      include: { items: { include: { menuItem: true } } },
    });
  }

  async cancel(user: AuthUser, orderId: string) {
    const order = await this.countryAccess.assertOrderAccess(user, orderId);

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Paid orders cannot be cancelled');
    }
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
      include: { items: { include: { menuItem: true } } },
    });
  }

  private async recalculateTotal(orderId: string) {
    const items = await this.prisma.orderItem.findMany({ where: { orderId } });
    const total = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    return this.prisma.order.update({
      where: { id: orderId },
      data: { totalAmount: total },
      include: { items: { include: { menuItem: true } } },
    });
  }
}
