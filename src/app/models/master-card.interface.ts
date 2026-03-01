import { Art } from "./art.interface";
import { BoundingClientRect } from "./bounding-client-rect.interface";

export interface MasterCard {
    text: {
        ru: string;
        en: string;
    },
    textDescription?: {
        ru: string;
        en: string;
    },
    color: string;
    orderNumber: number;
    image?: string;
    grand?: boolean;
}

