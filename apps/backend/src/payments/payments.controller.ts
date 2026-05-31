import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permission } from '@slooze/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermissions } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { AuthUser } from '@slooze/shared';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('payments')
  @RequirePermissions(Permission.PAY_ORDER)
  @ApiOperation({ summary: 'Pay for a placed order' })
  pay(@CurrentUser() user: AuthUser, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(user, dto);
  }

  @Get('payment-methods')
  @RequirePermissions(Permission.PAY_ORDER)
  @ApiOperation({ summary: 'List user payment methods' })
  listMethods(@CurrentUser() user: AuthUser) {
    return this.paymentsService.listPaymentMethods(user);
  }

  @Patch('payment-methods/:id')
  @RequirePermissions(Permission.UPDATE_PAYMENT_METHOD)
  @ApiOperation({ summary: 'Update payment method (Admin only)' })
  updateMethod(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    return this.paymentsService.updatePaymentMethod(user, id, dto);
  }
}
