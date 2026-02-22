import {Elements} from "./elements.interface";

export type HowToWinCardType = 'Classic' | 'Blitz' | 'Grand';

export interface HowToWinCard {
    type: HowToWinCardType,
    numberOfElements?: number,
    text?: string,
    pay?: Elements,
    image?: string;
}

