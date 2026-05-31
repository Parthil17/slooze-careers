import { Permission, Role } from '@slooze/shared';
import { can } from './permissions';

describe('permissions', () => {
  it('allows manager to checkout', () => {
    expect(can(Role.MANAGER, Permission.CHECKOUT_ORDER)).toBe(true);
  });

  it('denies member checkout', () => {
    expect(can(Role.MEMBER, Permission.CHECKOUT_ORDER)).toBe(false);
  });

  it('allows only admin to update payment method', () => {
    expect(can(Role.ADMIN, Permission.UPDATE_PAYMENT_METHOD)).toBe(true);
    expect(can(Role.MANAGER, Permission.UPDATE_PAYMENT_METHOD)).toBe(false);
  });
});
