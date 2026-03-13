import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class BlockchainGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }  
}