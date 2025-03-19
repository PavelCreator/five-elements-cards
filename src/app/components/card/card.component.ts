import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgIf, NgStyle } from "@angular/common";
import { HexagonComponent } from "../hexagon/hexagon.component";
import { InteractionService } from "../../services/interaction.service";
import { Card } from "../../models/card.interface";
import { BoundingClientRect } from "../../models/bounding-client-rect.interface";
import { FormsModule } from "@angular/forms";
import { TextareaAutoresizeDirective } from "../../directives/textarea-autoresize.directive";

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    standalone: true,
    imports: [
        NgStyle,
        HexagonComponent,
        NgIf,
        FormsModule,
        TextareaAutoresizeDirective
    ],
    styleUrls: ['../../style.css']
})
export class CardComponent implements OnInit {
    // @ts-ignore
    @Input() card: Card = {} as Card;
    @ViewChild('renameTextarea') renameTextarea: ElementRef | undefined;

    public borderColor: string | undefined = 'grey';
    private _boundingClientRect: BoundingClientRect = {
        top: 0,
        left: 0
    }
    public typeOfGetHexagon: 'get' | 'getMix' = 'get';
    public hovered: boolean = false;
    public renameModeOn: boolean = false;

    constructor(
        private _interactionService: InteractionService,
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

        this._interactionService.selectedCard$.subscribe((inCard: Card | undefined) => {
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
        if (this.card.artData) return;
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
        this._interactionService.toggleCardSelection(this.card);
    }

    public removeArt(event: MouseEvent) {
        event.stopPropagation();
        if (this.card?.artData) this._interactionService.removeArtFromCard(this.card?.artData);
        this.card.artData = undefined;
    }

    public flip(event: MouseEvent) {
        event.stopPropagation();
        if (this.card.artData) {
            this.card.artData.horizontalReverse = !this.card.artData.horizontalReverse;
            this._interactionService.saveCards();
        }
    }

    public cachedName: string = '';
    public toggleRename(event: MouseEvent | FocusEvent, renameModeOn: boolean) {
        event.stopPropagation();
        this.renameModeOn = renameModeOn;
        if (this.card?.artData?.name) this.cachedName = this.card?.artData?.name;
        setTimeout(() => {
            if (renameModeOn) {
                this.renameTextarea?.nativeElement.focus();
                this.renameTextarea?.nativeElement.setSelectionRange(0, this.card?.artData?.name.length)
            } else {
                this.renameModeOn = false;
                if (this.card.artData) this.cachedName = this.card.artData.name;
                this._interactionService.saveCards();
            }
        });
    }

    public cancelRename(event: MouseEvent) {
        event.stopPropagation();
        if (this.card.artData) this.card.artData.name = this.cachedName;
        this.renameModeOn = false;
    }

    public endRenameOnFocusOut() {
        setTimeout(() => {
            if (this.renameModeOn) {
                this.renameModeOn = false;
                if (this.card.artData) this.cachedName = this.card.artData.name;
                this._interactionService.saveCards();
            }
        }, 300);
    }
}
