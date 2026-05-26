import { ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { JwtAuthGuard } from '../../http/guards/jwt-auth.guard'

@Injectable()
export class GqlAuthGuard extends JwtAuthGuard {

    getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context)
        return ctx.getContext().req
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (this.isDevBypassEnabled()) {
            const req = this.getRequest(context)
            req.user = await this.resolveDevBypassUser()
            return true
        }
        return super.canActivate(context) as Promise<boolean>
    }
}
