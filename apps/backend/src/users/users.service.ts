import { Injectable } from '@nestjs/common';
import { Permission } from '@slooze/shared';
import { AuthUser } from '@slooze/shared';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class UsersService {
  constructor(private permissionsService: PermissionsService) {}

  getProfile(user: AuthUser) {
    const permissions = Object.values(Permission).filter((p) =>
      this.permissionsService.hasPermission(user.role, p),
    );

    return {
      ...user,
      permissions,
    };
  }
}
