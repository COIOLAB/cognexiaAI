import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AiSecurityGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }  
}