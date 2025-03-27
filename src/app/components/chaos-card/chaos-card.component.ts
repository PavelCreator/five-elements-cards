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
        FormsModule
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
    public textToken2: TextTokenKey | undefined;
    public hexNumber: number = 0;
    public hexNumber2: number = 0;
    public textAfterTokens: string = '';
    public textAfter2Tokens: string = '';

    public borderColor: string | undefined = 'grey';
    public chaosCardBackground: string = './assets/back_cards/chaos_front4.png'; //'https://cdn.midjourney.com/78e3d8e0-b1be-4429-bc5d-199ebdf6e763/0_1.png';//, 'https://cdn.midjourney.com/f0d7865d-925f-4095-acf7-030ee9c5be0b/0_2.png';
    public cardSide: CardSide = 'front';
    private _boundingClientRect: BoundingClientRect = {
        top: 0,
        left: 0
    }
    public hovered: boolean = false;
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

        if (arrayOfStrings[0]) this.textBeforeTokens = arrayOfStrings[0];
        if (arrayOfStrings[2]) this.textAfterTokens = arrayOfStrings[2];
        if (arrayOfStrings[4]) this.textAfter2Tokens = arrayOfStrings[4];

        if (arrayOfStrings[1]) {
            const arrayOfHex = arrayOfStrings[1].split('--')
            this.textToken = arrayOfHex[0];
            this.hexNumber = this.formatHexNumber(arrayOfHex[1]);
        }
        if (arrayOfStrings[3]) {
            const arrayOfHex2 = arrayOfStrings[3].split('--')
            this.textToken2 = arrayOfHex2[0];
            this.hexNumber2 = this.formatHexNumber(arrayOfHex2[1]);
        }


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
}
