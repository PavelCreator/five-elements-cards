import { Elements } from "./elements.interface";
import { Color } from "./color.type";
import { Art } from "./art.interface";
import { BoundingClientRect } from "./bounding-client-rect.interface";

export interface Card {
    pay: Elements;
    get: Elements;
    orderNumber: number;
    level: number;
    levelSpecial: boolean;
    color?: Color;
    artData?: Art;
    disabled?: boolean;
    isSelected?: boolean;
    boundingClientRect?: BoundingClientRect;
    hidden?: boolean;
    levelBonus?: boolean;
}