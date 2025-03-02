import { Component, OnInit } from '@angular/core';
import { CardComponent } from "./card/card.component";
import { cards } from "./сore-logic/cards";
import { NgFor, NgIf } from "@angular/common";
import { ArtComponent } from "./art/art.component";
import { Art } from "./interfaces/art.interface";
import { artsSorted } from "./сore-logic/arts-sorted";
import { artsUnsorted } from "./сore-logic/arts-unsorted";
import { Collection } from "./interfaces/collection.interface";
import { CollectionHeaderComponent } from "./collection-header/collection-header.component";
import {DataService} from "./data.service";
import { Card } from "./interfaces/card.interface";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CardComponent, ArtComponent, NgFor, CollectionHeaderComponent],
    templateUrl: 'app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    public cards: Card[] = cards;
    public artsSorted: Art[] = artsSorted;
    public artsUnsorted: Art[] = artsUnsorted;
    public collections: Collection[] = [];
    public red1: Art[] = [];
    public red2: Art[] = [];
    public red3: Art[] = [];
    public lightBlue1: Art[] = [];
    public lightBlue2: Art[] = [];
    public lightBlue3: Art[] = [];
    public darkBlue1: Art[] = [];
    public darkBlue2: Art[] = [];
    public darkBlue3: Art[] = [];
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
        artsSorted.forEach((art) => {
            const collection = this.collections.find(collection => collection.name === art.collection);
            if (collection) {
                collection.arts.push(art);
            } else {
                this.collections.push(<Collection>{
                    name: art?.collection,
                    arts: [art]
                })
            }
        })

        this._dataService.removedArt$.subscribe(artToRemove => {
            this.artsUnsorted.forEach((art: Art, i: number) => {
                if (art.picturePath == artToRemove?.picturePath) {
                    console.log('this.artsUnsorted.length = ', this.artsUnsorted.length);
                    console.log('this.artsUnsorted[i] = ', this.artsUnsorted[i]);
                    this.artsUnsorted.splice(i, 1);
                    this._recalculateLevels();
                    console.log('this.artsUnsorted.length = ', this.artsUnsorted.length);
                }
                // this.artsUnsorted = this.artsUnsorted.filter(art => art.picturePath !== artToRemove?.picturePath);
            })
        })

        this._dataService.addArt$.subscribe((artToAdd: Art | undefined) => {
            if (artToAdd) {
                this.artsUnsorted.push(artToAdd);
            }
        })

        this._recalculateLevels();
    }

    private _recalculateLevels() {
        artsUnsorted.sort((a, b) => String(a.color).localeCompare(String(b.color))).reverse();

        this.red1 = this.artsUnsorted.filter(art => art.color === 'red' && art.level === 1).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needRed1 = this.cards.filter(card => card.level === 1 && card.get.red).length;
        this.red2 = this.artsUnsorted.filter(art => art.color === 'red' && art.level === 2).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needRed2 = this.cards.filter(card => card.level === 2 && card.get.red).length;
        this.red3 = this.artsUnsorted.filter(art => art.color === 'red' && art.level === 3).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needRed3 = this.cards.filter(card => card.level === 3 && card.get.red).length;
        this.lightBlue1 = this.artsUnsorted.filter(art => art.color === 'lightBlue' && art.level === 1).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needLightBlue1 = this.cards.filter(card => card.level === 1 && card.get.lightBlue).length;
        this.lightBlue2 = this.artsUnsorted.filter(art => art.color === 'lightBlue' && art.level === 2).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needLightBlue2 = this.cards.filter(card => card.level === 2 && card.get.lightBlue).length;
        this.lightBlue3 = this.artsUnsorted.filter(art => art.color === 'lightBlue' && art.level === 3).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needLightBlue3 = this.cards.filter(card => card.level === 3 && card.get.lightBlue).length;
        this.darkBlue1 = this.artsUnsorted.filter(art => art.color === 'darkBlue' && art.level === 1).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needDarkBlue1 = this.cards.filter(card => card.level === 1 && card.get.darkBlue).length;
        this.darkBlue2 = this.artsUnsorted.filter(art => art.color === 'darkBlue' && art.level === 2).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needDarkBlue2 = this.cards.filter(card => card.level === 2 && card.get.darkBlue).length;
        this.darkBlue3 = this.artsUnsorted.filter(art => art.color === 'darkBlue' && art.level === 3).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needDarkBlue3 = this.cards.filter(card => card.level === 3 && card.get.darkBlue).length;
        this.green1 = this.artsUnsorted.filter(art => art.color === 'green' && art.level === 1).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needGreen1 = this.cards.filter(card => card.level === 1 && card.get.green).length;
        this.green2 = this.artsUnsorted.filter(art => art.color === 'green' && art.level === 2).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needGreen2 = this.cards.filter(card => card.level === 2 && card.get.green).length;
        this.green3 = this.artsUnsorted.filter(art => art.color === 'green' && art.level === 3).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needGreen3 = this.cards.filter(card => card.level === 3 && card.get.green).length;
        this.purple1 = this.artsUnsorted.filter(art => art.color === 'purple' && art.level === 1).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needPurple1 = this.cards.filter(card => card.level === 1 && card.get.purple).length;
        this.purple2 = this.artsUnsorted.filter(art => art.color === 'purple' && art.level === 2).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needPurple2 = this.cards.filter(card => card.level === 2 && card.get.purple).length;
        this.purple3 = this.artsUnsorted.filter(art => art.color === 'purple' && art.level === 3).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needPurple3 = this.cards.filter(card => card.level === 3 && card.get.purple).length;
        this.purple4 = this.artsUnsorted.filter(art => art.color === 'purple' && art.level === 4).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needPurple4 = this.cards.filter(card => card.level === 4 && card.get.purple).length;
        this.black1 = this.artsUnsorted.filter(art => art.color === 'black' && art.level === 1).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needBlack1 = this.cards.filter(card => card.level === 1 && card.get.black).length;
        this.black2 = this.artsUnsorted.filter(art => art.color === 'black' && art.level === 2).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needBlack2 = this.cards.filter(card => card.level === 2 && card.get.black).length;
        this.black3 = this.artsUnsorted.filter(art => art.color === 'black' && art.level === 3).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needBlack3 = this.cards.filter(card => card.level === 3 && card.get.black).length;
        this.black4 = this.artsUnsorted.filter(art => art.color === 'black' && art.level === 4).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needBlack4 = this.cards.filter(card => card.level === 4 && card.get.black).length;
        this.mix4 = this.artsUnsorted.filter(art => art.color === 'mix' && art.level === 4).sort((x, y) => (x.hidden === y.hidden)? 0 : x.hidden ? 1 : -1);; this.needMix4 = this.cards.filter(card => card.level === 4 && !card.levelSpecial).length;

        this.haveRed1 = this.artsUnsorted.filter(art => art.color === 'red' && art.level === 1 && !art.hidden).length;
        this.haveRed2 = this.artsUnsorted.filter(art => art.color === 'red' && art.level === 2 && !art.hidden).length;
        this.haveRed3 = this.artsUnsorted.filter(art => art.color === 'red' && art.level === 3 && !art.hidden).length;
        this.haveLightBlue1 = this.artsUnsorted.filter(art => art.color === 'lightBlue' && art.level === 1 && !art.hidden).length;
        this.haveLightBlue2 = this.artsUnsorted.filter(art => art.color === 'lightBlue' && art.level === 2 && !art.hidden).length;
        this.haveLightBlue3 = this.artsUnsorted.filter(art => art.color === 'lightBlue' && art.level === 3 && !art.hidden).length;
        this.haveDarkBlue1 = this.artsUnsorted.filter(art => art.color === 'darkBlue' && art.level === 1 && !art.hidden).length;
        this.haveDarkBlue2 = this.artsUnsorted.filter(art => art.color === 'darkBlue' && art.level === 2 && !art.hidden).length;
        this.haveDarkBlue3 = this.artsUnsorted.filter(art => art.color === 'darkBlue' && art.level === 3 && !art.hidden).length;
        this.haveGreen1 = this.artsUnsorted.filter(art => art.color === 'green' && art.level === 1 && !art.hidden).length;
        this.haveGreen2 = this.artsUnsorted.filter(art => art.color === 'green' && art.level === 2 && !art.hidden).length;
        this.haveGreen3 = this.artsUnsorted.filter(art => art.color === 'green' && art.level === 3 && !art.hidden).length;
        this.havePurple1 = this.artsUnsorted.filter(art => art.color === 'purple' && art.level === 1 && !art.hidden).length;
        this.havePurple2 = this.artsUnsorted.filter(art => art.color === 'purple' && art.level === 2 && !art.hidden).length;
        this.havePurple3 = this.artsUnsorted.filter(art => art.color === 'purple' && art.level === 3 && !art.hidden).length;
        this.havePurple4 = this.artsUnsorted.filter(art => art.color === 'purple' && art.level === 4 && !art.hidden).length;
        this.haveBlack1 = this.artsUnsorted.filter(art => art.color === 'black' && art.level === 1 && !art.hidden).length;
        this.haveBlack2 = this.artsUnsorted.filter(art => art.color === 'black' && art.level === 2 && !art.hidden).length;
        this.haveBlack3 = this.artsUnsorted.filter(art => art.color === 'black' && art.level === 3 && !art.hidden).length;
        this.haveBlack4 = this.artsUnsorted.filter(art => art.color === 'black' && art.level === 4 && !art.hidden).length;
        this.haveMix4 = this.artsUnsorted.filter(art => art.color === 'mix' && art.level === 4 && !art.hidden).length;

        console.log('-------------------------------')
        console.log('arts = ', this.artsSorted.length + this.artsUnsorted.length);
        console.log('arts Fire = ', this.artsUnsorted.filter(art => art.color === 'red').length);
        console.log('arts Air = ', this.artsUnsorted.filter(art => art.color === 'lightBlue').length);
        console.log('arts Water = ', this.artsUnsorted.filter(art => art.color === 'darkBlue').length);
        console.log('arts Earth = ', this.artsUnsorted.filter(art => art.color === 'green').length);
        console.log('arts Dark = ', this.artsUnsorted.filter(art => art.color === 'black').length);
        console.log('arts Ether = ', this.artsUnsorted.filter(art => art.color === 'purple').length);
        console.log('artsUnsorted = ', this.artsUnsorted.length);
        console.log('artsSorted = ', this.artsSorted.length);
        console.log('-------------------------------')
        console.log('cards =', this.cards.length);
        console.log('cards Fire = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.red).length);
        console.log('cards Air = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.lightBlue).length);
        console.log('cards Water = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.darkBlue).length);
        console.log('cards Earth = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.green).length);
        console.log('cards Dark = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.black).length);
        console.log('cards Ether = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.purple).length);
        console.log('-------------------------------')
        console.log('arts need Fire = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.red).length - this.artsUnsorted.filter(art => art.color === 'red').length);
        console.log('arts need Air = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.lightBlue).length - this.artsUnsorted.filter(art => art.color === 'lightBlue').length);
        console.log('arts need Water = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.darkBlue).length - this.artsUnsorted.filter(art => art.color === 'darkBlue').length);
        console.log('arts need Earth = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.green).length - this.artsUnsorted.filter(art => art.color === 'green').length);
        console.log('arts need Dark = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.black).length - this.artsUnsorted.filter(art => art.color === 'black').length);
        console.log('arts need Ether = ', this.cards.filter(card => (card.level !== 4 && !card.levelSpecial) && card.get.purple).length - this.artsUnsorted.filter(art => art.color === 'purple').length);

    }
}
