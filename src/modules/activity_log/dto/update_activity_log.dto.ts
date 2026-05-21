import { PartialType } from '@nestjs/swagger';
import { CreateActivityLogDto } from './create_activity_log.dto';

export class UpdateActivityLogDto extends PartialType(CreateActivityLogDto) {}
