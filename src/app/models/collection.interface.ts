import { Art } from "../models/art.interface";

export interface Collection {
    name: string;
    arts: Art[];
}