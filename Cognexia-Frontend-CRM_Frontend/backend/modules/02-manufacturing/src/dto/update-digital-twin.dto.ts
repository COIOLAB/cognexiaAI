import { PartialType } from '@nestjs/swagger';
import { CreateDigitalTwinDto } from './create-digital-twin.dto';

export class UpdateDigitalTwinDto extends PartialType(CreateDigitalTwinDto) {}
