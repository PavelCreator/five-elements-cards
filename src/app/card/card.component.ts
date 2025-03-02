import { Component, Input, OnInit } from '@angular/core';
import { NgIf, NgStyle } from "@angular/common";
import { HexagonComponent } from "../hexagon/hexagon.component";
import { DataService } from "../data.service";
import { Card } from "../interfaces/card.interface";

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    standalone: true,
    imports: [
        NgStyle, HexagonComponent, NgIf
    ],
    styleUrls: ['../style.css']
})
export class CardComponent implements OnInit {
    // @ts-ignore
    @Input() card: Card;
    public borderColor: string | undefined = 'grey';

    constructor(
        private _dataService: DataService
    ) {
    }

    ngOnInit() {
        console.log('Card Component');
        this._dataService.selectedCard$.subscribe((inCard: Card | undefined) => {
            if (inCard === undefined && this.card.isSelected) {
                this._removeCardSelection();
            }
            if (inCard?.orderNumber && inCard?.orderNumber === this.card.orderNumber && !this.card.isSelected) {
                this._addCardSelection();
            }
            if (inCard?.orderNumber !== this.card.orderNumber && this.card.isSelected) {
                this._removeCardSelection();
            }
        })
    }

    public toggleCardSelection() {
        if (this.card.isSelected) {
            this._removeCardSelection();
        } else {
            this._selectCard();
        }
    }

    private _removeCardSelection() {
        this.card.isSelected = false;
        this.borderColor = '#898989';
    }

    private _addCardSelection() {
        this.card.isSelected = true;
        this.borderColor = '#ff00f2';
    }

    private _selectCard() {
        this._dataService.toggleCardSelection(this.card);
    }
}
