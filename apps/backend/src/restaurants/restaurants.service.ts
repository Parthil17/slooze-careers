import { Injectable } from '@nestjs/common';
import { AuthUser } from '@slooze/shared';
import { CountryAccessService } from '../permissions/country-access.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestaurantsService {
  constructor(
    private prisma: PrismaService,
    private countryAccess: CountryAccessService,
  ) {}

  findAll(user: AuthUser) {
    return this.prisma.restaurant.findMany({
      where: this.countryAccess.restaurantWhere(user),
      include: { menuItems: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(user: AuthUser, id: string) {
    await this.countryAccess.assertRestaurantAccess(user, id);
    return this.prisma.restaurant.findUnique({
      where: { id },
      include: { menuItems: true },
    });
  }
}
