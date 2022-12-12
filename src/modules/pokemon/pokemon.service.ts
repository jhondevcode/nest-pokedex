import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
  ) {}

  public create = async (createPokemonDto: CreatePokemonDto) => {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleException(error);
    }
  };

  public findAll = () => {
    return this.pokemonModel.find();
  };

  public findOne = async (id: string) => {
    let pokemon: Pokemon;
    if (!pokemon && !isNaN(+id)) {
      pokemon = await this.pokemonModel.findOne({ no: id });
    }

    if (!pokemon && isValidObjectId(id)) {
      pokemon = await this.pokemonModel.findById(id);
    }

    if (!pokemon && id.length > 0) {
      pokemon = await this.pokemonModel.findOne({
        name: id.toLocaleLowerCase().trim(),
      });
    }

    if (!pokemon)
      throw new NotFoundException(`No pokemon found with id '${id}'`);
    return pokemon;
  };

  public update = async (id: string, updatePokemonDto: UpdatePokemonDto) => {
    const pokemon = await this.findOne(id);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

    try {
      await pokemon.updateOne(updatePokemonDto, { new: true });
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleException(error);
    }
  };

  
  public remove = async (id: string): Promise<any> => {
    // const pokemon = await this.findOne(id);
    // try {
    //   await pokemon.deleteOne();
    //   return pokemon;
    // } catch(error) {
    //   this.handleException(error);
    // }
    // const result = this.pokemonModel.findByIdAndDelete(id);
    const result = await this.pokemonModel.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) throw new BadRequestException(`Pokemon with id '${id}' not found`);
    return;
  };

  private handleException = (error: any) => {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon exist in db ${JSON.stringify(error.keyValue)}`,
      );
    } else {
      console.error(error);
      throw new InternalServerErrorException(
        `Can't update Pokemon - Check server logs`,
      );
    }
  };
}
