import {Elements} from "./elements.interface";

export type HowToWinCardType = 'Blitz' | 'Grand';

export interface HowToWinCard {
    type: HowToWinCardType;
    numberOfElements?: number;
    text?: string;
    pay?: Elements;
    image?: string;
    level?: number;
    option?: number;
}

