import { Global, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CountryAccessService } from './country-access.service';

@Global()
@Module({
  providers: [PermissionsService, CountryAccessService],
  exports: [PermissionsService, CountryAccessService],
})
export class PermissionsModule {}
