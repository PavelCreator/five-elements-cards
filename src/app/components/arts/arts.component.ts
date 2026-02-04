import { Component, OnInit } from '@angular/core';
import { ArtComponent } from "../art/art.component";
import { NgFor, NgIf } from "@angular/common";
import { CollectionHeaderComponent } from "../collection-header/collection-header.component";
import { Art } from "../../models/art.interface";
import { Collection } from "../../models/collection.interface";
import { InteractionService } from "../../services/interaction.service";
import { arts } from "../../data/arts";
import { Card } from "../../models/card.interface";
import { cards } from "../../data/cards";
import { Color } from "../../models/color.type";
import { HelperService } from "../../services/helper.service";
import { LocalStorageService } from "../../services/local-storage.service";

@Component({
    selector: 'app-arts',
    standalone: true,
    imports: [ArtComponent, NgFor, CollectionHeaderComponent],
    templateUrl: 'arts.component.html',
    styleUrls: ['./arts.component.css'],
})
export class ArtsComponent implements OnInit {
    public arts: Art[] = arts;
    public cards: Card[] = cards;

    public red1: Art[] = [];
    public red2: Art[] = [];
    public red3: Art[] = [];
    public white1: Art[] = [];
    public white2: Art[] = [];
    public white3: Art[] = [];
    public blue1: Art[] = [];
    public blue2: Art[] = [];
    public blue3: Art[] = [];
    public green1: Art[] = [];
    public green2: Art[] = [];
    public green3: Art[] = [];
    public purple1: Art[] = [];
    public purple2: Art[] = [];
    public purple3: Art[] = [];
    public purple4: Art[] = [];
    public black1: Art[] = [];
    public black2: Art[] = [];
    public black3: Art[] = [];
    public black4: Art[] = [];
    public mix4: Art[] = [];

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
        const artsFromLocalStorage = this._localStorageService.loadArray('arts');
        console.log('artsFromLocalStorage =', artsFromLocalStorage);
        if (artsFromLocalStorage) this.arts = artsFromLocalStorage;

        this._interactionService.removedArt$.subscribe(artToRemove => {
            if (!artToRemove) return;
            this.arts.forEach((art: Art, i: number) => {
                if (art.picturePath === artToRemove?.picturePath) {
                    this.arts.splice(i, 1);
                    this._recalculateLevels();
                }
            })
        })

        this._interactionService.addArt$.subscribe((artToAdd: Art | undefined) => {
            if (artToAdd) {
                this.arts.push(artToAdd);
                this._recalculateLevels();
            }
        })

        this._recalculateLevels();

        this._interactionService.recalculateArts$.subscribe(() => {
            this._recalculateLevels();
        });

        this._interactionService.saveArts$.subscribe(() => {
            this._localStorageService.saveArray(this.arts, 'arts');
        });
    }

    private _recalculateLevels() {
        arts.sort((a, b) => String(a.color).localeCompare(String(b.color))).reverse();

        const colors: Color[] = ['red', 'purple', 'blue', 'green', 'white', 'black', 'mix', 'mix2', 'mix6', 'dice'];
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
                    break;
                case 'mix6':
                case 'mix2':
                    break;
            }
            levels.forEach((level: number) => {
                (this as {[key: string]: any})[color + level.toString()] = this.arts.filter(art => art.color === color && art.level === level).sort((x, y) => (x.hidden === y.hidden) ? 0 : x.hidden ? 1 : -1);
                console.log('(this as {[key: string]: any})[color + level.toString()] =', (this as {[key: string]: any})[color + level.toString()]);
                (this as {[key: string]: any})['need'+HelperService.ToPascalCase(color)+level.toString()] = this.cards.filter(card => card.level === level && (color !== 'mix' ? card.get[color] : !card.levelSpecial)).length;
                (this as {[key: string]: any})['have'+HelperService.ToPascalCase(color)+level.toString()] = this.arts.filter(art => art.color === 'red' && art.level === 1 && !art.hidden).length;
            });
            console.log('this.needRed1 =', this.needRed1);
            console.log('this.haveRed1 =', this.haveRed1);
            console.log('this.red1.length =', this.red1.length);
            console.log('this.needRed2 =', this.needRed2);
            console.log('this.haveRed2 =', this.haveRed2);
            console.log('this.red2.length =', this.red2.length);
            console.log('this.needRed3 =', this.needRed3);
            console.log('this.haveRed3 =', this.haveRed3);
            console.log('this.red3.length =', this.red3.length);
        });
        this._localStorageService.saveArray(this.arts, 'arts');
    }
}
