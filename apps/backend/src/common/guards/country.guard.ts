import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Country } from '@slooze/shared';
import { PermissionsService } from '../../permissions/permissions.service';
import { AuthUser } from '@slooze/shared';

export const COUNTRY_PARAM_KEY = 'countryParam';

@Injectable()
export class CountryGuard implements CanActivate {
  constructor(private permissionsService: PermissionsService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user: AuthUser; params: Record<string, string>; body: Record<string, unknown> }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const targetCountry =
      (request.params?.country as Country | undefined) ??
      (request.body?.country as Country | undefined);

    if (!targetCountry) {
      return true;
    }

    if (!this.permissionsService.canAccessCountry(user, targetCountry)) {
      throw new ForbiddenException(
        'You do not have access to resources in this country',
      );
    }

    return true;
  }
}
