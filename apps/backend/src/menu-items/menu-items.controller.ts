import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permission } from '@slooze/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermissions } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { AuthUser } from '@slooze/shared';
import { MenuItemsService } from './menu-items.service';

@ApiTags('Menu')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('menu-items')
export class MenuItemsController {
  constructor(private menuItemsService: MenuItemsService) {}

  @Get()
  @RequirePermissions(Permission.VIEW_MENU_ITEMS)
  @ApiOperation({ summary: 'List menu items (country-filtered)' })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('restaurantId') restaurantId?: string,
  ) {
    return this.menuItemsService.findAll(user, restaurantId);
  }

  @Get(':id')
  @RequirePermissions(Permission.VIEW_MENU_ITEMS)
  @ApiOperation({ summary: 'Get menu item by id' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.menuItemsService.findOne(user, id);
  }
}
