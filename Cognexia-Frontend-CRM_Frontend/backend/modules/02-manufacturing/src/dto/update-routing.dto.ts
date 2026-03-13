import { PartialType } from '@nestjs/swagger';
import { CreateRoutingDto } from './create-routing.dto';

export class UpdateRoutingDto extends PartialType(CreateRoutingDto) {}
