import { HowToWinCard } from "../models/how-to-win-card.interface";

export const howToWinCards: HowToWinCard[] = [
    {
        type: 'Grand',
        numberOfElements: 6,
        pay: {
            purple: 3,
            black: 3,
            white: 3,
            blue: 3,
            green: 3,
            red: 3,
        },
        option: 1
    },
    {
        type: 'Blitz',
        numberOfElements: 6,
        pay: {
            black: 2,
            white: 2,
            blue: 2,
            green: 2,
            red: 2,
        },
        option: 1
    },
    {
        type: 'Grand',
        numberOfElements: 5,
        pay: {
            purple: 4,
            white: 4,
            blue: 4,
            green: 4,
            red: 4
        },
        option: 2
    },
    {
        type: 'Blitz',
        numberOfElements: 5,
        pay: {
            purple: 2,
            white: 2,
            blue: 2,
            green: 2,
            red: 2
        },
        option: 2
    },
    {
        type: 'Grand',
        numberOfElements: 4,
        pay: {
            white: 7,
            blue: 7,
            green: 7,
            red: 7
        },
        option: 3
    },
    {
        type: 'Blitz',
        numberOfElements: 4,
        pay: {
            white: 4,
            blue: 4,
            green: 4,
            red: 4
        },
        option: 3
    },
    {
        type: 'Grand',
        numberOfElements: 2,
        pay: {
            twoOf4: 9,
        },
        option: 4
    },
    {
        type: 'Blitz',
        numberOfElements: 2,
        pay: {
            twoOf4: 6,
        },
        option: 4
    },
    {
        type: 'Grand',
        numberOfElements: 1,
        pay: {
            oneOf4: 14,
        },
        option: 5
    },
    {
        type: 'Blitz',
        numberOfElements: 1,
        pay: {
            oneOf4: 9,
        },
        option: 5
    },
    {
        type: 'Grand',
        numberOfElements: 2,
        text: 'Dragons',
        option: 6
    },
    {
        type: 'Blitz',
        numberOfElements: 1,
        text: 'Dragon',
        option: 6
    },
    {
        type: 'Grand',
        numberOfElements: 4,
        level: 3,
        option: 7
    },
    {
        type: 'Blitz',
        numberOfElements: 4,
        level: 2,
        option: 7
    },
    {
        type: 'Grand',
        numberOfElements: 3,
        level: 4,
        option: 8
    },
    {
        type: 'Blitz',
        numberOfElements: 3,
        level: 3,
        option: 8
    },
];