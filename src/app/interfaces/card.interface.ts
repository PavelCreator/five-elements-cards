import { Elements } from "./elements.interface";
import { Color } from "./color.type";

export interface Card {
    pay: Elements;
    get: Elements;
    orderNumber: number;
    level: number;
    levelSpecial: boolean;
    picturePath?: string;
    name?: string;
    color?: Color;
}