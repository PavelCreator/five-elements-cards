import { Component, Input, OnInit } from '@angular/core';
import { NgIf, NgStyle } from "@angular/common";
import { InteractionService } from "../../services/interaction.service";
import { FormsModule } from "@angular/forms";
import { ImageService } from "../../services/image.service";
import { CardSide } from "../../models/card-side.type";
import { SettingsService } from "../../services/settings.service";
import { Lang } from "../../models/lang.type";
import { HexagonComponent } from "../hexagon/hexagon.component";
import { HowToWinCard } from "../../models/how-to-win-card.interface";

@Component({
    selector: 'app-how-to-win',
    templateUrl: './how-to-win.component.html',
    standalone: true,
    imports: [
        NgStyle,
        NgIf,
        HexagonComponent,
        FormsModule
    ],
    styleUrls: ['../../style.css']
})
export class HowToWinComponent implements OnInit {
    // @ts-ignore
    @Input() card: HowToWinCard = {} as HowToWinCard;

    public lang: Lang | undefined;

    public cardSide: CardSide = 'front';
    public hovered: boolean = false;
    public chaosCardBackground: string = './assets/back_cards/how_to_win/bg-front-how-to-win'+ (this.card.time === 'quick' ? '-quick' : '') + '.png';

    constructor(
        private _interactionService: InteractionService,
        private _settingsService: SettingsService,
        private _imageService: ImageService
    ) {
    }

    ngOnInit() {
        console.log('this.card.time =', this.card.time);
        this._interactionService.cardsSide$.subscribe((inCardSide: CardSide) => {
            setTimeout(() => {
                this.cardSide = inCardSide;
            }, 150);
        })

        this.lang = this._settingsService.lang;
        if (this.card.time === 'quick') {
            this.chaosCardBackground = './assets/back_cards/how_to_win/bg-front-how-to-win-quick.png';
        }

    }

    public formatHexNumber(hexNumber: string): number {
        if (typeof +hexNumber === 'number') return +hexNumber;
        else return 0;
    }
}
