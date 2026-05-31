export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
}

export enum Country {
  GLOBAL = 'GLOBAL',
  INDIA = 'INDIA',
  AMERICA = 'AMERICA',
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PLACED = 'PLACED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum Permission {
  VIEW_RESTAURANTS = 'VIEW_RESTAURANTS',
  VIEW_MENU_ITEMS = 'VIEW_MENU_ITEMS',
  CREATE_ORDER = 'CREATE_ORDER',
  ADD_FOOD_ITEMS = 'ADD_FOOD_ITEMS',
  CHECKOUT_ORDER = 'CHECKOUT_ORDER',
  PAY_ORDER = 'PAY_ORDER',
  CANCEL_ORDER = 'CANCEL_ORDER',
  UPDATE_PAYMENT_METHOD = 'UPDATE_PAYMENT_METHOD',
}

export const PERMISSION_MATRIX: Record<Permission, Role[]> = {
  [Permission.VIEW_RESTAURANTS]: [Role.ADMIN, Role.MANAGER, Role.MEMBER],
  [Permission.VIEW_MENU_ITEMS]: [Role.ADMIN, Role.MANAGER, Role.MEMBER],
  [Permission.CREATE_ORDER]: [Role.ADMIN, Role.MANAGER, Role.MEMBER],
  [Permission.ADD_FOOD_ITEMS]: [Role.ADMIN, Role.MANAGER, Role.MEMBER],
  [Permission.CHECKOUT_ORDER]: [Role.ADMIN, Role.MANAGER],
  [Permission.PAY_ORDER]: [Role.ADMIN, Role.MANAGER],
  [Permission.CANCEL_ORDER]: [Role.ADMIN, Role.MANAGER],
  [Permission.UPDATE_PAYMENT_METHOD]: [Role.ADMIN],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return PERMISSION_MATRIX[permission].includes(role);
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  country: Country;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  country: Country;
}
