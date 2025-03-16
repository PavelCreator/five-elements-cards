import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from "@angular/common";
import { CollectionHeaderComponent } from "../collection-header/collection-header.component";
import { DataService } from "../data.service";
import { Card } from "../interfaces/card.interface";
import { cards } from "../data/cards";
import { CardComponent } from "../card/card.component";
import { Color } from "../interfaces/color.type";

@Component({
    selector: 'app-cards',
    standalone: true,
    imports: [CardComponent, NgFor, CollectionHeaderComponent, NgIf],
    templateUrl: 'cards.component.html',
    styleUrls: ['./cards.component.css'],
})
export class CardsComponent implements OnInit {
    public cards: Card[] = cards;

    public red1: Card[] = [];
    public red2: Card[] = [];
    public red3: Card[] = [];
    public lightBlue1: Card[] = [];
    public lightBlue2: Card[] = [];
    public lightBlue3: Card[] = [];
    public darkBlue1: Card[] = [];
    public darkBlue2: Card[] = [];
    public darkBlue3: Card[] = [];
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
    public needLightBlue1: number = 0;
    public needLightBlue2: number = 0;
    public needLightBlue3: number = 0;
    public needDarkBlue1: number = 0;
    public needDarkBlue2: number = 0;
    public needDarkBlue3: number = 0;
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
    public haveLightBlue1: number = 0;
    public haveLightBlue2: number = 0;
    public haveLightBlue3: number = 0;
    public haveDarkBlue1: number = 0;
    public haveDarkBlue2: number = 0;
    public haveDarkBlue3: number = 0;
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
        private _dataService: DataService
    ) {
    }

    ngOnInit() {
        const colors: Color[] = ['red', 'purple', 'darkBlue', 'lightBlue', 'black', 'green']
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

        this._dataService.recalculateCards$.subscribe(() => {
            this._recalculateLevels();
        });
    }

    private _recalculateLevels() {
        this.red1 = this.cards.filter(card => card.color === 'red' && card.level === 1);
        this.needRed1 = this.cards.filter(card => card.level === 1 && card.get.red).length;
        this.red2 = this.cards.filter(card => card.color === 'red' && card.level === 2);
        this.needRed2 = this.cards.filter(card => card.level === 2 && card.get.red).length;
        this.red3 = this.cards.filter(card => card.color === 'red' && card.level === 3);
        this.needRed3 = this.cards.filter(card => card.level === 3 && card.get.red).length;
        this.lightBlue1 = this.cards.filter(card => card.color === 'lightBlue' && card.level === 1);
        this.needLightBlue1 = this.cards.filter(card => card.level === 1 && card.get.lightBlue).length;
        this.lightBlue2 = this.cards.filter(card => card.color === 'lightBlue' && card.level === 2);
        this.needLightBlue2 = this.cards.filter(card => card.level === 2 && card.get.lightBlue).length;
        this.lightBlue3 = this.cards.filter(card => card.color === 'lightBlue' && card.level === 3);
        this.needLightBlue3 = this.cards.filter(card => card.level === 3 && card.get.lightBlue).length;
        this.darkBlue1 = this.cards.filter(card => card.color === 'darkBlue' && card.level === 1);
        this.needDarkBlue1 = this.cards.filter(card => card.level === 1 && card.get.darkBlue).length;
        this.darkBlue2 = this.cards.filter(card => card.color === 'darkBlue' && card.level === 2);
        this.needDarkBlue2 = this.cards.filter(card => card.level === 2 && card.get.darkBlue).length;
        this.darkBlue3 = this.cards.filter(card => card.color === 'darkBlue' && card.level === 3);
        this.needDarkBlue3 = this.cards.filter(card => card.level === 3 && card.get.darkBlue).length;
        this.green1 = this.cards.filter(card => card.color === 'green' && card.level === 1);
        this.needGreen1 = this.cards.filter(card => card.level === 1 && card.get.green).length;
        this.green2 = this.cards.filter(card => card.color === 'green' && card.level === 2);
        this.needGreen2 = this.cards.filter(card => card.level === 2 && card.get.green).length;
        this.green3 = this.cards.filter(card => card.color === 'green' && card.level === 3);
        this.needGreen3 = this.cards.filter(card => card.level === 3 && card.get.green).length;
        this.purple1 = this.cards.filter(card => card.color === 'purple' && card.level === 1);
        this.needPurple1 = this.cards.filter(card => card.level === 1 && card.get.purple).length;
        this.purple2 = this.cards.filter(card => card.color === 'purple' && card.level === 2);
        this.needPurple2 = this.cards.filter(card => card.level === 2 && card.get.purple).length;
        this.purple3 = this.cards.filter(card => card.color === 'purple' && card.level === 3);
        this.needPurple3 = this.cards.filter(card => card.level === 3 && card.get.purple).length;
        this.purple4 = this.cards.filter(card => card.color === 'purple' && card.level === 4);
        this.needPurple4 = this.cards.filter(card => card.level === 4 && card.get.purple).length;
        this.black1 = this.cards.filter(card => card.color === 'black' && card.level === 1);
        this.needBlack1 = this.cards.filter(card => card.level === 1 && card.get.black).length;
        this.black2 = this.cards.filter(card => card.color === 'black' && card.level === 2);
        this.needBlack2 = this.cards.filter(card => card.level === 2 && card.get.black).length;
        this.black3 = this.cards.filter(card => card.color === 'black' && card.level === 3);
        this.needBlack3 = this.cards.filter(card => card.level === 3 && card.get.black).length;
        this.black4 = this.cards.filter(card => card.color === 'black' && card.level === 4);
        this.needBlack4 = this.cards.filter(card => card.level === 4 && card.get.black).length;
        this.mix4 = this.cards.filter(card => card.color === 'mix' && card.level === 4);
        this.needMix4 = this.cards.filter(card => card.level === 4 && !card.levelSpecial).length;

        this.haveRed1 = this.cards.filter(card => card.color === 'red' && card.level === 1).length;
        this.haveRed2 = this.cards.filter(card => card.color === 'red' && card.level === 2).length;
        this.haveRed3 = this.cards.filter(card => card.color === 'red' && card.level === 3).length;
        this.haveLightBlue1 = this.cards.filter(card => card.color === 'lightBlue' && card.level === 1).length;
        this.haveLightBlue2 = this.cards.filter(card => card.color === 'lightBlue' && card.level === 2).length;
        this.haveLightBlue3 = this.cards.filter(card => card.color === 'lightBlue' && card.level === 3).length;
        this.haveDarkBlue1 = this.cards.filter(card => card.color === 'darkBlue' && card.level === 1).length;
        this.haveDarkBlue2 = this.cards.filter(card => card.color === 'darkBlue' && card.level === 2).length;
        this.haveDarkBlue3 = this.cards.filter(card => card.color === 'darkBlue' && card.level === 3).length;
        this.haveGreen1 = this.cards.filter(card => card.color === 'green' && card.level === 1).length;
        this.haveGreen2 = this.cards.filter(card => card.color === 'green' && card.level === 2).length;
        this.haveGreen3 = this.cards.filter(card => card.color === 'green' && card.level === 3).length;
        this.havePurple1 = this.cards.filter(card => card.color === 'purple' && card.level === 1).length;
        this.havePurple2 = this.cards.filter(card => card.color === 'purple' && card.level === 2).length;
        this.havePurple3 = this.cards.filter(card => card.color === 'purple' && card.level === 3).length;
        this.havePurple4 = this.cards.filter(card => card.color === 'purple' && card.level === 4).length;
        this.haveBlack1 = this.cards.filter(card => card.color === 'black' && card.level === 1).length;
        this.haveBlack2 = this.cards.filter(card => card.color === 'black' && card.level === 2).length;
        this.haveBlack3 = this.cards.filter(card => card.color === 'black' && card.level === 3).length;
        this.haveBlack4 = this.cards.filter(card => card.color === 'black' && card.level === 4).length;
        this.haveMix4 = this.cards.filter(card => card.color === 'mix' && card.level === 4).length;

        console.log('-------------------------------')
        console.log('cards = ', this.cards.length + this.cards.length);
        console.log('cards Fire = ', this.cards.filter(card => card.color === 'red').length);
        console.log('cards Air = ', this.cards.filter(card => card.color === 'lightBlue').length);
        console.log('cards Water = ', this.cards.filter(card => card.color === 'darkBlue').length);
        console.log('cards Ecardh = ', this.cards.filter(card => card.color === 'green').length);
        console.log('cards Dark = ', this.cards.filter(card => card.color === 'black').length);
        console.log('cards Ether = ', this.cards.filter(card => card.color === 'purple').length);
        console.log('cards = ', this.cards.length);
        console.log('cardsSorted = ', this.cards.length);
        console.log('-------------------------------')
        console.log('cards =', this.cards.length);
        console.log('cards Fire = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.red).length);
        console.log('cards Air = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.lightBlue).length);
        console.log('cards Water = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.darkBlue).length);
        console.log('cards Ecardh = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.green).length);
        console.log('cards Dark = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.black).length);
        console.log('cards Ether = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.purple).length);
        console.log('-------------------------------')
        console.log('cards need Fire = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.red).length - this.cards.filter(card => card.color === 'red').length);
        console.log('cards need Air = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.lightBlue).length - this.cards.filter(card => card.color === 'lightBlue').length);
        console.log('cards need Water = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.darkBlue).length - this.cards.filter(card => card.color === 'darkBlue').length);
        console.log('cards need Ecardh = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.green).length - this.cards.filter(card => card.color === 'green').length);
        console.log('cards need Dark = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.black).length - this.cards.filter(card => card.color === 'black').length);
        console.log('cards need Ether = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.purple).length - this.cards.filter(card => card.color === 'purple').length);
    }
}
