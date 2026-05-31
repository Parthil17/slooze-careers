import { Country, Permission, Role } from '@slooze/shared';
import { PermissionsService } from './permissions.service';

describe('PermissionsService', () => {
  let service: PermissionsService;

  beforeEach(() => {
    service = new PermissionsService();
  });

  it('allows all roles to view restaurants', () => {
    expect(service.hasPermission(Role.MEMBER, Permission.VIEW_RESTAURANTS)).toBe(true);
    expect(service.hasPermission(Role.MANAGER, Permission.VIEW_RESTAURANTS)).toBe(true);
    expect(service.hasPermission(Role.ADMIN, Permission.VIEW_RESTAURANTS)).toBe(true);
  });

  it('denies member checkout', () => {
    expect(service.hasPermission(Role.MEMBER, Permission.CHECKOUT_ORDER)).toBe(false);
    expect(service.hasPermission(Role.MANAGER, Permission.CHECKOUT_ORDER)).toBe(true);
  });

  it('allows only admin to update payment method', () => {
    expect(service.hasPermission(Role.ADMIN, Permission.UPDATE_PAYMENT_METHOD)).toBe(true);
    expect(service.hasPermission(Role.MANAGER, Permission.UPDATE_PAYMENT_METHOD)).toBe(false);
  });

  it('grants admin global country access', () => {
    const admin = { id: '1', name: 'Nick', email: 'a@b.com', role: Role.ADMIN, country: Country.GLOBAL };
    expect(service.canAccessCountry(admin, Country.INDIA)).toBe(true);
    expect(service.canAccessCountry(admin, Country.AMERICA)).toBe(true);
  });

  it('restricts india manager to india only', () => {
    const manager = {
      id: '2',
      name: 'Marvel',
      email: 'm@b.com',
      role: Role.MANAGER,
      country: Country.INDIA,
    };
    expect(service.canAccessCountry(manager, Country.INDIA)).toBe(true);
    expect(service.canAccessCountry(manager, Country.AMERICA)).toBe(false);
  });
});
