import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permission } from '@slooze/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermissions } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { AuthUser } from '@slooze/shared';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @RequirePermissions(Permission.CREATE_ORDER)
  @ApiOperation({ summary: 'Create draft order' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user, dto);
  }

  @Get()
  @RequirePermissions(Permission.CREATE_ORDER)
  @ApiOperation({ summary: 'List orders (country-filtered)' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.ordersService.findAll(user);
  }

  @Get(':id')
  @RequirePermissions(Permission.CREATE_ORDER)
  @ApiOperation({ summary: 'Get order by id' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ordersService.findOne(user, id);
  }

  @Post(':id/items')
  @RequirePermissions(Permission.ADD_FOOD_ITEMS)
  @ApiOperation({ summary: 'Add item to order cart' })
  addItem(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: AddOrderItemDto,
  ) {
    return this.ordersService.addItem(user, id, dto);
  }

  @Post(':id/checkout')
  @RequirePermissions(Permission.CHECKOUT_ORDER)
  @ApiOperation({ summary: 'Checkout order (Manager/Admin)' })
  checkout(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ordersService.checkout(user, id);
  }

  @Patch(':id/cancel')
  @RequirePermissions(Permission.CANCEL_ORDER)
  @ApiOperation({ summary: 'Cancel order (Manager/Admin)' })
  cancel(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ordersService.cancel(user, id);
  }
}
