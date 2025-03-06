import { Color } from "./color.type";
import { BoundingClientRect } from "./bounding-client-rect.interface";

export interface Art {
    picturePath?: string,
    name: string,
    collection?: string
    color?: Color;
    level?: number;
    hidden?: boolean;
    horizontalReverse?: boolean;
    isSelected?: boolean;
    boundingClientRect?: BoundingClientRect;
}