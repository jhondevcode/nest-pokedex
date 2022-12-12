import {
  IsInt,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePokemonDto {
  @IsInt()
  @IsPositive()
  @Min(1)
  public no: number;

  @IsString()
  @MinLength(1)
  public name: string;
}
