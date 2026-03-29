import { IsNumber, IsOptional, IsString, IsBoolean, IsNotEmpty} from "class-validator";

export class UpdateCategoryRequest{ 
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsOptional()
    code?: string;

    @IsNumber()
    @IsOptional()
    parentId?: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsBoolean()
    @IsOptional()
    status?: boolean = true;
}