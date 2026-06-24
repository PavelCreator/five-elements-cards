import { ChangeDetectionStrategy, Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import {NgClass, NgIf, NgStyle} from "@angular/common";
import { InteractionService } from "../../services/interaction.service";
import { FormsModule } from "@angular/forms";
import { ImageService } from "../../services/image.service";
import { CardSide } from "../../models/card-side.type";
import { SettingsService } from "../../services/settings.service";
import { Lang } from "../../models/lang.type";
import { HexagonComponent } from "../hexagon/hexagon.component";
import { HowToWinCard } from "../../models/how-to-win-card.interface";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-how-to-win',
    templateUrl: './how-to-win.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgStyle,
        NgIf,
        HexagonComponent,
        FormsModule,
        NgClass
    ],
    styleUrls: ['../../style.css']
})
export class HowToWinComponent implements OnInit {
    // @ts-ignore
    @Input() card: HowToWinCard = {} as HowToWinCard;

    public lang: Lang | undefined;

    public cardSide: CardSide = 'front';
    public chaosCardBackground: string = '';
    public textInverseColor: boolean = false;
    public printModeEnabled: boolean = true;
    private readonly _destroyRef: DestroyRef = inject(DestroyRef);

    constructor(
        private _interactionService: InteractionService,
        private _settingsService: SettingsService,
        private _imageService: ImageService
    ) {
    }

    ngOnInit() {
        this._interactionService.cardsSide$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((inCardSide: CardSide) => {
            setTimeout(() => {
                this.cardSide = inCardSide;
            }, 150);
        })

        this._interactionService.printMode$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((inPrintMode: boolean) => {
            this.printModeEnabled = inPrintMode;
        })

        this.lang = this._settingsService.lang;
        const type = (this.card?.type ?? '').toLowerCase();
        if (!type) {
            return;
        }

        if (type === 'grand') {
            this.chaosCardBackground = './assets/back_cards/how_to_win/how-to-win-rect-grand.jpg';
        } else if (type === 'blitz') {
            this.chaosCardBackground = './assets/back_cards/how_to_win/how-to-win-rect-blitz.jpg';
            this.textInverseColor = true;
        }
    }

    public formatHexNumber(hexNumber: string): number {
        if (typeof +hexNumber === 'number') return +hexNumber;
        else return 0;
    }
}
