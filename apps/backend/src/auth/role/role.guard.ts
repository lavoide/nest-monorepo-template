import RequestWithUser from '../requestWithUser.interface';
import { Role } from 'src/shared/enums/role.enum';
import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';

const RoleGuard = (roles: Array<Role>): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;

      return roles.includes(user?.role as Role);
    }
  }

  return mixin(RoleGuardMixin);
};

export default RoleGuard;
