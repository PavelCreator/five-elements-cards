import { MasterCard } from "../models/master-card.interface";

export const masterCards: MasterCard[] = [
    {
        text: {
            ru: 'Мастер Огня',
            en: 'Master of Fire'
        },
        color: 'red',
        cost: 6,
        image: './assets/master_cards/master_fire2.jpg',
        orderNumber: 1201,
    },
    {
        text: {
            ru: 'Мастер Воды',
            en: 'Master of Water'
        },
        color: 'blue',
        cost: 6,
        image: './assets/master_cards/master_water3.jpg',
        orderNumber: 1202,
    },
    {
        text: {
            ru: 'Мастер Воздуха',
            en: 'Master of Air'
        },
        color: 'white',
        cost: 6,
        image: './assets/master_cards/master_air2.jpg',
        orderNumber: 1203,
    },
    {
        text: {
            ru: 'Мастер Земли',
            en: 'Master of Earth'
        },
        color: 'green',
        cost: 6,
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
        cost: 10,
        image: './assets/master_cards/master_ether.jpg',
        orderNumber: 1205,
    },
    {
        text: {
            ru: 'Мастер Тьмы',
            en: 'Dark Master'
        },
        color: 'black',
        grand: true,
        cost: 10,
        image: './assets/master_cards/master_dark.jpg',
        orderNumber: 1206,
    },
];