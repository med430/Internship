import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {

        const roles = this.reflector.get<string[]>('roles', context.getHandler())
        if (!roles) return true

        const req = context.switchToHttp().getRequest()
        const user = req.user

        const hasRole = roles.some(r => user.roles.includes(r))

        if (!hasRole) throw new ForbiddenException()

        return true
    }
}