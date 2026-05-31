import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '@slooze/shared';
import { PERMISSIONS_KEY } from '../decorators/roles.decorator';
import { PermissionsService } from '../../permissions/permissions.service';
import { AuthUser } from '@slooze/shared';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const allowed = requiredPermissions.every((permission) =>
      this.permissionsService.hasPermission(user.role, permission),
    );

    if (!allowed) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}
