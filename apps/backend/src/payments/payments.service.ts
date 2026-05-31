import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { AuthUser, Role } from '@slooze/shared';
import { CountryAccessService } from '../permissions/country-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private countryAccess: CountryAccessService,
  ) {}

  listPaymentMethods(user: AuthUser) {
    return this.prisma.paymentMethod.findMany({
      where: { userId: user.id },
      orderBy: { cardHolder: 'asc' },
    });
  }

  async createPayment(user: AuthUser, dto: CreatePaymentDto) {
    const order = await this.countryAccess.assertOrderAccess(user, dto.orderId);

    if (order.status !== OrderStatus.PLACED) {
      throw new BadRequestException('Only placed orders can be paid');
    }

    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: dto.paymentMethodId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    if (paymentMethod.userId !== order.userId) {
      throw new ForbiddenException(
        'Payment method must belong to the order owner',
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethodId: dto.paymentMethodId,
        amount: order.totalAmount,
        status: PaymentStatus.SUCCESS,
      },
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.PAID },
    });

    return payment;
  }

  async updatePaymentMethod(
    user: AuthUser,
    id: string,
    dto: UpdatePaymentMethodDto,
  ) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can update payment methods');
    }

    const method = await this.prisma.paymentMethod.findUnique({ where: { id } });
    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    return this.prisma.paymentMethod.update({
      where: { id },
      data: dto,
    });
  }
}
