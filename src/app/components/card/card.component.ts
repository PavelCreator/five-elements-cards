import { Component, ElementRef, Input, OnInit, Pipe, PipeTransform, Renderer2, ViewChild } from '@angular/core';
import { KeyValue, KeyValuePipe, NgForOf, NgIf, NgStyle } from "@angular/common";
import { HexagonComponent } from "../hexagon/hexagon.component";
import { InteractionService } from "../../services/interaction.service";
import { Card } from "../../models/card.interface";
import { BoundingClientRect } from "../../models/bounding-client-rect.interface";
import { FormsModule } from "@angular/forms";
import { TextareaAutoresizeDirective } from "../../directives/textarea-autoresize.directive";
import { ImageService } from "../../services/image.service";
import { CardSide } from "../../models/card-side.type";
import { ChaosCard } from "../../models/chaos-card.interface";

@Pipe({
    name: 'keys',
    standalone: true
})
export class KeysPipe implements PipeTransform {
  transform(value: any) : any {
    let keys = [];
    for (let key in value) {
      keys.push({key: key, value: value[key]});
    }
    return keys;
  }
}

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    standalone: true,
    imports: [
        NgStyle,
        HexagonComponent,
        NgIf,
        NgForOf,
        FormsModule,
        TextareaAutoresizeDirective,
        KeysPipe
    ],
    styleUrls: ['../../style.css']
})
export class CardComponent implements OnInit {
    // @ts-ignore
    @Input() card: Card = {} as Card;
    @ViewChild('renameTextarea') renameTextarea: ElementRef | undefined;

    private onCompare(_left: KeyValue<any, any>, _right: KeyValue<any, any>): number {
        return -1;
    }

    public borderColor: string | undefined = 'grey';
    public cardSide: CardSide = 'front';
    public cardSideAnimation: boolean = false;
    private _boundingClientRect: BoundingClientRect = {
        top: 0,
        left: 0
    }
    public typeOfGetHexagon: 'get' | 'getMix' = 'get';
    public hovered: boolean = false;
    public renameModeOn: boolean = false;
    public cardBackUrl: string = '';

    constructor(
        private _interactionService: InteractionService,
        private _imageService: ImageService,
        private el: ElementRef,
        private render: Renderer2
    ) {
    }

    ngOnInit() {
        this.cardBackUrl = this._imageService.generateCardBackUrl(this.card);
        this.render.listen('window', 'load', () => {

            const viewportOffset = this.el.nativeElement.getBoundingClientRect();
            this._boundingClientRect = {
                top: viewportOffset.top,
                left: viewportOffset.left
            }
        })

        this.card.pay = Object.fromEntries(
            Object.entries(this.card.pay).sort(([, a], [, b]) => a - b)
        );

        this._interactionService.selectedCard$.subscribe((inCard: Card | ChaosCard | undefined) => {
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

        this._interactionService.cardsSide$.subscribe((inCardSide: CardSide) => {
            if (inCardSide === 'back') {
                this.cardSideAnimation = true;
            } else {
                this.cardSideAnimation = false;
            }
            setTimeout(() => {
                this.cardSide = inCardSide;
            }, 150);
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
