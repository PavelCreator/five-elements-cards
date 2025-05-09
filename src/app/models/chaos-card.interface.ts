import { BoundingClientRect } from "./bounding-client-rect.interface";

export interface ChaosCard {
    text: {
        ru: string;
        en: string;
    },
    orderNumber: number;
    hidden?: boolean;
    isSelected?: boolean;
    image?: string;
    horizontalReverse?: boolean;
    boundingClientRect?: BoundingClientRect
}

