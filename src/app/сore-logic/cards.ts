export interface Elements {
    red?: number,
    green?: number,
    lightBlue?: number,
    darkBlue?: number,
    purple?: number,
    black?: number
}
export interface Card {
    pay: Elements,
    get: Elements,
    orderNumber: number,
    level: number,
    levelSpecial: boolean,
    picturePath?: string,
    isSelected?: boolean
}
export const cards: Card[] = [
    {
        orderNumber: 1,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/68716612-040a-47a8-acb9-63f190da5661/0_1.png',
        pay: {
            red: 1,
            green: 1,
            lightBlue: 1,
            darkBlue: 1,
            purple: 0,
            black: 0
        },
        get: {
            red: 1
        }
    },
    {
        orderNumber: 2,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/49d972ea-3300-4a92-b398-e1ab5a96d57e/0_2.png',
        pay: {
            red: 1,
            green: 1,
            lightBlue: 1,
            darkBlue: 1,
            purple: 0,
            black: 0
        },
        get: {
            lightBlue: 1
        }
    },
    {
        orderNumber: 3,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/46907397-32a2-4d56-b9c9-a4b42f81f3f6/0_3.png',
        pay: {
            red: 1,
            green: 1,
            lightBlue: 1,
            darkBlue: 1,
            purple: 0,
            black: 0
        },
        get: {
            darkBlue: 1
        }
    },
    {
        orderNumber: 4,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/8458a932-84dc-4956-8125-36060666b8a4/0_2.png',
        pay: {
            red: 1,
            green: 1,
            lightBlue: 1,
            darkBlue: 1,
            purple: 0,
            black: 0
        },
        get: {
            green: 1
        }
    },
    {
        orderNumber: 5,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/c94c308d-d23d-4fc1-955f-748e652fd573/0_2.png',
        pay: {
            red: 0,
            green: 1,
            lightBlue: 1,
            darkBlue: 2,
            purple: 0,
            black: 0
        },
        get: {
            red: 1
        }
    },
    {
        orderNumber: 6,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/c18a8c5a-7f3f-4df8-aeb2-fec2e63e4e15/0_3.png',
        pay: {
            red: 2,
            green: 1,
            lightBlue: 0,
            darkBlue: 1,
            purple: 0,
            black: 0
        },
        get: {
            lightBlue: 1
        }
    },
    {
        orderNumber: 7,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/99d75ed6-bcfc-4e72-af6d-e1c1ffdebcef/0_1.png',
        pay: {
            red: 1,
            green: 2,
            lightBlue: 1,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            darkBlue: 1
        }
    },
    {
        orderNumber: 8,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/d8aed608-8464-44d2-8f5f-91887cb48617/0_0.png',
        pay: {
            red: 1,
            green: 0,
            lightBlue: 2,
            darkBlue: 1,
            purple: 0,
            black: 0
        },
        get: {
            green: 1
        }
    },
    {
        orderNumber: 9,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/f16f9cfd-9000-4800-8644-d9042a3faa86/0_2.png',
        pay: {
            red: 2,
            green: 2,
            lightBlue: 0,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            red: 1
        }
    },
    {
        orderNumber: 10,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/15ec2331-55c6-4981-b353-182ff68cf1ea/0_0.png',
        pay: {
            red: 0,
            green: 0,
            lightBlue: 2,
            darkBlue: 2,
            purple: 0,
            black: 0
        },
        get: {
            lightBlue: 1
        }
    },
    {
        orderNumber: 11,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/7913eccb-be34-461a-97e9-76b7a38296b4/0_1.png',
        pay: {
            red: 0,
            green: 0,
            lightBlue: 2,
            darkBlue: 2,
            purple: 0,
            black: 0
        },
        get: {
            darkBlue: 1
        }
    },
    {
        orderNumber: 12,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/6ade81f9-55b5-4f7e-8849-08a220dd09d6/0_1.png',
        pay: {
            red: 2,
            green: 2,
            lightBlue: 0,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            green: 1
        }
    },
    {
        orderNumber: 13,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/0bfee4eb-ca57-4666-955b-d141c254bfeb/0_3.png',
        pay: {
            red: 0,
            green: 2,
            lightBlue: 2,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            red: 1
        }
    },
    {
        orderNumber: 14,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/a809220a-b3f0-48d6-92cc-8a5ae1fd4782/0_1.png',
        pay: {
            red: 0,
            green: 2,
            lightBlue: 0,
            darkBlue: 2,
            purple: 0,
            black: 0
        },
        get: {
            lightBlue: 1
        }
    },
    {
        orderNumber: 15,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/ff2e6f4b-c3e9-47b1-a75b-aba5d47802e0/0_2.png',
        pay: {
            red: 2,
            green: 0,
            lightBlue: 2,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            darkBlue: 1
        }
    },
    {
        orderNumber: 16,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/4b727454-97ae-4c81-b548-4f9c9c10badf/0_1.png',
        pay: {
            red: 2,
            green: 0,
            lightBlue: 0,
            darkBlue: 2,
            purple: 0,
            black: 0
        },
        get: {
            green: 1
        }
    },
    {
        orderNumber: 17,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/b24e98cc-70b3-4da5-98f4-78baa44a4943/0_2.png',
        pay: {
            red: 0,
            green: 2,
            lightBlue: 0,
            darkBlue: 0,
            purple: 0,
            black: 1
        },
        get: {
            red: 1
        }
    },
    {
        orderNumber: 18,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/5ee1833d-5a26-44b1-b931-06c65680f640/0_2.png',
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 2,
            purple: 0,
            black: 1
        },
        get: {
            lightBlue: 1
        }
    },
    {
        orderNumber: 19,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/2a328e2c-2aad-40f3-8385-81ce1b9d7ddd/0_1.png',
        pay: {
            red: 0,
            green: 0,
            lightBlue: 2,
            darkBlue: 0,
            purple: 0,
            black: 1
        },
        get: {
            darkBlue: 1
        }
    },
    {
        orderNumber: 20,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/7440bafd-78a7-4b14-9f3b-98380e52e8b1/0_1.png',
        pay: {
            red: 2,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 0,
            black: 1
        },
        get: {
            green: 1
        }
    },
    {
        orderNumber: 21,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/82caa037-5d20-4823-ac3b-2965a4df713d/0_3.png',
        pay: {
            red: 0,
            green: 2,
            lightBlue: 1,
            darkBlue: 2,
            purple: 0,
            black: 0
        },
        get: {
            red: 1
        }
    },
    {
        orderNumber: 22,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/7e671de6-41cb-4028-b9a5-9a011c49d733/0_1.png',
        pay: {
            red: 1,
            green: 2,
            lightBlue: 0,
            darkBlue: 2,
            purple: 0,
            black: 0
        },
        get: {
            lightBlue: 1
        }
    },
    {
        orderNumber: 23,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/5a0efe8f-7d5f-4c04-bdbb-e89e9a870909/0_2.png',
        pay: {
            red: 2,
            green: 1,
            lightBlue: 2,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            darkBlue: 1
        }
    },
    {
        orderNumber: 24,
        level: 1,
        levelSpecial: false,
        picturePath: 'https://cdn.midjourney.com/733f1f6d-b241-489e-9b8e-4f5635c2e120/0_0.png',
        pay: {
            red: 2,
            green: 0,
            lightBlue: 2,
            darkBlue: 1,
            purple: 0,
            black: 0
        },
        get: {
            green: 1
        }
    },
    {
        orderNumber: 25,
        level: 1,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 1,
            lightBlue: 3,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            red: 1
        }
    },
    {
        orderNumber: 26,
        level: 1,
        levelSpecial: false,
        pay: {
            red: 1,
            green: 0,
            lightBlue: 0,
            darkBlue: 3,
            purple: 0,
            black: 0
        },
        get: {
            lightBlue: 1
        }
    },
    {
        orderNumber: 27,
        level: 1,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 3,
            lightBlue: 1,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            darkBlue: 1
        }
    },
    {
        orderNumber: 28,
        level: 1,
        levelSpecial: false,
        pay: {
            red: 3,
            green: 0,
            lightBlue: 0,
            darkBlue: 1,
            purple: 0,
            black: 0
        },
        get: {
            green: 1
        }
    },
    {
        orderNumber: 29,
        level: 1,
        levelSpecial: false,
        pay: {
            red: 2,
            green: 0,
            lightBlue: 0,
            darkBlue: 3,
            purple: 0,
            black: 0
        },
        get: {
            red: 1
        }
    },
    {
        orderNumber: 30,
        level: 1,
        levelSpecial: false,
        pay: {
            red: 3,
            green: 0,
            lightBlue: 2,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            lightBlue: 1
        }
    },
    {
        orderNumber: 31,
        level: 1,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 3,
            lightBlue: 0,
            darkBlue: 2,
            purple: 0,
            black: 0
        },
        get: {
            darkBlue: 1
        }
    },
    {
        orderNumber: 32,
        level: 1,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 2,
            lightBlue: 0,
            darkBlue: 3,
            purple: 0,
            black: 0
        },
        get: {
            green: 1
        }
    },
    {
        orderNumber: 33,
        level: 1,
        levelSpecial: false,
        pay: {
            red: 4,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            red: 1
        }
    },
    {
        orderNumber: 34,
        level: 1,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 4,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            lightBlue: 4
        }
    },
    {
        orderNumber: 35,
        level: 1,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 4,
            purple: 0,
            black: 0
        },
        get: {
            darkBlue: 1
        }
    },
    {
        orderNumber: 36,
        level: 1,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 4,
            lightBlue: 0,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            green: 1
        }
    },
    {
        orderNumber: 37,
        level: 1,
        levelSpecial: true,
        pay: {
            red: 3,
            green: 0,
            lightBlue: 0,
            darkBlue: 3,
            purple: 0,
            black: 2
        },
        get: {
            purple: 1,
        }
    },
    {
        orderNumber: 38,
        level: 1,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 3,
            lightBlue: 3,
            darkBlue: 0,
            purple: 0,
            black: 2
        },
        get: {
            purple: 1,
        }
    },
    {
        orderNumber: 38.1,
        level: 1,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 3,
            darkBlue: 3,
            purple: 0,
            black: 2
        },
        get: {
            purple: 1,
        }
    },
    {
        orderNumber: 38.2,
        level: 1,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 3,
            lightBlue: 0,
            darkBlue: 3,
            purple: 0,
            black: 2
        },
        get: {
            purple: 1,
        }
    },
    {
        orderNumber: 38.3,
        level: 1,
        levelSpecial: true,
        pay: {
            red: 3,
            green: 0,
            lightBlue: 3,
            darkBlue: 0,
            purple: 0,
            black: 2
        },
        get: {
            purple: 1,
        }
    },
    {
        orderNumber: 38.4,
        level: 1,
        levelSpecial: true,
        pay: {
            red: 3,
            green: 3,
            lightBlue: 0,
            darkBlue: 0,
            purple: 0,
            black: 2
        },
        get: {
            purple: 1,
        }
    },
    {
        orderNumber: 39,
        level: 1,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 2,
            black: 1
        },
        get: {
            black: 1
        }
    },
    {
        orderNumber: 40,
        level: 1,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 2,
            black: 1
        },
        get: {
            black: 1
        }
    },
    {
        orderNumber: 40.1,
        level: 1,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 2,
            black: 1
        },
        get: {
            black: 1
        }
    },
    {
        orderNumber: 40.2,
        level: 1,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 2,
            black: 1
        },
        get: {
            black: 1
        }
    },
    {
        orderNumber: 40.3,
        level: 1,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 2,
            black: 1
        },
        get: {
            black: 1
        }
    },
    {
        orderNumber: 40.4,
        level: 1,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 2,
            black: 1
        },
        get: {
            black: 1
        }
    },
    {
        orderNumber: 41,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 3,
            green: 1,
            lightBlue: 2,
            darkBlue: 1,
            purple: 1,
            black: 0
        },
        get: {
            red: 2
        }
    },
    {
        orderNumber: 42,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 1,
            green: 2,
            lightBlue: 3,
            darkBlue: 1,
            purple: 1,
            black: 0
        },
        get: {
            lightBlue: 2
        }
    },
    {
        orderNumber: 43,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 2,
            green: 1,
            lightBlue: 1,
            darkBlue: 3,
            purple: 1,
            black: 0
        },
        get: {
            darkBlue: 2
        }
    },
    {
        orderNumber: 44,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 1,
            green: 3,
            lightBlue: 1,
            darkBlue: 2,
            purple: 1,
            black: 0
        },
        get: {
            green: 2
        }
    },
    {
        orderNumber: 45,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 1,
            green: 3,
            lightBlue: 1,
            darkBlue: 3,
            purple: 0,
            black: 1
        },
        get: {
            red: 2
        }
    },
    {
        orderNumber: 46,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 3,
            green: 3,
            lightBlue: 1,
            darkBlue: 1,
            purple: 1,
            black: 0
        },
        get: {
            lightBlue: 2
        }
    },
    {
        orderNumber: 47,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 1,
            green: 1,
            lightBlue: 3,
            darkBlue: 3,
            purple: 1,
            black: 0
        },
        get: {
            green: 2
        }
    },
    {
        orderNumber: 48,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 3,
            green: 1,
            lightBlue: 3,
            darkBlue: 1,
            purple: 1,
            black: 0
        },
        get: {
            darkBlue: 2
        }
    },
    {
        orderNumber: 49,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 2,
            green: 2,
            lightBlue: 3,
            darkBlue: 3,
            purple: 0,
            black: 0
        },
        get: {
            red: 2
        }
    },
    {
        orderNumber: 50,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 3,
            green: 3,
            lightBlue: 2,
            darkBlue: 2,
            purple: 0,
            black: 0
        },
        get: {
            lightBlue: 2
        }
    },
    {
        orderNumber: 51,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 3,
            green: 3,
            lightBlue: 2,
            darkBlue: 2,
            purple: 0,
            black: 0
        },
        get: {
            darkBlue: 2
        }
    },
    {
        orderNumber: 52,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 2,
            green: 2,
            lightBlue: 3,
            darkBlue: 3,
            purple: 0,
            black: 0
        },
        get: {
            green: 2
        }
    },
    {
        orderNumber: 53,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 1,
            green: 2,
            lightBlue: 0,
            darkBlue: 4,
            purple: 0,
            black: 1
        },
        get: {
            red: 2
        }
    },
    {
        orderNumber: 54,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 2,
            green: 4,
            lightBlue: 1,
            darkBlue: 0,
            purple: 0,
            black: 1
        },
        get: {
            lightBlue: 2
        }
    },
    {
        orderNumber: 55,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 1,
            lightBlue: 4,
            darkBlue: 2,
            purple: 0,
            black: 1
        },
        get: {
            green: 2
        }
    },
    {
        orderNumber: 56,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 4,
            green: 0,
            lightBlue: 2,
            darkBlue: 1,
            purple: 0,
            black: 1
        },
        get: {
            darkBlue: 2
        }
    },
    {
        orderNumber: 57,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 2,
            green: 2,
            lightBlue: 2,
            darkBlue: 2,
            purple: 1,
            black: 0
        },
        get: {
            red: 2
        }
    },
    {
        orderNumber: 58,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 2,
            green: 2,
            lightBlue: 2,
            darkBlue: 2,
            purple: 1,
            black: 0
        },
        get: {
            lightBlue: 2
        }
    },
    {
        orderNumber: 59,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 2,
            green: 2,
            lightBlue: 2,
            darkBlue: 2,
            purple: 1,
            black: 0
        },
        get: {
            darkBlue: 2
        }
    },
    {
        orderNumber: 60,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 2,
            green: 2,
            lightBlue: 2,
            darkBlue: 2,
            purple: 1,
            black: 0
        },
        get: {
            green: 2
        }
    },
    {
        orderNumber: 61,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 1,
            lightBlue: 5,
            darkBlue: 3,
            purple: 0,
            black: 0
        },
        get: {
            red: 2
        }
    },
    {
        orderNumber: 62,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 5,
            green: 3,
            lightBlue: 0,
            darkBlue: 1,
            purple: 0,
            black: 0
        },
        get: {
            lightBlue: 2
        }
    },
    {
        orderNumber: 63,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 3,
            green: 0,
            lightBlue: 1,
            darkBlue: 5,
            purple: 0,
            black: 0
        },
        get: {
            green: 2
        }
    },
    {
        orderNumber: 64,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 1,
            green: 5,
            lightBlue: 3,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            darkBlue: 2
        }
    },
    {
        orderNumber: 65,
        level: 2,
        levelSpecial: true,
        pay: {
            red: 8,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 0,
            black: 3
        },
        get: {
            purple: 1
        }
    },
    {
        orderNumber: 66,
        level: 2,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 8,
            darkBlue: 0,
            purple: 0,
            black: 3
        },
        get: {
            purple: 1
        }
    },
    {
        orderNumber: 66.1,
        level: 2,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 8,
            lightBlue: 0,
            darkBlue: 0,
            purple: 0,
            black: 3
        },
        get: {
            purple: 1
        }
    },
    {
        orderNumber: 66.2,
        level: 2,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 8,
            purple: 0,
            black: 3
        },
        get: {
            purple: 1
        }
    },
    {
        orderNumber: 66.3,
        level: 2,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 3,
            black: 3
        },
        get: {
            purple: 1
        }
    },
    {
        orderNumber: 66.4,
        level: 2,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 3,
            black: 3
        },
        get: {
            purple: 1
        }
    },
    {
        orderNumber: 67,
        level: 2,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 6,
            lightBlue: 0,
            darkBlue: 0,
            purple: 3,
            black: 0
        },
        get: {
            black: 1
        }
    },
    {
        orderNumber: 68,
        level: 2,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 6,
            purple: 3,
            black: 0
        },
        get: {
            black: 1
        }
    },
    {
        orderNumber: 68.1,
        level: 2,
        levelSpecial: true,
        pay: {
            red: 6,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 3,
            black: 0
        },
        get: {
            black: 1
        }
    },
    {
        orderNumber: 68.2,
        level: 2,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 6,
            darkBlue: 0,
            purple: 3,
            black: 0
        },
        get: {
            black: 1
        }
    },
    {
        orderNumber: 68.3,
        level: 2,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 3,
            black: 3
        },
        get: {
            black: 1
        }
    },
    {
        orderNumber: 68.4,
        level: 2,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 3,
            black: 3
        },
        get: {
            black: 1
        }
    },

    {
        orderNumber: 69,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 2,
            green: 6,
            lightBlue: 0,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            red: 2
        }
    },
    {
        orderNumber: 70,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 2,
            darkBlue: 6,
            purple: 0,
            black: 0
        },
        get: {
            lightBlue: 2
        }
    },
    {
        orderNumber: 71,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 6,
            green: 0,
            lightBlue: 0,
            darkBlue: 2,
            purple: 0,
            black: 0
        },
        get: {
            darkBlue: 2
        }
    },
    {
        orderNumber: 72,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 2,
            lightBlue: 6,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            green: 2
        }
    },
    {
        orderNumber: 73,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 3,
            green: 3,
            lightBlue: 3,
            darkBlue: 3,
            purple: 0,
            black: 0
        },
        get: {
            red: 2
        }
    },
    {
        orderNumber: 74,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 3,
            green: 3,
            lightBlue: 3,
            darkBlue: 3,
            purple: 0,
            black: 0
        },
        get: {
            lightBlue: 2
        }
    },
    {
        orderNumber: 75,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 3,
            green: 3,
            lightBlue: 3,
            darkBlue: 3,
            purple: 0,
            black: 0
        },
        get: {
            darkBlue: 2
        }
    },
    {
        orderNumber: 76,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 3,
            green: 3,
            lightBlue: 3,
            darkBlue: 3,
            purple: 0,
            black: 0
        },
        get: {
            green: 2
        }
    },
    {
        orderNumber: 77,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 3,
            green: 4,
            lightBlue: 2,
            darkBlue: 5,
            purple: 1,
            black: 0
        },
        get: {
            red: 3
        }
    },
    {
        orderNumber: 78,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 4,
            green: 5,
            lightBlue: 3,
            darkBlue: 2,
            purple: 1,
            black: 0
        },
        get: {
            lightBlue: 3
        }
    },
    {
        orderNumber: 79,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 2,
            green: 3,
            lightBlue: 5,
            darkBlue: 4,
            purple: 1,
            black: 0
        },
        get: {
            green: 3
        }
    },
    {
        orderNumber: 80,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 5,
            green: 2,
            lightBlue: 4,
            darkBlue: 3,
            purple: 1,
            black: 0
        },
        get: {
            darkBlue: 3
        }
    },
    {
        orderNumber: 81,
        level: 3,
        levelSpecial: true,
        pay: {
            red: 11,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            purple: 2
        }
    },
    {
        orderNumber: 82,
        level: 3,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 11,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            purple: 2
        }
    },
    {
        orderNumber: 83,
        level: 3,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 11,
            purple: 0,
            black: 0
        },
        get: {
            purple: 2
        }
    },
    {
        orderNumber: 84,
        level: 3,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 11,
            lightBlue: 0,
            darkBlue: 0,
            purple: 0,
            black: 0
        },
        get: {
            purple: 2
        }
    },
    {
        orderNumber: 84.1,
        level: 3,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 5,
            black: 4
        },
        get: {
            purple: 2
        }
    },
    {
        orderNumber: 84.2,
        level: 3,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 4,
            black: 4
        },
        get: {
            purple: 2
        }
    },
    {
        orderNumber: 85,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 7,
            lightBlue: 5,
            darkBlue: 3,
            purple: 1,
            black: 0
        },
        get: {
            red: 3
        }
    },
    {
        orderNumber: 86,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 3,
            green: 0,
            lightBlue: 7,
            darkBlue: 5,
            purple: 1,
            black: 0
        },
        get: {
            green: 3
        }
    },
    {
        orderNumber: 87,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 5,
            green: 3,
            lightBlue: 0,
            darkBlue: 7,
            purple: 1,
            black: 0
        },
        get: {
            lightBlue: 3
        }
    },
    {
        orderNumber: 88,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 7,
            green: 5,
            lightBlue: 3,
            darkBlue: 0,
            purple: 1,
            black: 0
        },
        get: {
            darkBlue: 3
        }
    },
    {
        orderNumber: 89,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 6,
            green: 0,
            lightBlue: 4,
            darkBlue: 4,
            purple: 0,
            black: 2
        },
        get: {
            red: 3
        }
    },
    {
        orderNumber: 90,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 4,
            green: 6,
            lightBlue: 0,
            darkBlue: 4,
            purple: 0,
            black: 2
        },
        get: {
            green: 3
        }
    },
    {
        orderNumber: 91,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 4,
            green: 4,
            lightBlue: 6,
            darkBlue: 0,
            purple: 0,
            black: 2
        },
        get: {
            lightBlue: 3
        }
    },
    {
        orderNumber: 92,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 4,
            lightBlue: 4,
            darkBlue: 6,
            purple: 0,
            black: 2
        },
        get: {
            darkBlue: 3
        }
    },
    {
        orderNumber: 93,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 4,
            green: 3,
            lightBlue: 0,
            darkBlue: 5,
            purple: 2,
            black: 1
        },
        get: {
            red: 3
        }
    },
    {
        orderNumber: 94,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 3,
            green: 5,
            lightBlue: 4,
            darkBlue: 0,
            purple: 2,
            black: 1
        },
        get: {
            green: 3
        }
    },
    {
        orderNumber: 95,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 4,
            lightBlue: 5,
            darkBlue: 3,
            purple: 2,
            black: 1
        },
        get: {
            lightBlue: 3
        }
    },
    {
        orderNumber: 96,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 5,
            green: 0,
            lightBlue: 3,
            darkBlue: 4,
            purple: 2,
            black: 1
        },
        get: {
            darkBlue: 3
        }
    },
    {
        orderNumber: 97,
        level: 4,
        levelSpecial: false,
        pay: {
            red: 10,
            green: 0,
            lightBlue: 0,
            darkBlue: 10,
            purple: 0,
            black: 4
        },
        get: {
            darkBlue: 2,
            red: 2
        }
    },
    {
        orderNumber: 98,
        level: 4,
        levelSpecial: false,
        pay: {
            red: 10,
            green: 0,
            lightBlue: 10,
            darkBlue: 0,
            purple: 0,
            black: 4
        },
        get: {
            lightBlue: 2,
            red: 2
        }
    },
    {
        orderNumber: 99,
        level: 4,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 10,
            lightBlue: 10,
            darkBlue: 0,
            purple: 0,
            black: 4
        },
        get: {
            lightBlue: 2,
            green: 2
        }
    },
    {
        orderNumber: 100,
        level: 4,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 10,
            lightBlue: 0,
            darkBlue: 10,
            purple: 0,
            black: 4
        },
        get: {
            darkBlue: 2,
            green: 2
        }
    },
    {
        orderNumber: 101,
        level: 4,
        levelSpecial: false,
        pay: {
            red: 6,
            green: 6,
            lightBlue: 6,
            darkBlue: 6,
            purple: 0,
            black: 4
        },
        get: {
            red: 1,
            darkBlue: 1,
            lightBlue: 1,
            green: 1
        }
    },
    {
        orderNumber: 102,
        level: 4,
        levelSpecial: false,
        pay: {
            red: 6,
            green: 6,
            lightBlue: 6,
            darkBlue: 6,
            purple: 0,
            black: 4
        },
        get: {
            red: 1,
            darkBlue: 1,
            lightBlue: 1,
            green: 1
        }
    },
    {
        orderNumber: 103,
        level: 4,
        levelSpecial: false,
        pay: {
            red: 6,
            green: 6,
            lightBlue: 6,
            darkBlue: 6,
            purple: 0,
            black: 4
        },
        get: {
            red: 1,
            darkBlue: 1,
            lightBlue: 1,
            green: 1
        }
    },
    {
        orderNumber: 104,
        level: 4,
        levelSpecial: false,
        pay: {
            red: 6,
            green: 6,
            lightBlue: 6,
            darkBlue: 6,
            purple: 0,
            black: 4
        },
        get: {
            red: 1,
            darkBlue: 1,
            lightBlue: 1,
            green: 1
        }
    },
    {
        orderNumber: 105,
        level: 4,
        levelSpecial: true,
        pay: {
            red: 6,
            green: 6,
            lightBlue: 6,
            darkBlue: 6,
            purple: 0,
            black: 6
        },
        get: {
            purple: 3,
        }
    },
    {
        orderNumber: 106,
        level: 4,
        levelSpecial: true,
        pay: {
            red: 6,
            green: 6,
            lightBlue: 6,
            darkBlue: 6,
            purple: 0,
            black: 6
        },
        get: {
            purple: 3,
        }
    },
    {
        orderNumber: 106.1,
        level: 4,
        levelSpecial: true,
        pay: {
            red: 6,
            green: 6,
            lightBlue: 6,
            darkBlue: 6,
            purple: 0,
            black: 6
        },
        get: {
            purple: 3,
        }
    },
    {
        orderNumber: 106.2,
        level: 4,
        levelSpecial: true,
        pay: {
            red: 6,
            green: 6,
            lightBlue: 6,
            darkBlue: 6,
            purple: 0,
            black: 6
        },
        get: {
            purple: 3,
        }
    },
    {
        orderNumber: 107,
        level: 3,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 6,
            black: 0
        },
        get: {
            black: 2,
        }
    },
    {
        orderNumber: 108,
        level: 3,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 6,
            black: 0
        },
        get: {
            black: 2,
        }
    },
    {
        orderNumber: 108.1,
        level: 3,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 6,
            black: 0
        },
        get: {
            black: 2,
        }
    },
    {
        orderNumber: 108.2,
        level: 3,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 6,
            black: 0
        },
        get: {
            black: 2,
        }
    },
    {
        orderNumber: 108.3,
        level: 3,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 6,
            black: 0
        },
        get: {
            black: 2,
        }
    },
    {
        orderNumber: 108.4,
        level: 3,
        levelSpecial: true,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 6,
            black: 0
        },
        get: {
            black: 2,
        }
    },
    {
        orderNumber: 109,
        level: 4,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 10,
            darkBlue: 10,
            purple: 0,
            black: 4
        },
        get: {
            lightBlue: 2,
            darkBlue: 2
        }
    },
    {
        orderNumber: 110,
        level: 4,
        levelSpecial: false,
        pay: {
            red: 10,
            green: 10,
            lightBlue: 0,
            darkBlue: 0,
            purple: 0,
            black: 4
        },
        get: {
            red: 2,
            green: 2
        }
    },
    {
        orderNumber: 111,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 3,
            lightBlue: 0,
            darkBlue: 0,
            purple: 2,
            black: 0
        },
        get: {
            red: 2,
        }
    },
    {
        orderNumber: 112,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 3,
            purple: 2,
            black: 0
        },
        get: {
            lightBlue: 2,
        }
    },
    {
        orderNumber: 113,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 3,
            darkBlue: 0,
            purple: 2,
            black: 0
        },
        get: {
            darkBlue: 2,
        }
    },
    {
        orderNumber: 114,
        level: 2,
        levelSpecial: false,
        pay: {
            red: 3,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 2,
            black: 0
        },
        get: {
            green: 2,
        }
    },
    {
        orderNumber: 115,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 5,
            darkBlue: 0,
            purple: 3,
            black: 0
        },
        get: {
            red: 3,
        }
    },
    {
        orderNumber: 116,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 5,
            lightBlue: 0,
            darkBlue: 0,
            purple: 3,
            black: 0
        },
        get: {
            lightBlue: 3,
        }
    },
    {
        orderNumber: 117,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 5,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 3,
            black: 0
        },
        get: {
            darkBlue: 3,
        }
    },
    {
        orderNumber: 118,
        level: 3,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 5,
            purple: 3,
            black: 0
        },
        get: {
            green: 3,
        }
    },
    {
        orderNumber: 119,
        level: 4,
        levelSpecial: false,
        pay: {
            red: 6,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 4,
            black: 0
        },
        get: {
            red: 1,
            green: 1,
            lightBlue: 1,
            darkBlue: 1,
        }
    },
    {
        orderNumber: 120,
        level: 4,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 6,
            darkBlue: 0,
            purple: 4,
            black: 0
        },
        get: {
            red: 1,
            green: 1,
            lightBlue: 1,
            darkBlue: 1,
        }
    },
    {
        orderNumber: 121,
        level: 4,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 6,
            purple: 4,
            black: 0
        },
        get: {
            red: 1,
            green: 1,
            lightBlue: 1,
            darkBlue: 1,
        }
    },
    {
        orderNumber: 122,
        level: 4,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 6,
            lightBlue: 0,
            darkBlue: 0,
            purple: 4,
            black: 0
        },
        get: {
            red: 1,
            green: 1,
            lightBlue: 1,
            darkBlue: 1,
        }
    },
    {
        orderNumber: 123,
        level: 1,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 1,
            darkBlue: 0,
            purple: 1,
            black: 0
        },
        get: {
            red: 1
        }
    },
    {
        orderNumber: 124,
        level: 1,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 1,
            lightBlue: 0,
            darkBlue: 0,
            purple: 1,
            black: 0
        },
        get: {
            lightBlue: 1
        }
    },
    {
        orderNumber: 125,
        level: 1,
        levelSpecial: false,
        pay: {
            red: 1,
            green: 0,
            lightBlue: 0,
            darkBlue: 0,
            purple: 1,
            black: 0
        },
        get: {
            darkBlue: 1
        }
    },
    {
        orderNumber: 126,
        level: 1,
        levelSpecial: false,
        pay: {
            red: 0,
            green: 0,
            lightBlue: 0,
            darkBlue: 1,
            purple: 1,
            black: 0
        },
        get: {
            green: 1
        }
    },
];
console.log('Cards count =', cards.length);
console.log('Cards 1 level =', cards.filter(card => card.level === 1 && card.levelSpecial === false).length);
console.log('Cards 2 level =', cards.filter(card => card.level === 2 && card.levelSpecial === false).length);
console.log('Cards 3 level =', cards.filter(card => card.level === 3 && card.levelSpecial === false).length);
console.log('Cards 4 level =', cards.filter(card => card.level === 4 && card.levelSpecial === false).length);
console.log('Cards 1 level special =', cards.filter(card => card.level === 1 && card.levelSpecial === true).length);
console.log('Cards 2 level special =', cards.filter(card => card.level === 2 && card.levelSpecial === true).length);
console.log('Cards 3 level special =', cards.filter(card => card.level === 3 && card.levelSpecial === true).length);
console.log('Cards 4 level special =', cards.filter(card => card.level === 4 && card.levelSpecial === true).length);
console.log('----------------------------')
console.log('Cards 1 level, red =', cards.filter(card => card.level === 1 && card.get.red).length);
console.log('Cards 1 level, green =', cards.filter(card => card.level === 1 && card.get.green).length);
console.log('Cards 1 level, lightBlue =', cards.filter(card => card.level === 1 && card.get.lightBlue).length);
console.log('Cards 1 level, darkBlue =', cards.filter(card => card.level === 1 && card.get.darkBlue).length);
console.log('Cards 1 level, purple =', cards.filter(card => card.level === 1 && card.get.purple).length);
console.log('Cards 1 level, black =', cards.filter(card => card.level === 1 && card.get.black).length);
console.log('Cards 2 level, red =', cards.filter(card => card.level === 2 && card.get.red).length);
console.log('Cards 2 level, green =', cards.filter(card => card.level === 2 && card.get.green).length);
console.log('Cards 2 level, lightBlue =', cards.filter(card => card.level === 2 && card.get.lightBlue).length);
console.log('Cards 2 level, darkBlue =', cards.filter(card => card.level === 2 && card.get.darkBlue).length);
console.log('Cards 2 level, purple =', cards.filter(card => card.level === 2 && card.get.purple).length);
console.log('Cards 2 level, black =', cards.filter(card => card.level === 2 && card.get.black).length);
console.log('Cards 3 level, red =', cards.filter(card => card.level === 3 && card.get.red).length);
console.log('Cards 3 level, green =', cards.filter(card => card.level === 3 && card.get.green).length);
console.log('Cards 3 level, lightBlue =', cards.filter(card => card.level === 3 && card.get.lightBlue).length);
console.log('Cards 3 level, darkBlue =', cards.filter(card => card.level === 3 && card.get.darkBlue).length);
console.log('Cards 3 level, purple =', cards.filter(card => card.level === 3 && card.get.purple).length);
console.log('Cards 3 level, black =', cards.filter(card => card.level === 3 && card.get.black).length);