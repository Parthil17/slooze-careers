import { Injectable } from '@nestjs/common';
import { AuthUser } from '@slooze/shared';
import { CountryAccessService } from '../permissions/country-access.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuItemsService {
  constructor(
    private prisma: PrismaService,
    private countryAccess: CountryAccessService,
  ) {}

  findAll(user: AuthUser, restaurantId?: string) {
    const countryFilter = this.countryAccess.restaurantWhere(user);
    return this.prisma.menuItem.findMany({
      where: {
        ...(restaurantId ? { restaurantId } : {}),
        restaurant: countryFilter,
      },
      include: { restaurant: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(user: AuthUser, id: string) {
    const item = await this.countryAccess.assertMenuItemAccess(user, id);
    return item;
  }
}
