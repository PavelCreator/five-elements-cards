import { Color } from "./color.type";

export interface Art {
    picturePath?: string,
    name: string,
    collection?: string
    color?: Color;
    level?: number;
    hidden?: boolean;
    horizontalReverse?: boolean;
    isSelected?: boolean;
}