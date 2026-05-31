import { hasPermission, Permission, Role } from '@slooze/shared';

export function can(role: Role, permission: Permission): boolean {
  return hasPermission(role, permission);
}

export const PERMISSION_LABELS: Record<Permission, string> = {
  [Permission.VIEW_RESTAURANTS]: 'View Restaurants',
  [Permission.VIEW_MENU_ITEMS]: 'View Menu Items',
  [Permission.CREATE_ORDER]: 'Create Order',
  [Permission.ADD_FOOD_ITEMS]: 'Add Food Items',
  [Permission.CHECKOUT_ORDER]: 'Checkout Order',
  [Permission.PAY_ORDER]: 'Pay Order',
  [Permission.CANCEL_ORDER]: 'Cancel Order',
  [Permission.UPDATE_PAYMENT_METHOD]: 'Update Payment Method',
};
