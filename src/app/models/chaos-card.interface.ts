import { Art } from "./art.interface";
import { BoundingClientRect } from "./bounding-client-rect.interface";

export interface ChaosCard {
    text: {
        ru: string;
        en: string;
    },
    orderNumber: number;
    isSelected?: boolean;
    artData?: Art;
    boundingClientRect?: BoundingClientRect
}

