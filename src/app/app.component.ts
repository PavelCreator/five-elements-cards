import { Component, OnInit } from '@angular/core';
import { NgIf, NgStyle } from "@angular/common";
import { ArtsComponent } from "./arts/arts.component";
import { DataService } from "./data.service";
import { MenuComponent } from "./menu/menu.component";
import { ArtComponent } from "./art/art.component";
import { Art } from "./interfaces/art.interface";
import { CardsComponent } from "./cards/cards.component";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CardsComponent, ArtsComponent, ArtComponent, ArtComponent, MenuComponent, NgIf, NgStyle],
    templateUrl: 'app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit{
    public artsWrapperHeight: string = '50vh';
    public cardsWrapperHeight: string = '50vh';
    // @ts-ignore
    public tempArt: Art;
    public showTempArt: boolean = false;
    public tempArtTopPosition: string = '0px';
    public tempArtLeftPosition: string = '0px';

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

        this._dataService.tempFlyingArt$.subscribe((inArt: Art | undefined) => {
            if (inArt) {
                this.tempArtTopPosition = (Math.round(inArt.boundingClientRectStart?.top || 0)).toString() + 'px';
                this.tempArtLeftPosition = (Math.round(inArt.boundingClientRectStart?.left || 0)).toString() + 'px';
                this.showTempArt = true;
                this.tempArt = inArt;
                setTimeout(() => {
                    if (this.tempArt && this.tempArt.boundingClientRectStart && this.tempArt.boundingClientRectEnd) {
                        this.tempArtTopPosition = (Math.round(inArt.boundingClientRectEnd?.top || 0)).toString() + 'px';
                        this.tempArtLeftPosition = (Math.round(inArt.boundingClientRectEnd?.left || 0)).toString() + 'px';
                        console.log('(Math.round(inArt.boundingClientRectStart?.top || 0)).toString() + \'px\' =', (Math.round(inArt.boundingClientRectEnd?.top || 0)).toString() + 'px');
                    }
                }, 1);
                setTimeout(() => {
                    this.showTempArt = false;
                    this.tempArtTopPosition = '0px';
                    this.tempArtLeftPosition = '0px';
                }, this._dataService.animationFlyingArtTime + 1);
            }
        });
    }
}
