import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Pipe, PipeTransform, Renderer2, ViewChild } from '@angular/core';
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
import { Color } from '../../models/color.type';

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
    @Input() disableHoverUi: boolean = false;
    @Input() playerTokens?: { [key in Color]?: number };
    @Input() playerCardTokens?: { [key in Color]?: number };
    @Input() playerMasterColors?: Color[];
    @Input() passiveBlackTappedCount: number = 0;
    @Input() purchaseLockedThisTurn: boolean = false;
    @Input() purchaseBlocked: boolean = false;
    @Input() purchaseBlockedLabel: string = 'Already Have';
    @Input() soldPending: boolean = false;
    @Input() soldPendingLabel: string = 'SOLD';
    @Output() purchaseCard = new EventEmitter<Card>();
    @Output() purplePurchasePreview = new EventEmitter<Card>();
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
    public diceRollResults: string[] = [];
    private readonly _payColorsWithoutPurple: Color[] = ['red', 'green', 'white', 'blue', 'black'];
    private readonly _elementalPayColors: Color[] = ['red', 'green', 'white', 'blue'];
    private readonly _purpleWildcardPayColors: Color[] = ['red', 'green', 'white', 'blue'];
    private readonly _magicWildcardPayColors: Color[] = ['red', 'green', 'white', 'blue', 'purple'];
    private readonly _supportedPayKeys: Set<string> = new Set(['red', 'green', 'white', 'blue', 'black', 'purple']);

    public get isAffordableForPlayer(): boolean {
        const plan = this._buildHoverPaymentPlan();
        if (!plan) {
            return false;
        }
        return plan.isAffordable;
    }

    public get isAffordableNow(): boolean {
        return this.isAffordableForPlayer && !this.purchaseLockedThisTurn && !this.purchaseBlocked && !this.soldPending;
    }

    public get isAffordableNowPassiveOnly(): boolean {
        return this.isAffordableNow
            && !this._hasPurplePaymentRequirement()
            && this._hasAnyPaymentRequirement()
            && this._isCoveredByPassiveCardsOnly();
    }

    public get isAffordableNowWithPurpleSpend(): boolean {
        return this.isAffordableNow && this._hasPurplePaymentRequirement();
    }

    public get isAffordableNowWithoutPurpleSpend(): boolean {
        return this.isAffordableNow
            && !this.isAffordableNowPassiveOnly
            && !this._hasPurplePaymentRequirement();
    }

    public get isAffordableNextTurnOnly(): boolean {
        return this.isAffordableForPlayer && this.purchaseLockedThisTurn && !this.purchaseBlocked && !this.soldPending;
    }

    public get isCardPurchasable(): boolean {
        return this.disableHoverUi && this.isAffordableNow;
    }

    private _getPurpleCoinsNeededForPurchase(): number {
        const plan = this._buildHoverPaymentPlan();
        return plan?.purpleNeeded ?? 0;
    }

    private _hasAnyPaymentRequirement(): boolean {
        const pay = this.card?.pay;
        if (!pay) {
            return false;
        }

        for (const key of this._supportedPayKeys) {
            if ((pay[key as Color] ?? 0) > 0) {
                return true;
            }
        }

        return false;
    }

    private _isCoveredByPassiveCardsOnly(): boolean {
        const pay = this.card?.pay;
        if (!pay) {
            return false;
        }

        const playerCards = this.playerCardTokens ?? {};

        if ((pay['purple'] ?? 0) > (playerCards['purple'] ?? 0)) {
            return false;
        }

        for (const color of this._payColorsWithoutPurple) {
            const required = pay[color] ?? 0;
            const passiveBonus = color === 'black'
                ? Math.max((playerCards['black'] ?? 0) - Math.max(0, this.passiveBlackTappedCount), 0)
                : (playerCards[color] ?? 0);
            if (required > passiveBonus) {
                return false;
            }
        }

        return true;
    }

    private _hasPurplePaymentRequirement(): boolean {
        const pay = this.card?.pay;
        if (!pay) {
            return false;
        }

        return (pay['purple'] ?? 0) > 0 || this._getPurpleCoinsNeededForPurchase() > 0;
    }

    private _buildHoverPaymentPlan(): { isAffordable: boolean; purpleNeeded: number } | null {
        if (!this.disableHoverUi || !this.playerTokens) {
            return null;
        }

        const pay = this.card?.pay;
        if (!pay) {
            return null;
        }

        for (const [key, value] of Object.entries(pay)) {
            if ((value ?? 0) > 0 && !this._supportedPayKeys.has(key)) {
                return { isAffordable: false, purpleNeeded: 0 };
            }
        }

        const playerCards = this.playerCardTokens ?? {};
        const hasDarkMaster = this._hasDarkMaster();
        const tokenPool: Partial<Record<Color, number>> = {
            red: this.playerTokens['red'] ?? 0,
            green: this.playerTokens['green'] ?? 0,
            white: this.playerTokens['white'] ?? 0,
            blue: this.playerTokens['blue'] ?? 0,
            purple: this.playerTokens['purple'] ?? 0,
            black: this.playerTokens['black'] ?? 0,
        };

        const purpleCardBonus = playerCards['purple'] ?? 0;
        let purpleNeeded = Math.max((pay['purple'] ?? 0) - purpleCardBonus, 0);

        if (this._hasMagicMaster()) {
            const passiveBlack = Math.max((playerCards['black'] ?? 0) - Math.max(0, this.passiveBlackTappedCount), 0);
            const requiredBlack = pay['black'] ?? 0;
            let requiredBlackAfterPassive = Math.max(requiredBlack - passiveBlack, 0);

            const blackDirectSpend = Math.min(requiredBlackAfterPassive, tokenPool['black'] ?? 0);
            tokenPool['black'] = Math.max((tokenPool['black'] ?? 0) - blackDirectSpend, 0);
            requiredBlackAfterPassive -= blackDirectSpend;

            if (requiredBlackAfterPassive > 0 && hasDarkMaster) {
                for (const donorColor of this._magicWildcardPayColors) {
                    const donorAvailable = tokenPool[donorColor] ?? 0;
                    if (donorAvailable <= 0) {
                        continue;
                    }

                    const donorSpend = Math.min(requiredBlackAfterPassive, donorAvailable);
                    tokenPool[donorColor] = donorAvailable - donorSpend;
                    requiredBlackAfterPassive -= donorSpend;

                    if (requiredBlackAfterPassive <= 0) {
                        break;
                    }
                }
            }

            if (requiredBlackAfterPassive > 0) {
                return { isAffordable: false, purpleNeeded: 0 };
            }

            const nonBlackNeeds: Partial<Record<Color, number>> = {};
            for (const color of this._magicWildcardPayColors) {
                nonBlackNeeds[color] = Math.max(pay[color] ?? 0, 0);
            }

            const passivePool: Partial<Record<Color, number>> = {};
            for (const color of this._magicWildcardPayColors) {
                passivePool[color] = playerCards[color] ?? 0;
            }

            this._coverNeedsWithUniversalPool(nonBlackNeeds, passivePool);
            this._coverNeedsWithUniversalPool(nonBlackNeeds, tokenPool);

            return {
                isAffordable: this._getTotalNeedForColors(nonBlackNeeds, this._magicWildcardPayColors) <= 0,
                purpleNeeded: 0,
            };
        }

        const masteredColors = this._getMasteredElementalColors();

        for (const color of this._purpleWildcardPayColors) {
            const required = pay[color] ?? 0;
            const passiveBonus = playerCards[color] ?? 0;
            let remaining = Math.max(required - passiveBonus, 0);
            if (remaining <= 0) {
                continue;
            }

            const sameColorSpend = Math.min(remaining, tokenPool[color] ?? 0);
            tokenPool[color] = Math.max((tokenPool[color] ?? 0) - sameColorSpend, 0);
            remaining -= sameColorSpend;

            if (remaining > 0 && masteredColors.has(color)) {
                for (const donorColor of this._elementalPayColors) {
                    if (donorColor === color) {
                        continue;
                    }

                    const donorAvailable = tokenPool[donorColor] ?? 0;
                    if (donorAvailable <= 0) {
                        continue;
                    }

                    const donorSpend = Math.min(remaining, donorAvailable);
                    tokenPool[donorColor] = donorAvailable - donorSpend;
                    remaining -= donorSpend;

                    if (remaining <= 0) {
                        break;
                    }
                }
            }

            if (remaining > 0) {
                purpleNeeded += remaining;
            }
        }

        const availablePurple = tokenPool['purple'] ?? 0;
        if (availablePurple < purpleNeeded) {
            return {
                isAffordable: false,
                purpleNeeded,
            };
        }

        tokenPool['purple'] = Math.max(availablePurple - purpleNeeded, 0);

        const passiveBlack = Math.max((playerCards['black'] ?? 0) - Math.max(0, this.passiveBlackTappedCount), 0);
        const requiredBlack = pay['black'] ?? 0;
        let remainingBlackNeed = Math.max(requiredBlack - passiveBlack, 0);

        const directBlackSpend = Math.min(remainingBlackNeed, tokenPool['black'] ?? 0);
        tokenPool['black'] = Math.max((tokenPool['black'] ?? 0) - directBlackSpend, 0);
        remainingBlackNeed -= directBlackSpend;

        if (remainingBlackNeed > 0 && hasDarkMaster) {
            const darkMasterDonorColors: Color[] = ['red', 'green', 'white', 'blue', 'purple'];
            for (const donorColor of darkMasterDonorColors) {
                const donorAvailable = tokenPool[donorColor] ?? 0;
                if (donorAvailable <= 0) {
                    continue;
                }

                const donorSpend = Math.min(remainingBlackNeed, donorAvailable);
                tokenPool[donorColor] = donorAvailable - donorSpend;
                remainingBlackNeed -= donorSpend;

                if (remainingBlackNeed <= 0) {
                    break;
                }
            }
        }

        return {
            isAffordable: remainingBlackNeed <= 0,
            purpleNeeded,
        };
    }

    private _getMasteredElementalColors(): Set<Color> {
        const mastered = new Set<Color>();
        for (const color of this.playerMasterColors ?? []) {
            if (this._elementalPayColors.includes(color)) {
                mastered.add(color);
            }
        }
        return mastered;
    }

    private _hasMagicMaster(): boolean {
        return (this.playerMasterColors ?? []).includes('purple');
    }

    private _hasDarkMaster(): boolean {
        return (this.playerMasterColors ?? []).includes('black');
    }

    private _coverNeedsWithUniversalPool(
        needs: Partial<Record<Color, number>>,
        pool: Partial<Record<Color, number>>
    ): void {
        for (const targetColor of this._magicWildcardPayColors) {
            let remaining = Math.max(needs[targetColor] ?? 0, 0);
            if (remaining <= 0) {
                needs[targetColor] = 0;
                continue;
            }

            const directAvailable = pool[targetColor] ?? 0;
            const directSpend = Math.min(remaining, directAvailable);
            pool[targetColor] = Math.max(directAvailable - directSpend, 0);
            remaining -= directSpend;

            if (remaining > 0) {
                for (const donorColor of this._magicWildcardPayColors) {
                    if (donorColor === targetColor) {
                        continue;
                    }

                    const donorAvailable = pool[donorColor] ?? 0;
                    if (donorAvailable <= 0) {
                        continue;
                    }

                    const donorSpend = Math.min(remaining, donorAvailable);
                    pool[donorColor] = donorAvailable - donorSpend;
                    remaining -= donorSpend;

                    if (remaining <= 0) {
                        break;
                    }
                }
            }

            needs[targetColor] = remaining;
        }
    }

    private _getTotalNeedForColors(needs: Partial<Record<Color, number>>, colors: Color[]): number {
        return colors.reduce((total, color) => total + Math.max(needs[color] ?? 0, 0), 0);
    }

    public trackByColor(index: number, color: string): string {
        return index.toString();
    }

    public handleCardClick() {
        if (this.disableHoverUi) {
            if (this.isCardPurchasable) {
                if (this.isAffordableNowWithPurpleSpend) {
                    this.purplePurchasePreview.emit(this.card);
                    return;
                }
                this.purchaseCard.emit(this.card);
            }
            return;
        }
        this.toggleCardSelection();
    }

    public handleRenameClick(event: MouseEvent) {
        if (this.disableHoverUi) {
            event.stopPropagation();
            return;
        }
        this.toggleRename(event, true);
    }

    public setHovered(isHovered: boolean) {
        if (this.disableHoverUi) return;
        this.hovered = isHovered;
    }

    constructor(
        private _interactionService: InteractionService,
        private _imageService: ImageService,
        private el: ElementRef,
        private render: Renderer2
    ) {
    }

    ngOnInit() {
        if (this.card.artData?.picturePath) {
            this.card.artData.picturePath = this._imageService.normalizeMidjourneyUrl(this.card.artData.picturePath) ?? this.card.artData.picturePath;
        }
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

    public changeUrl(event: MouseEvent) {
        event.stopPropagation();
        if (!this.card.artData) return;

        const newUrl = prompt('Enter new URL:', this.card.artData.picturePath);
        if (newUrl && newUrl.trim() !== '') {
            this.card.artData.picturePath = this._imageService.normalizeMidjourneyUrl(newUrl.trim()) ?? newUrl.trim();
            this._interactionService.saveCards();
        }
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
