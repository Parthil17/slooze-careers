import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Country, Role } from '@prisma/client';
import { AuthUser } from '@slooze/shared';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsService } from './permissions.service';

@Injectable()
export class CountryAccessService {
  constructor(
    private prisma: PrismaService,
    private permissionsService: PermissionsService,
  ) {}

  restaurantWhere(user: AuthUser) {
    const country = this.permissionsService.getCountryFilter(user);
    return country ? { country } : {};
  }

  orderWhere(user: AuthUser) {
    const country = this.permissionsService.getCountryFilter(user);
    return country ? { country } : {};
  }

  async assertRestaurantAccess(user: AuthUser, restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    if (!this.permissionsService.canAccessCountry(user, restaurant.country as unknown as import('@slooze/shared').Country)) {
      throw new ForbiddenException('You do not have access to this restaurant');
    }
    return restaurant;
  }

  async assertOrderAccess(user: AuthUser, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (
      !this.permissionsService.canAccessCountry(
        user,
        order.country as unknown as import('@slooze/shared').Country,
      )
    ) {
      throw new ForbiddenException('You do not have access to this order');
    }
    if (user.role === Role.MEMBER && order.userId !== user.id) {
      throw new ForbiddenException('You can only access your own orders');
    }
    return order;
  }

  async assertMenuItemAccess(user: AuthUser, menuItemId: string) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { restaurant: true },
    });
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }
    if (
      !this.permissionsService.canAccessCountry(
        user,
        menuItem.restaurant.country as unknown as import('@slooze/shared').Country,
      )
    ) {
      throw new ForbiddenException('You do not have access to this menu item');
    }
    return menuItem;
  }
}
