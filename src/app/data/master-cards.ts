import { MasterCard } from "../models/master-card.interface";

export const masterCards: MasterCard[] = [
    {
        text: {
            ru: 'Мастер Огня',
            en: 'Master of Fire'
        },
        color: 'red',
        image: './assets/master_cards/master_fire2.jpg',
        orderNumber: 1201,
    },
    {
        text: {
            ru: 'Мастер Воды',
            en: 'Master of Water'
        },
        color: 'blue',
        image: './assets/master_cards/master_water3.jpg',
        orderNumber: 1202,
    },
    {
        text: {
            ru: 'Мастер Воздуха',
            en: 'Master of Air'
        },
        color: 'white',
        image: './assets/master_cards/master_air2.jpg',
        orderNumber: 1203,
    },
    {
        text: {
            ru: 'Мастер Земли',
            en: 'Master of Earth'
        },
        color: 'green',
        image: './assets/master_cards/master_earth2.jpg',
        orderNumber: 1204,
    },
    {
        text: {
            ru: 'Мастер Эфира"',
            en: 'Magic Master'
        },
        color: 'purple',
        grand: true,
        image: './assets/master_cards/master_ether.jpg',
        orderNumber: 1205,
    },
    {
        text: {
            ru: 'Мастер Земли',
            en: 'Dark Master'
        },
        color: 'black',
        grand: true,
        image: './assets/master_cards/master_dark.jpg',
        orderNumber: 1206,
    },
];