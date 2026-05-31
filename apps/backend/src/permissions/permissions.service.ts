import { Injectable } from '@nestjs/common';
import {
  AuthUser,
  Country,
  hasPermission,
  Permission,
  Role,
} from '@slooze/shared';

@Injectable()
export class PermissionsService {
  hasPermission(role: Role, permission: Permission): boolean {
    return hasPermission(role, permission);
  }

  canAccessCountry(user: AuthUser, targetCountry: Country): boolean {
    if (user.role === Role.ADMIN || user.country === Country.GLOBAL) {
      return true;
    }
    return user.country === targetCountry;
  }

  getCountryFilter(user: AuthUser): Country | undefined {
    if (user.role === Role.ADMIN || user.country === Country.GLOBAL) {
      return undefined;
    }
    return user.country;
  }
}
