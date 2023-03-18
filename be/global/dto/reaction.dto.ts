import { IsEnum } from 'class-validator';
import { ErrorMessage } from 'enum/error';
import { EReactionType } from 'enum/idea.enum';

export class VCreateReactionDto {
  @IsEnum(EReactionType, {
    message: ErrorMessage.REACTION_TYPE_NOT_EXISTS,
  })
  reaction: EReactionType;
}
