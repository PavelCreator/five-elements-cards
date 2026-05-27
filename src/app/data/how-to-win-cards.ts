import { HowToWinCard } from "../models/how-to-win-card.interface";


// TODO add black only, black and purple, purple only conditions
export const howToWinCards: HowToWinCard[] = [
    {
        type: 'Grand',
        numberOfElements: 5,
        pay: {
            purple: 4,
            white: 4,
            blue: 4,
            green: 4,
            red: 4
        }
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
        }
    },
    {
        type: 'Grand',
        numberOfElements: 4,
        pay: {
            white: 7,
            blue: 7,
            green: 7,
            red: 7
        }
    },
    {
        type: 'Blitz',
        numberOfElements: 4,
        pay: {
            white: 4,
            blue: 4,
            green: 4,
            red: 4
        }
    },
    {
        type: 'Grand',
        numberOfElements: 2,
        pay: {
            twoOf4: 9,
        }
    },
    {
        type: 'Blitz',
        numberOfElements: 2,
        pay: {
            twoOf4: 7,
        }
    },
    {
        type: 'Grand',
        numberOfElements: 1,
        pay: {
            oneOf4: 14,
        }
    },
    {
        type: 'Blitz',
        numberOfElements: 1,
        pay: {
            oneOf4: 9,
        }
    },
    {
        type: 'Grand',
        numberOfElements: 2,
        text: 'Dragons'
    },
    {
        type: 'Blitz',
        numberOfElements: 1,
        text: 'Dragon'
    },
    {
        type: 'Grand',
        numberOfElements: 3,
        text: 'of Level 3',
    },
    {
        type: 'Blitz',
        numberOfElements: 3,
        text: 'of Level 2',
    },
    {
        type: 'Grand',
        numberOfElements: 2,
        text: 'of Level 4',
    },
    {
        type: 'Blitz',
        numberOfElements: 2,
        text: 'of Level 3',
    },
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
        }
    },
    {
        type: 'Blitz',
        numberOfElements: 6,
        pay: {
            purple: 1,
            black: 1,
            white: 2,
            blue: 2,
            green: 2,
            red: 2,
        }
    },
];