import { Component, OnInit } from '@angular/core';
import { CardComponent } from "./card/card.component";
import { cards } from "./сore-logic/cards";
import { NgFor, NgStyle } from "@angular/common";
import { Card } from "./interfaces/card.interface";
import { ArtsComponent } from "./arts/arts.component";
import { DataService } from "./data.service";
import { MenuComponent } from "./menu/menu.component";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CardComponent, NgFor, ArtsComponent, NgStyle, MenuComponent],
    templateUrl: 'app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit{
    public cards: Card[] = cards;
    public artsWrapperHeight: string = '50vh';
    public cardsWrapperHeight: string = '50vh';

    constructor(
        private _dataService: DataService
    ) {
    }

    ngOnInit() {
        this._dataService.selectedViewMode$.subscribe((inSelectedMenuItem: number | undefined) => {
            switch (inSelectedMenuItem) {
                case 1:
                    this.artsWrapperHeight = '0vh'
                    this.cardsWrapperHeight = '100vh'
                    break;
                case 2:
                    this.artsWrapperHeight = '30vh'
                    this.cardsWrapperHeight = '70vh'
                    break;
                case 3:
                default:
                    this.artsWrapperHeight = '50vh'
                    this.cardsWrapperHeight = '50vh'
                    break;
                case 4:
                    this.artsWrapperHeight = '70vh'
                    this.cardsWrapperHeight = '30vh'
                    break;
                case 5:
                    this.artsWrapperHeight = '100vh'
                    this.cardsWrapperHeight = '0vh'
                    break;
            }
        })
    }
}
