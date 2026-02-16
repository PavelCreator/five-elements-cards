import {Elements} from "./elements.interface";

export type HowToWinCardType = 'Classic Mode' | 'New Horizons' | 'Collection Mode';

export interface HowToWinCard {
    type: HowToWinCardType,
    numberOfElements?: number,
    text?: string,
    time?: 'quick' | 'normal' | 'long',
    pay?: Elements,
    image?: string;
}

