import { Component, ElementRef, Input, OnInit, Pipe, PipeTransform, Renderer2, ViewChild } from '@angular/core';
import { KeyValue, KeyValuePipe, NgClass, NgForOf, NgIf, NgStyle } from "@angular/common";
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
        NgClass,
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
    public typeOfGetHexagon: 'get' | 'getMix' | 'payBonus' = 'get';
    public hovered: boolean = false;
    public renameModeOn: boolean = false;
    public cardBackUrl: string = '';
    public showDisabledCard: boolean = false;
    public printModeEnabled: boolean = true;
    public editTokensMode: boolean = false;
    public allColors: string[] = ['green', 'white', 'blue', 'red', 'purple', 'black'];

    public trackByColor(index: number, color: string): string {
        return index.toString();
    }

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
            Object.entries(this.card.pay).sort(([, a], [, b]) => (a ?? 0) - (b ?? 0))
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

        if (this.card.levelBonus) {
            this.typeOfGetHexagon = 'payBonus';
        }

        this._interactionService.showDisabledCards$.subscribe((inShowHidden: boolean | undefined) => {
            if (inShowHidden !== undefined) {
                this.showDisabledCard = inShowHidden;
            }
        })

        this._interactionService.printMode$.subscribe((inPrintMode: boolean) => {
            this.printModeEnabled = inPrintMode;
        })

        this._interactionService.editTokensMode$.subscribe((inEditTokensMode: boolean) => {
            this.editTokensMode = inEditTokensMode;
        })
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

    public changeDisableState(event: MouseEvent, state: boolean) {
        event.stopPropagation();
        this.card.hidden = state;
        this._interactionService.recalculateCards();
        this._interactionService.saveCards();
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

    public increaseToken(color: string) {
        console.log('increaseToken called with color:', color);
        if (!this.editTokensMode) return;
        if (!this.card.pay[color]) this.card.pay[color] = 0;
        this.card.pay[color]++;
        this._interactionService.saveCards();
    }

    public decreaseToken(color: string) {
        console.log('decreaseToken called with color:', color);
        if (!this.editTokensMode) return;
        if (this.card.pay[color] && this.card.pay[color] > 0) {
            this.card.pay[color]--;
            this._interactionService.saveCards();
        }
    }

    public deleteCard(event: MouseEvent) {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete this card?')) {
            this._interactionService.removeCard(this.card);
        }
    }

    public setLevel(event: MouseEvent, level: number) {
        event.stopPropagation();
        this.card.level = level;
        this._interactionService.saveCards();
    }
}
