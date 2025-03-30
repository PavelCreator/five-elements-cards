import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgIf, NgStyle } from "@angular/common";
import { InteractionService } from "../../services/interaction.service";
import { Card } from "../../models/card.interface";
import { FormsModule } from "@angular/forms";
import { ImageService } from "../../services/image.service";
import { CardSide } from "../../models/card-side.type";
import { SettingsService } from "../../services/settings.service";
import { Lang } from "../../models/lang.type";
import { HexagonComponent } from "../hexagon/hexagon.component";
import { MasterCard } from "../../models/master-card.interface";

@Component({
    selector: 'app-master-card',
    templateUrl: './master-card.component.html',
    standalone: true,
    imports: [
        NgStyle,
        NgIf,
        HexagonComponent,
        FormsModule
    ],
    styleUrls: ['../../style.css']
})
export class MasterCardComponent implements OnInit {
    // @ts-ignore
    @Input() card: MasterCard = {} as MasterCard;
    @ViewChild('renameTextarea') renameTextarea: ElementRef | undefined;

    public lang: Lang = this._settingsService.lang;

    public canBeUsedAs = {
        en: ' can \n be used as ',
        ru: ' может быть использовано как '
    };


    public borderColor: string | undefined = 'grey';
    public cardSide: CardSide = 'front';
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

        this._interactionService.cardsSide$.subscribe((inCardSide: CardSide) => {
            setTimeout(() => {
                this.cardSide = inCardSide;
            }, 150);
        })

        this.lang = this._settingsService.lang;
        console.log('this.lang =', this.lang);

    }

    public formatHexNumber(hexNumber: string): number {
        if (typeof +hexNumber === 'number') return +hexNumber;
        else return 0;
    }
}
