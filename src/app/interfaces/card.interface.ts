import { Elements } from "./elements.interface";
import { Color } from "./color.type";
import {Art} from "./art.interface";

export interface Card {
    pay: Elements;
    get: Elements;
    orderNumber: number;
    level: number;
    levelSpecial: boolean;
    color?: Color;
    artData?: Art;
    isSelected?: boolean;
}