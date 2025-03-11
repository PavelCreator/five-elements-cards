import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { NgIf, NgStyle } from "@angular/common";
import { HexagonComponent } from "../hexagon/hexagon.component";
import { DataService } from "../data.service";
import { Card } from "../interfaces/card.interface";
import { BoundingClientRect } from "../interfaces/bounding-client-rect.interface";

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
    private _boundingClientRect: BoundingClientRect = {
        top: 0,
        left: 0
    }
    public typeOfGetHexagon: 'get' | 'getMix' = 'get';

    constructor(
        private _dataService: DataService,
        private el: ElementRef,
        private render: Renderer2
    ) {
    }

    ngOnInit() {
        this.render.listen('window', 'load', () => {
            const viewportOffset = this.el.nativeElement.getBoundingClientRect();
            this._boundingClientRect = {
                top: viewportOffset.top,
                left: viewportOffset.left
            }
            console.log(this._boundingClientRect);
        })

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

        if (this.card.color === 'mix') {
            this.typeOfGetHexagon = 'getMix';
        }
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
        this.card.boundingClientRect = {...this._boundingClientRect};
        this._dataService.toggleCardSelection(this.card);
    }
}
