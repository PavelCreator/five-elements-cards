import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from "@angular/common";
import { CollectionHeaderComponent } from "../collection-header/collection-header.component";
import { InteractionService } from "../../services/interaction.service";
import { Card } from "../../models/card.interface";
import { ChaosCard } from "../../models/chaos-card.interface";
import { cards } from "../../data/cards";
import { chaosCards } from "../../data/chaos-cards";
import { CardComponent } from "../card/card.component";
import { Color } from "../../models/color.type";
import { HelperService } from "../../services/helper.service";
import { LocalStorageService } from "../../services/local-storage.service";
import { ChaosCardComponent } from "../chaos-card/chaos-card.component";

@Component({
    selector: 'app-cards',
    standalone: true,
    imports: [CardComponent, ChaosCardComponent, NgFor, CollectionHeaderComponent, NgIf],
    templateUrl: 'cards.component.html',
    styleUrls: ['./cards.component.css'],
})
export class CardsComponent implements OnInit {
    public cards: Card[] = cards;
    public chaosCards: ChaosCard[] = chaosCards;

    public red1: Card[] = [];
    public red2: Card[] = [];
    public red3: Card[] = [];
    public white1: Card[] = [];
    public white2: Card[] = [];
    public white3: Card[] = [];
    public blue1: Card[] = [];
    public blue2: Card[] = [];
    public blue3: Card[] = [];
    public green1: Card[] = [];
    public green2: Card[] = [];
    public green3: Card[] = [];
    public purple1: Card[] = [];
    public purple2: Card[] = [];
    public purple3: Card[] = [];
    public purple4: Card[] = [];
    public black1: Card[] = [];
    public black2: Card[] = [];
    public black3: Card[] = [];
    public black4: Card[] = [];
    public mix4: Card[] = [];

    public needRed1: number = 0;
    public needRed2: number = 0;
    public needRed3: number = 0;
    public needWhite1: number = 0;
    public needWhite2: number = 0;
    public needWhite3: number = 0;
    public needBlue1: number = 0;
    public needBlue2: number = 0;
    public needBlue3: number = 0;
    public needGreen1: number = 0;
    public needGreen2: number = 0;
    public needGreen3: number = 0;
    public needPurple1: number = 0;
    public needPurple2: number = 0;
    public needPurple3: number = 0;
    public needPurple4: number = 0;
    public needBlack1: number = 0;
    public needBlack2: number = 0;
    public needBlack3: number = 0;
    public needBlack4: number = 0;
    public needMix4: number = 0;
    public haveRed1: number = 0;
    public haveRed2: number = 0;
    public haveRed3: number = 0;
    public haveWhite1: number = 0;
    public haveWhite2: number = 0;
    public haveWhite3: number = 0;
    public haveBlue1: number = 0;
    public haveBlue2: number = 0;
    public haveBlue3: number = 0;
    public haveGreen1: number = 0;
    public haveGreen2: number = 0;
    public haveGreen3: number = 0;
    public havePurple1: number = 0;
    public havePurple2: number = 0;
    public havePurple3: number = 0;
    public havePurple4: number = 0;
    public haveBlack1: number = 0;
    public haveBlack2: number = 0;
    public haveBlack3: number = 0;
    public haveBlack4: number = 0;
    public haveMix4: number = 0;

    constructor(
        private _interactionService: InteractionService,
        private _localStorageService: LocalStorageService
    ) {
    }

    ngOnInit() {
        const cardsFromLocalStorage = this._localStorageService.loadArray('cards');
        if (cardsFromLocalStorage) this.cards = cardsFromLocalStorage;
        /*this.cards = this.cards.filter((card) => {
            return card.orderNumber !== 106.4 && card.orderNumber !== 106.3
        })
        this.cards.push({
            orderNumber: 106.3,
            level: 4,
            levelSpecial: true,
            pay: {
                red: 6,
                green: 6,
                white: 6,
                blue: 6,
                purple: 0,
                black: 6
            },
            get: {
                purple: 3,
            }
        })
        this.cards.push({
            orderNumber: 106.4,
            level: 4,
            levelSpecial: true,
            pay: {
                red: 6,
                green: 6,
                white: 6,
                blue: 6,
                purple: 0,
                black: 6
            },
            get: {
                purple: 3,
            }
        })

        this._localStorageService.saveArray(this.cards, 'cards');*/

        const colors: Color[] = ['red', 'purple', 'blue', 'white', 'black', 'green'];
        this.cards.forEach((card: Card) => {
            let mixColorDetector: number = 0;
            colors.forEach((color: Color) => {
                if (color in card.get) {
                    card.color = color;
                    mixColorDetector++;
                }
            });
            if (mixColorDetector > 1) card.color = 'mix';
        });
        this._recalculateLevels();

        this._interactionService.recalculateCards$.subscribe(() => {
            this._recalculateLevels();
        });

        this._interactionService.saveCards$.subscribe(() => {
            this._localStorageService.saveArray(this.cards, 'cards');
        });

        this._interactionService.recalculateChaosCards$.subscribe(() => {
            this._recalculateLevels();
        });

/*        this._interactionService.saveChaosCards$.subscribe(() => {
            this._localStorageService.saveArray(this.cards, 'chaosCards');
        });*/

        console.log('chaosCards =', chaosCards);
        console.log('this.chaosCards =', this.chaosCards);
    }

    private _recalculateLevels() {
        const colors: Color[] = ['red', 'purple', 'blue', 'green', 'white', 'black', 'mix', 'dice'];
        let levels: number[] = [];

        colors.forEach((color: Color) => {
            switch (color) {
                case 'black':
                case 'purple':
                    levels = [1, 2, 3, 4];
                    break;
                case 'red':
                case 'blue':
                case 'green':
                case 'white':
                    levels = [1, 2, 3];
                    break;

                case 'mix':
                    levels = [4];
            }
            levels.forEach((level: number) => {
                (this as {[key: string]: any})[color + level.toString()] = this.cards.filter(card => card.color === color && card.level === level);
                (this as {[key: string]: any})['need'+HelperService.ToPascalCase(color)+level.toString()] = this.cards.filter(card => card.level === level && (color !== 'mix' ? card.get[color] : !card.levelSpecial)).length;
                (this as {[key: string]: any})['have'+HelperService.ToPascalCase(color)+level.toString()] = this.cards.filter(card => card.color === color && card.level === level).length;
            });
        });
        this._localStorageService.saveArray(this.cards, 'cards');
    }
}
