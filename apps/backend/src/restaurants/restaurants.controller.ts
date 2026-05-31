import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permission } from '@slooze/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermissions } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { AuthUser } from '@slooze/shared';
import { RestaurantsService } from './restaurants.service';

@ApiTags('Restaurants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Get()
  @RequirePermissions(Permission.VIEW_RESTAURANTS)
  @ApiOperation({ summary: 'List restaurants (country-filtered)' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.restaurantsService.findAll(user);
  }

  @Get(':id')
  @RequirePermissions(Permission.VIEW_RESTAURANTS)
  @ApiOperation({ summary: 'Get restaurant by id' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.restaurantsService.findOne(user, id);
  }
}
