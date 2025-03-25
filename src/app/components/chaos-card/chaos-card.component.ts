import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgIf, NgStyle } from "@angular/common";
import { InteractionService } from "../../services/interaction.service";
import { Card } from "../../models/card.interface";
import { BoundingClientRect } from "../../models/bounding-client-rect.interface";
import { FormsModule } from "@angular/forms";
import { TextareaAutoresizeDirective } from "../../directives/textarea-autoresize.directive";
import { ImageService } from "../../services/image.service";
import { CardSide } from "../../models/card-side.type";
import { ChaosCard } from "../../models/chaos-card.interface";
import { SettingsService } from "../../services/settings.service";
import { Lang } from "../../models/lang.type";
import { HexagonComponent } from "../hexagon/hexagon.component";
import { TextTokenKey } from "../../models/text-token-key.type";

@Component({
    selector: 'app-chaos-card',
    templateUrl: './chaos-card.component.html',
    standalone: true,
    imports: [
        NgStyle,
        NgIf,
        HexagonComponent,
        FormsModule,
        TextareaAutoresizeDirective
    ],
    styleUrls: ['../../style.css']
})
export class ChaosCardComponent implements OnInit {
    // @ts-ignore
    @Input() card: ChaosCard = {} as ChaosCard;
    @ViewChild('renameTextarea') renameTextarea: ElementRef | undefined;

    public lang: Lang = this._settingsService.lang;

    public textBeforeTokens: string = '';
    public textToken: TextTokenKey | undefined;
    public hexNumber: number = 0;
    public textAfterTokens: string = '';

    public borderColor: string | undefined = 'grey';
    public chaosCardBackground: string = './assets/back_cards/chaos_front4.png'; //'https://cdn.midjourney.com/78e3d8e0-b1be-4429-bc5d-199ebdf6e763/0_1.png';//, 'https://cdn.midjourney.com/f0d7865d-925f-4095-acf7-030ee9c5be0b/0_2.png';
    public cardSide: CardSide = 'front';
    private _boundingClientRect: BoundingClientRect = {
        top: 0,
        left: 0
    }
    public hovered: boolean = false;
    public renameModeOn: boolean = false;
    public cardBackUrl: string =  '';

    constructor(
        private _interactionService: InteractionService,
        private _settingsService: SettingsService,
        private _imageService: ImageService,
        private el: ElementRef,
        private render: Renderer2
    ) {
    }

    ngOnInit() {
        this.cardBackUrl = this._imageService.generateCardBackUrl({color: 'chaos'} as Card);
        this.render.listen('window', 'load', () => {

            const viewportOffset = this.el.nativeElement.getBoundingClientRect();
            this._boundingClientRect = {
                top: viewportOffset.top,
                left: viewportOffset.left
            }
        })

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
            setTimeout(() => {
                this.cardSide = inCardSide;
            }, 150);
        })

        this.lang = this._settingsService.lang;
        console.log('this.lang =', this.lang);
        // @ts-ignore
        const text = this.card.text[this.lang];

        const arrayOfStrings = text.split('**');
        this.textBeforeTokens = arrayOfStrings[0];
        const arrayOfHex = arrayOfStrings[1].split('--')
        this.textToken = arrayOfHex[0];
        this.hexNumber = this.formatHexNumber(arrayOfHex[1]);
        this.textAfterTokens = arrayOfStrings[2];
    }

    public formatHexNumber(hexNumber: string): number {
        if (typeof +hexNumber === 'number') return +hexNumber;
        else return 0;
    }

    private _removeCardSelection() {
        this.card.isSelected = false;
        this.borderColor = '#898989';
    }

    private _addCardSelection() {
        this.card.isSelected = true;
        this.borderColor = '#ff00f2';
    }

    public flip(event: MouseEvent) {
        event.stopPropagation();
        this.card.horizontalReverse = !this.card.horizontalReverse;
        this._interactionService.saveCards();
    }

    public cachedName: any;
    public toggleRename(event: MouseEvent | FocusEvent, renameModeOn: boolean) {
        event.stopPropagation();
        this.renameModeOn = renameModeOn;
        if (this.card?.text) this.cachedName = this.card?.text;
        setTimeout(() => {
            if (renameModeOn) {
                this.renameTextarea?.nativeElement.focus();
                //@ts-ignore
                this.renameTextarea?.nativeElement.setSelectionRange(0, this.card?.text[this._settingsService.lang].length)
            } else {
                this.renameModeOn = false;
                if (this.card) this.cachedName = this.card.text;
                this._interactionService.saveCards();
            }
        });
    }

    public cancelRename(event: MouseEvent) {
        event.stopPropagation();
        if (this.card.text) this.card.text = this.cachedName;
        this.renameModeOn = false;
    }

    public endRenameOnFocusOut() {
        setTimeout(() => {
            if (this.renameModeOn) {
                this.renameModeOn = false;
                if (this.card) this.cachedName = this.card.text;
                this._interactionService.saveCards();
            }
        }, 300);
    }
}
