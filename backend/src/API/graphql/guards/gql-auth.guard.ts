import { ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { JwtAuthGuard } from '../../http/guards/jwt-auth.guard'

@Injectable()
export class GqlAuthGuard extends JwtAuthGuard {
    protected getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context)
        return ctx.getContext().req
    }
}
