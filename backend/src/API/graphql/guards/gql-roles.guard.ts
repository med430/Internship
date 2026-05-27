import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { Role } from '../../../Domain/enums/role.enum'
import { ROLES_KEY } from '../../http/decorators/roles.decorator'

@Injectable()
export class GqlRolesGuard implements CanActivate {

    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ])
        if (!roles?.length) return true

        const ctx = GqlExecutionContext.create(context)
        const user = ctx.getContext().req?.user

        if (!user?.role) throw new ForbiddenException()
        if (!roles.includes(user.role)) throw new ForbiddenException()

        return true
    }
}
