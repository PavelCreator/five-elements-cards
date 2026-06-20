import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CardsStoreService } from '../../services/cards-store.service';
import { Card } from '../../models/card.interface';
import { Color } from '../../models/color.type';
import { CardComponent } from '../card/card.component';
import { HexagonComponent } from '../hexagon/hexagon.component';
import { PlayerColumnComponent } from '../player-column/player-column.component';
import { ImageService } from '../../services/image.service';
import { InteractionService } from '../../services/interaction.service';
import { cards as initialCards } from '../../data/cards';
import { LocalStorageService } from '../../services/local-storage.service';
import { SettingsService } from '../../services/settings.service';

type SpecialStackColor = 'purple' | 'black';

interface SpecialStack {
    color: SpecialStackColor;
    stack: Card[];
    topCard?: Card;
}

interface BonusShopRule {
    blackCost: number;
    rewards: BonusShopReward[];
}

interface BonusShopReward {
    kind: 'hex' | 'image';
    color?: Color;
    imageSrc?: string;
    number?: number;
    alt: string;
}

@Component({
    selector: 'app-game-wrapper',
    standalone: true,
    imports: [NgClass, NgFor, NgIf, NgStyle, FormsModule, CardComponent, HexagonComponent, PlayerColumnComponent],
    templateUrl: 'game-wrapper.component.html',
    styleUrls: ['./game-wrapper.component.css', '../../style.css'],
})
export class GameWrapperComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('gameLayout') gameLayout?: ElementRef<HTMLDivElement>;
    public playerCount?: number;
    private _playerCountKey = 'gamePlayerCount';
    private _playerNamesKey = 'gamePlayerNames';
    public leftPlayerSlots: boolean[] = [false, false, false];
    public rightPlayerSlots: boolean[] = [false, false, false];
    public rightSidebarPage: number = 1;
    public readonly playersPerSidebarPage: number = 3;
    public activePlayer: number = 1; // 1-based player number that's highlighted
    public playerNames: string[] = [];
    public editingPlayerIndex: number | null = null;
    public gameBankHexagons: { [key in Color]?: number } = {
        red: 4,
        blue: 4,
        white: 4,
        green: 4,
        purple: 4,
        black: 20,
    };
    public modalTokenBankHexagons: { [key in Color]?: number } = {
        red: 0,
        blue: 0,
        white: 0,
        green: 0,
        purple: 0,
    };
    public modalHandHexagons: { [key in Color]?: number } = {
        red: 0,
        blue: 0,
        white: 0,
        green: 0,
        purple: 0,
    };
    public modalDiscardHexagons: { [key in Color]?: number } = {
        red: 0,
        blue: 0,
        white: 0,
        green: 0,
        purple: 0,
    };
    public modalRollResultsSnapshot: string[] = [];
    public modalRemainingRollResults: string[] = [];
    public modalConsumedDiceIndexes: number[] = [];
    public showLuckyPurpleChoiceModal: boolean = false;
    public showBonusShopModal: boolean = false;
    public readonly bonusShopRules: BonusShopRule[] = [
        {
            blackCost: 1,
            rewards: [
                { kind: 'hex', color: 'dice', alt: 'Dice reward' }
            ]
        },
        {
            blackCost: 2,
            rewards: [
                { kind: 'hex', color: 'mix', alt: 'Mixed hex reward' },
                { kind: 'hex', color: 'dice', number: 2, alt: 'Dice reward with value 2' }
            ]
        },
        {
            blackCost: 3,
            rewards: [
                { kind: 'hex', color: 'purple', alt: 'Purple hex reward' },
                { kind: 'image', imageSrc: 'assets/hex/card_1_lvl.png', alt: 'Free level 1 card' }
            ]
        },
        {
            blackCost: 4,
            rewards: [
                { kind: 'hex', color: 'mix', number: 2, alt: 'Mixed hex reward with value 2' },
                { kind: 'image', imageSrc: 'assets/hex/extra_turn.png', alt: 'Extra turn reward' }
            ]
        },
        {
            blackCost: 5,
            rewards: [
                { kind: 'hex', color: 'purple', number: 2, alt: 'Purple hex reward with value 2' },
                { kind: 'image', imageSrc: 'assets/hex/card_2_lvl.png', alt: 'Free level 2 card' }
            ]
        },
        {
            blackCost: 6,
            rewards: [
                { kind: 'image', imageSrc: 'assets/hex/card_master.png', alt: 'Master card reward' }
            ]
        },
        {
            blackCost: 7,
            rewards: [
                { kind: 'image', imageSrc: 'assets/hex/card_3_lvl.png', alt: 'Free level 3 card' }
            ]
        },
        {
            blackCost: 8,
            rewards: [
                { kind: 'hex', color: 'purple', number: 4, alt: 'Purple hex reward with value 4' }
            ]
        },
        {
            blackCost: 9,
            rewards: [
                { kind: 'image', imageSrc: 'assets/hex/card_4_lvl.png', alt: 'Free level 4 card' }
            ]
        },
        {
            blackCost: 10,
            rewards: [
                { kind: 'image', imageSrc: 'assets/hex/card_grand_master.png', alt: 'Grand master card reward' }
            ]
        },
    ];
    public playerHexagons: { [playerNumber: number]: { [key in Color]?: number } } = {
        1: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 10 },
        2: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 10 },
        3: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 10 },
        4: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 10 },
        5: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 10 },
        6: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 10 },
    };
    public playerCardHexagons: { [playerNumber: number]: { [key in Color]?: number } } = {
        1: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 0 },
        2: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 0 },
        3: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 0 },
        4: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 0 },
        5: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 0 },
        6: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 0 },
    };
    public hexagonsPickedThisTurn: number = 0;
    public isFinishTurnUnlockedByDiceModal: boolean = false;
    public isWaitingForPostRoll2Token: boolean = false;
    public readonly maxHexagonsPerTurn: number = 2;
    private readonly _turnTrackedColors: Color[] = ['red', 'blue', 'white', 'green', 'purple', 'black'];
    private readonly _purchasePayColors: Color[] = ['red', 'green', 'white', 'blue', 'black'];
    private readonly _purchaseBonusColors: Color[] = ['red', 'green', 'white', 'blue', 'purple', 'black'];
    private _turnStartGameBankHexagons: { [key in Color]?: number } = {};
    private _turnStartPlayerHexagons: { [key in Color]?: number } = {};
    private _turnStartPlayerCardHexagons: { [key in Color]?: number } = {};
    private _lastClosedRollCount: number = 0;
    private _pendingPurchasedCardOrderNumbers: Set<number> = new Set<number>();
    private pickedTokensThisTurn: Color[] = [];
    public showDiceModal: boolean = false;
    public diceResults: string[] = [];
    public diceReels: string[][] = []; // Array of arrays for dice animation reels
    public isDiceAnimationEnabled: boolean = true;
    public hasTwoNothings: boolean = false;
    public hasThreeNothings: boolean = false;
    public hasFourNothings: boolean = false;
    public hasJokers: boolean = false;
    public jokerCount: number = 0;
    public rolledCrossesCount: number = 0;
    public rolledJokersCount: number = 0;
    public tokensToDiscard: number = 0;
    public luckyPurple: number = 0;
    public showTokensToDiscardBlock: boolean = false;
    public isLuckyPurpleEnabled: boolean = false;
    public selectedJokerExchanges: Color[] = []; // One color per joker
    public selectedCancelChoices: Array<{ type: 'dice' | 'token', value: string | Color, diceIndex?: number, tokenIndex?: number }> = [];
    public rows: Array<{
        level: number;
        stack: Card[];
        topCards: Card[];
        backUrl: string;
        specialStacks: SpecialStack[];
    }> = [];
    public printModeEnabled: boolean = true;
    private readonly _diceSides: string[] = [
        'dices-blue.png',
        'dices-green.png',
        'dices-joker.png',
        'dices-nothing.png',
        'dices-red.png',
        'dices-white.png',
    ];
    private _cardsSubscription?: Subscription;
    private _printModeSubscription?: Subscription;
    private _resizeRaf?: number;

    constructor(
        private _cardsStoreService: CardsStoreService,
        private _imageService: ImageService,
        private _interactionService: InteractionService,
        private _localStorageService: LocalStorageService,
        private _settingsService: SettingsService
    ) {}

    ngOnInit() {
        this._initPlayerNames();
        this._loadPlayerNames();
        this._loadPlayerCount();
        this._setBlackTokensByPlayerCount(this.playerCount);
        
        // Initialize player hexagons based on any cross or joker mode
        if (this._settingsService.isCheckToCrossModeEnabled() || 
            this._settingsService.isCheckToThreeCrossModeEnabled() ||
            this._settingsService.isCheckToFourCrossModeEnabled() ||
            this._settingsService.isCheck2toJokersModeEnabled() ||
            this._settingsService.isCheck2to3JokersModeEnabled() ||
            this._settingsService.isCheck2to4JokersModeEnabled()) {
            this._initPlayerHexagonsWithTestTokens();
        }

        this._captureTurnStartState();
        
        this._cardsSubscription = this._cardsStoreService.cards$.subscribe((cards) => {
            const preparedCards = this._assignColors(cards);
            this.rows = this._buildRows(preparedCards);
        });

        this._printModeSubscription = this._interactionService.printMode$.subscribe((printMode) => {
            this.printModeEnabled = printMode;
        });
    }

    ngAfterViewInit() {
        this._scheduleScaleUpdate();
    }

    ngOnDestroy() {
        this._cardsSubscription?.unsubscribe();
        this._printModeSubscription?.unsubscribe();
        if (this._resizeRaf) cancelAnimationFrame(this._resizeRaf);
    }

    @HostListener('window:resize')
    onWindowResize() {
        this._scheduleScaleUpdate();
    }

    public startRename(playerNumber: number): void {
        this.editingPlayerIndex = playerNumber;
    }

    public saveRename(playerNumber: number, name: string): void {
        this.playerNames[playerNumber - 1] = name;
        this._persistPlayerNames();
        this.editingPlayerIndex = null;
    }

    public cancelRename(): void {
        this.editingPlayerIndex = null;
    }

    public onHexagonClick(color: Color): void {
        // Check if hexagon is disabled
        if (this.isHexagonDisabled(color)) {
            return;
        }
        
        // Check if turn limit reached
        if (this.hexagonsPickedThisTurn >= this.maxHexagonsPerTurn) {
            console.log('Turn limit reached. Please finish your turn.');
            return;
        }
        
        const bankValue = this.gameBankHexagons[color];
        if (bankValue === undefined || bankValue <= 0) return;
        
        // Decrease bank value
        this.gameBankHexagons[color] = bankValue - 1;
        
        // Increase active player's hexagon value
        const playerHex = this.playerHexagons[this.activePlayer];
        if (playerHex) {
            playerHex[color] = (playerHex[color] ?? 0) + 1;
        }
        
        // Track picked token
        this.pickedTokensThisTurn.push(color);
        
        // Purple counts as 2 tokens
        if (color === 'purple') {
            this.hexagonsPickedThisTurn += 2;
        } else {
            this.hexagonsPickedThisTurn++;

            if (this.isWaitingForPostRoll2Token) {
                this.isWaitingForPostRoll2Token = false;
                this.isFinishTurnUnlockedByDiceModal = true;
            }
        }

        this._updateTokensByDiceState();
    }

    public isHexagonDisabled(color: Color): boolean {
        // Lock all bank tokens once the turn can be finished.
        if (this.canFinishTurn) return true;

        // Black tokens in bank are always locked.
        if (color === 'black') return true;

        // Roll 2 + token rule: after closing a 2-dice roll without a token,
        // only one non-purple token can be selected.
        if (this.isWaitingForPostRoll2Token) {
            if (color === 'purple') return true;
            return this.hexagonsPickedThisTurn >= 1;
        }

        // If no bank value, disable
        const bankValue = this.gameBankHexagons[color];
        if (bankValue === undefined || bankValue <= 0) return true;
        
        // If purple was picked, disable everything
        if (this.pickedTokensThisTurn.includes('purple')) return true;
        
        // If checking purple
        if (color === 'purple') {
            // Disable purple if any token was picked (because purple = 2 tokens)
            return this.hexagonsPickedThisTurn > 0;
        }
        
        // For regular tokens (red, blue, white, green)
        // Disable if 2 tokens already picked
        return this.hexagonsPickedThisTurn >= 2;
    }

    public onTokenBankModalClick(color: Color): void {
        if (this.isTokenBankModalDisabled(color)) {
            return;
        }

        if (color === 'purple') {
            this._handlePurpleTokenBankClick();
            return;
        }

        if (this._isBasicColor(color) && !this._consumeRollResultForBasicColor(color)) {
            return;
        }

        const bankValue = this.modalTokenBankHexagons[color] ?? 0;
        if (bankValue <= 0) return;

        this._animateTokenTransfer(color, 'bank', 'hand');

        this.modalTokenBankHexagons[color] = bankValue - 1;
        this.modalHandHexagons[color] = (this.modalHandHexagons[color] ?? 0) + 1;

        this._updateTokensByDiceState();
    }

    public onTokensInHandClick(color: Color): void {
        const handValue = this.modalHandHexagons[color] ?? 0;
        if (handValue <= 0) {
            return;
        }

        if (this.tokensToDiscard <= 0) {
            return;
        }

        this._animateTokenTransfer(color, 'hand', 'discard');

        this.modalHandHexagons[color] = handValue - 1;
        this.modalDiscardHexagons[color] = (this.modalDiscardHexagons[color] ?? 0) + 1;

        this._updateTokensByDiceState();
    }

    public isTokenBankModalDisabled(color: Color): boolean {
        const bankValue = this.modalTokenBankHexagons[color] ?? 0;
        if (bankValue <= 0) return true;

        // Basic colors are available only if their color was rolled,
        // unless at least one joker was rolled (then all basics are available).
        if (this._isBasicColor(color) && !this._isBasicColorEnabledByDice(color)) {
            return true;
        }

        if (color === 'purple' && !this.isLuckyPurpleEnabled) {
            return true;
        }

        return false;
    }

    private _isBasicColor(color: Color): boolean {
        return color === 'red' || color === 'blue' || color === 'white' || color === 'green';
    }

    private _isBasicColorEnabledByDice(color: Color): boolean {
        const hasJoker = this.modalRemainingRollResults.includes('dices-joker.png');
        if (hasJoker) {
            return true;
        }

        let requiredSide = '';
        switch (color) {
            case 'red':
                requiredSide = 'dices-red.png';
                break;
            case 'blue':
                requiredSide = 'dices-blue.png';
                break;
            case 'white':
                requiredSide = 'dices-white.png';
                break;
            case 'green':
                requiredSide = 'dices-green.png';
                break;
            default:
                return true;
        }

        return this.modalRemainingRollResults.includes(requiredSide);
    }

    private _consumeRollResultForBasicColor(color: Color): boolean {
        const colorSide = this._getDiceSideByBasicColor(color);
        if (!colorSide) {
            return false;
        }

        const colorIndex = this._findAvailableDiceIndexBySide(colorSide);
        if (colorIndex !== -1) {
            this._consumeDiceResult(colorSide, colorIndex);
            return true;
        }

        const jokerIndex = this._findAvailableDiceIndexBySide('dices-joker.png');
        if (jokerIndex !== -1) {
            this._consumeDiceResult('dices-joker.png', jokerIndex);
            return true;
        }

        return false;
    }

    private _getDiceSideByBasicColor(color: Color): string | null {
        switch (color) {
            case 'red':
                return 'dices-red.png';
            case 'blue':
                return 'dices-blue.png';
            case 'white':
                return 'dices-white.png';
            case 'green':
                return 'dices-green.png';
            default:
                return null;
        }
    }

    private _findAvailableDiceIndexBySide(side: string): number {
        return this.diceResults.findIndex((result, index) => {
            return result === side && !this.modalConsumedDiceIndexes.includes(index);
        });
    }

    private _consumeDiceResult(side: string, diceIndex: number): void {
        const remainingIndex = this.modalRemainingRollResults.indexOf(side);
        if (remainingIndex !== -1) {
            this.modalRemainingRollResults = [
                ...this.modalRemainingRollResults.slice(0, remainingIndex),
                ...this.modalRemainingRollResults.slice(remainingIndex + 1),
            ];
        }

        this.modalConsumedDiceIndexes = [...this.modalConsumedDiceIndexes, diceIndex];
    }

    private _handlePurpleTokenBankClick(): void {
        const maxSelectable = this.maxLuckyPurpleSelectable;
        if (maxSelectable <= 0) {
            return;
        }

        if (this.luckyPurple > 1 && maxSelectable > 1) {
            this.showLuckyPurpleChoiceModal = true;
            return;
        }

        this._applyLuckyPurpleSelection(1);
    }

    public get maxLuckyPurpleSelectable(): number {
        const purpleBankCount = this.modalTokenBankHexagons['purple'] ?? 0;
        return Math.min(this.luckyPurple, purpleBankCount);
    }

    public get luckyPurpleSelectionOptions(): number[] {
        const maxValue = this.maxLuckyPurpleSelectable;
        const options: number[] = [];
        for (let i = 1; i <= maxValue; i++) {
            options.push(i);
        }
        return options;
    }

    public confirmLuckyPurpleSelection(count: number): void {
        this.showLuckyPurpleChoiceModal = false;
        this._applyLuckyPurpleSelection(count);
    }

    public cancelLuckyPurpleSelection(): void {
        this.showLuckyPurpleChoiceModal = false;
    }

    private _applyLuckyPurpleSelection(count: number): void {
        const maxSelectable = this.maxLuckyPurpleSelectable;
        if (count < 1 || count > maxSelectable) {
            return;
        }

        // Purple bonus consumes (selected purple + 1) jokers from rolled results.
        const jokersToConsume = count + 1;
        if (!this._consumeJokers(jokersToConsume)) {
            return;
        }

        const purpleBankCount = this.modalTokenBankHexagons['purple'] ?? 0;
        if (purpleBankCount < count) {
            return;
        }

        for (let i = 0; i < count; i++) {
            this._animateTokenTransfer('purple', 'bank', 'hand', i * 90);
        }

        this.modalTokenBankHexagons['purple'] = purpleBankCount - count;
        this.modalHandHexagons['purple'] = (this.modalHandHexagons['purple'] ?? 0) + count;

        this._updateTokensByDiceState();
    }

    private _consumeJokers(count: number): boolean {
        const remainingJokers = this.modalRemainingRollResults.filter(result => result === 'dices-joker.png').length;
        if (remainingJokers < count) {
            return false;
        }

        for (let i = 0; i < count; i++) {
            const jokerIndex = this._findAvailableDiceIndexBySide('dices-joker.png');
            if (jokerIndex === -1) {
                return false;
            }
            this._consumeDiceResult('dices-joker.png', jokerIndex);
        }

        return true;
    }

    private _animateTokenTransfer(color: Color, fromRole: 'bank' | 'hand', toRole: 'hand' | 'discard', delayMs: number = 0): void {
        window.setTimeout(() => {
            const sourceSelector = `.tokens-by-dice-item[data-token-role="${fromRole}"][data-color="${color}"] .coin`;
            const targetSelector = `.tokens-by-dice-item[data-token-role="${toRole}"][data-color="${color}"] .coin`;
            const sourceCoin = document.querySelector(sourceSelector) as HTMLElement | null;
            const targetCoin = document.querySelector(targetSelector) as HTMLElement | null;

            if (!sourceCoin || !targetCoin) {
                return;
            }

            const sourceRect = sourceCoin.getBoundingClientRect();
            const targetRect = targetCoin.getBoundingClientRect();
            const flightNode = sourceCoin.cloneNode(true) as HTMLElement;
            const numberNode = flightNode.querySelector('.number-wrapper');
            if (numberNode) {
                numberNode.remove();
            }

            flightNode.classList.add('token-flight-clone');
            flightNode.style.left = `${sourceRect.left}px`;
            flightNode.style.top = `${sourceRect.top}px`;
            flightNode.style.width = `${sourceRect.width}px`;
            flightNode.style.height = `${sourceRect.height}px`;
            flightNode.style.transform = 'translate(0, 0) scale(1)';
            flightNode.style.opacity = '0.95';

            document.body.appendChild(flightNode);

            requestAnimationFrame(() => {
                const deltaX = targetRect.left - sourceRect.left;
                const deltaY = targetRect.top - sourceRect.top;
                flightNode.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.92)`;
                flightNode.style.opacity = '0';
            });

            window.setTimeout(() => {
                flightNode.remove();
            }, 760);
        }, delayMs);
    }

    public isTokenToDiscardModalDisabled(color: Color): boolean {
        const discardValue = this.modalDiscardHexagons[color] ?? 0;
        return this.tokensToDiscard === 0 || discardValue <= 0;
    }

    public isTokenInHandDisabled(color: Color): boolean {
        const handValue = this.modalHandHexagons[color] ?? 0;
        return handValue <= 0 || this.tokensToDiscard <= 0;
    }

    public get areAllTokenBankModalDisabled(): boolean {
        const colors: Color[] = ['red', 'blue', 'white', 'green', 'purple'];
        return colors.every((color) => this.isTokenBankModalDisabled(color));
    }

    public get areAllTokensToDiscardModalDisabled(): boolean {
        return this.tokensToDiscard === 0;
    }

    public finishTurn(): void {
        this._commitPendingPurchasedCards();

        // Reset turn counter and picked tokens
        this.hexagonsPickedThisTurn = 0;
        this.isFinishTurnUnlockedByDiceModal = false;
        this.isWaitingForPostRoll2Token = false;
        this._lastClosedRollCount = 0;
        this.pickedTokensThisTurn = [];

        this._updateTokensByDiceState();
        
        // Move to next player
        if (!this.playerCount) return;
        
        let nextPlayer = this.activePlayer + 1;
        if (nextPlayer > this.playerCount) {
            nextPlayer = 1;
        }
        
        this.activePlayer = nextPlayer;
        this._ensureActivePlayerPage();
        this._captureTurnStartState();
    }

    public cancelTokens(): void {
        // Restore bank and active player tokens to turn-start snapshot.
        const playerHex = this.playerHexagons[this.activePlayer];
        const playerCards = this.playerCardHexagons[this.activePlayer];
        if (!playerHex || !playerCards) return;

        for (const color of this._turnTrackedColors) {
            this.gameBankHexagons[color] = this._turnStartGameBankHexagons[color] ?? 0;
            playerHex[color] = this._turnStartPlayerHexagons[color] ?? 0;
            playerCards[color] = this._turnStartPlayerCardHexagons[color] ?? 0;
        }
        
        // Reset counters
        this.hexagonsPickedThisTurn = 0;
        this.isFinishTurnUnlockedByDiceModal = false;
        this.isWaitingForPostRoll2Token = false;
        this._lastClosedRollCount = 0;
        this._pendingPurchasedCardOrderNumbers.clear();
        this.pickedTokensThisTurn = [];

        this._updateTokensByDiceState();
    }

    public isCardSoldPending(card: Card | undefined): boolean {
        if (!card) return false;
        return this._pendingPurchasedCardOrderNumbers.has(card.orderNumber);
    }

    public onPurchaseCard(card: Card): void {
        if (!card || this.isCardPurchaseLockedThisTurn || this.isCardSoldPending(card)) {
            return;
        }

        const playerHex = this.playerHexagons[this.activePlayer];
        const playerCards = this.playerCardHexagons[this.activePlayer];
        if (!playerHex || !playerCards) return;

        const paymentPlan = this._buildCardPaymentPlan(card, playerHex);
        if (!paymentPlan.isAffordable) {
            return;
        }

        for (const color of this._purchasePayColors) {
            const spendValue = paymentPlan.spend[color] ?? 0;
            if (spendValue > 0) {
                playerHex[color] = Math.max((playerHex[color] ?? 0) - spendValue, 0);
                this.gameBankHexagons[color] = (this.gameBankHexagons[color] ?? 0) + spendValue;
            }
        }

        const spentPurple = paymentPlan.spend['purple'] ?? 0;
        if (spentPurple > 0) {
            playerHex['purple'] = Math.max((playerHex['purple'] ?? 0) - spentPurple, 0);
            this.gameBankHexagons['purple'] = (this.gameBankHexagons['purple'] ?? 0) + spentPurple;
        }

        for (const color of this._purchaseBonusColors) {
            const bonusValue = card.get?.[color] ?? 0;
            if (bonusValue > 0) {
                playerCards[color] = (playerCards[color] ?? 0) + bonusValue;
            }
        }

        // Each purchased card grants one additional black token.
        playerHex['black'] = (playerHex['black'] ?? 0) + 1;
        const blackBankValue = this.gameBankHexagons['black'] ?? 0;
        this.gameBankHexagons['black'] = Math.max(blackBankValue - 1, 0);

        this._pendingPurchasedCardOrderNumbers.add(card.orderNumber);
        this.isFinishTurnUnlockedByDiceModal = true;
        this._updateTokensByDiceState();
    }

    public get canFinishTurn(): boolean {
        return this.hexagonsPickedThisTurn >= this.maxHexagonsPerTurn || this.isFinishTurnUnlockedByDiceModal;
    }

    public get canCancelTokens(): boolean {
        return this._hasTurnStateChanges();
    }

    public get canUseBonusMarket(): boolean {
        const activePlayerHexagons = this.playerHexagons[this.activePlayer];
        const blackTokens = activePlayerHexagons?.['black'] ?? 0;
        return blackTokens >= 1;
    }

    public get activePlayerTokensForPurchase(): { [key in Color]?: number } {
        return this.playerHexagons[this.activePlayer] ?? {};
    }

    public get totalSidebarPages(): number {
        const count = this.playerCount ?? 0;
        return Math.max(1, Math.ceil(count / this.playersPerSidebarPage));
    }

    public get sidebarPageNumbers(): number[] {
        return Array.from({ length: this.totalSidebarPages }, (_, index) => index + 1);
    }

    public get rightSidebarPlayerNumbers(): number[] {
        const count = this.playerCount ?? 0;
        if (count <= 0) return [];

        const allPlayers = Array.from({ length: count }, (_, index) => index + 1);
        const start = (this.rightSidebarPage - 1) * this.playersPerSidebarPage;
        const end = start + this.playersPerSidebarPage;
        return allPlayers.slice(start, end);
    }

    public get rightSidebarSlots(): boolean[] {
        const slots = [false, false, false];
        for (let i = 0; i < this.rightSidebarPlayerNumbers.length; i++) {
            slots[i] = true;
        }
        return slots;
    }

    public get bonusShopRulesLeft(): BonusShopRule[] {
        return this.bonusShopRules.slice(0, 5);
    }

    public get bonusShopRulesRight(): BonusShopRule[] {
        return this.bonusShopRules.slice(5, 10);
    }

    public setRightSidebarPage(page: number): void {
        if (!Number.isInteger(page)) return;
        this.rightSidebarPage = Math.min(this.totalSidebarPages, Math.max(1, page));
    }

    public get isCardPurchaseLockedThisTurn(): boolean {
        return this.hexagonsPickedThisTurn > 0
            || this.showDiceModal
            || this.diceResults.length > 0
            || this.isFinishTurnUnlockedByDiceModal
            || this.isWaitingForPostRoll2Token
            || this._lastClosedRollCount > 0
            || this._pendingPurchasedCardOrderNumbers.size > 0;
    }

    public get diceCount(): number {
        // If purple was picked, no dice
        if (this.pickedTokensThisTurn.includes('purple')) return 0;
        
        // Count only regular tokens (not purple)
        const regularTokensCount = this.pickedTokensThisTurn.filter(
            color => color !== 'purple'
        ).length;
        
        // 0 tokens = 4 dice, 1 token = 2 dice, 2 tokens = 0 dice
        if (regularTokensCount === 0) return 4;
        if (regularTokensCount === 1) return 2;
        return 0;
    }

    public get isDiceRollDisabled(): boolean {
        // Disable if purple was picked
        if (this.pickedTokensThisTurn.includes('purple')) return true;
        
        // Disable if 2 or more regular tokens were picked
        const regularTokensCount = this.pickedTokensThisTurn.filter(
            color => color !== 'purple'
        ).length;
        return regularTokensCount >= 2;
    }

    public isRollButtonDisabled(rollCount: number): boolean {
        if (this.isWaitingForPostRoll2Token) {
            return true;
        }

        if (this.canFinishTurn) {
            return true;
        }

        if (this.isDiceRollDisabled) {
            return true;
        }

        const regularTokensCount = this.pickedTokensThisTurn.filter(
            color => color !== 'purple'
        ).length;

        if (rollCount === 4) {
            return regularTokensCount > 0;
        }

        if (rollCount === 2) {
            return regularTokensCount >= 2;
        }

        return false;
    }

    public openBonusMarket(): void {
        if (!this.canUseBonusMarket) {
            return;
        }

        this.showBonusShopModal = true;
    }

    public closeBonusShopModal(): void {
        this.showBonusShopModal = false;
    }

    public rollDice(count: number): void {
        // Reset modal draft roll state before generating a new roll to avoid stale calculations.
        this.modalRollResultsSnapshot = [];
        this.modalRemainingRollResults = [];
        this.modalConsumedDiceIndexes = [];

        const rollsCount = Math.max(0, Math.floor(count));
        const results: string[] = [];
        
        const isCheckToCrossMode = this._settingsService.isCheckToCrossModeEnabled();
        const isCheckToThreeCrossMode = this._settingsService.isCheckToThreeCrossModeEnabled();
        const isCheckToFourCrossMode = this._settingsService.isCheckToFourCrossModeEnabled();
        const isCheck2toJokersMode = this._settingsService.isCheck2toJokersModeEnabled();
        const isCheck2to3JokersMode = this._settingsService.isCheck2to3JokersModeEnabled();
        const isCheck2to4JokersMode = this._settingsService.isCheck2to4JokersModeEnabled();

        for (let i = 0; i < rollsCount; i++) {
            // Force results based on active mode
            let finalResult: string;
            
            // Cross modes
            if (isCheckToFourCrossMode && i < 4) {
                // Four cross mode: first 4 dice are crosses
                finalResult = 'dices-nothing.png';
            } else if (isCheckToThreeCrossMode && i < 3) {
                // Three cross mode: first 3 dice are crosses
                finalResult = 'dices-nothing.png';
            } else if (isCheckToCrossMode && i < 2) {
                // Two cross mode: first 2 dice are crosses
                finalResult = 'dices-nothing.png';
            }
            // Joker modes
            else if (isCheck2to4JokersMode && i < 4) {
                // Four jokers mode: first 4 dice are jokers
                finalResult = 'dices-joker.png';
            } else if (isCheck2to3JokersMode && i < 3) {
                // Three jokers mode: first 3 dice are jokers
                finalResult = 'dices-joker.png';
            } else if (isCheck2toJokersMode && i < 2) {
                // Two jokers mode: first 2 dice are jokers
                finalResult = 'dices-joker.png';
            }
            // Random roll
            else {
                const finalIndex = Math.floor(Math.random() * this._diceSides.length);
                finalResult = this._diceSides[finalIndex];
            }
            
            results.push(finalResult);
        }

        const reels = this._buildReelsFromResults(results);
        this._applyDiceRollResults(results, reels);
    }

    public onMockRollScenario(type: 'joker' | 'cross', count: number): void {
        const clampedCount = Math.min(4, Math.max(1, Math.floor(count)));
        const fixedFill = ['dices-green.png', 'dices-white.png', 'dices-red.png', 'dices-blue.png'];
        const primarySide = type === 'joker' ? 'dices-joker.png' : 'dices-nothing.png';
        const results: string[] = [];

        for (let i = 0; i < 4; i++) {
            if (i < clampedCount) {
                results.push(primarySide);
            } else {
                results.push(fixedFill[(i - clampedCount) % fixedFill.length]);
            }
        }

        const reels = this._buildReelsFromResults(results);
        this._applyDiceRollResults(results, reels);
    }

    private _buildReelsFromResults(results: string[]): string[][] {
        const reels: string[][] = [];
        const reelLength = 15;

        for (const finalResult of results) {
            const reel: string[] = [];
            for (let j = 0; j < reelLength - 1; j++) {
                const randomIndex = Math.floor(Math.random() * this._diceSides.length);
                reel.push(this._diceSides[randomIndex]);
            }
            reel.push(finalResult);
            reels.push(reel);
        }

        return reels;
    }

    private _applyDiceRollResults(results: string[], reels: string[][]): void {
        this.diceResults = [...results];
        this.diceReels = reels.map((reel) => [...reel]);

        this._updateTokensByDiceState();

        const nothingCount = this.diceResults.filter(r => r === 'dices-nothing.png').length;
        this.hasTwoNothings = nothingCount === 2;
        this.hasThreeNothings = nothingCount === 3;
        this.hasFourNothings = nothingCount >= 4;
        this.selectedCancelChoices = [];

        const jokerCount = this.diceResults.filter(r => r === 'dices-joker.png').length;
        this.hasJokers = jokerCount > 0;
        this.jokerCount = jokerCount;
        this.selectedJokerExchanges = [];
        this._updateTokensByDiceState();

        this._autoSelectIfNecessary();

        this._syncModalTokenStateFromGame();
        this._updateTokensByDiceState();

        this.showDiceModal = true;
    }

    private _syncModalTokenStateFromGame(): void {
        const colors: Color[] = ['red', 'blue', 'white', 'green', 'purple'];
        const playerHex = this.playerHexagons[this.activePlayer];

        for (const color of colors) {
            this.modalTokenBankHexagons[color] = this.gameBankHexagons[color] ?? 0;
            this.modalHandHexagons[color] = playerHex?.[color] ?? 0;
            this.modalDiscardHexagons[color] = 0;
        }

        // Keep an immutable copy of rolled results and a separate mutable remaining pool.
        this.modalRollResultsSnapshot = this.diceResults.map((result) => `${result}`);
        this.modalRemainingRollResults = [...this.modalRollResultsSnapshot];
        this.modalConsumedDiceIndexes = [];
        this.showLuckyPurpleChoiceModal = false;
    }

    private _updateTokensByDiceState(): void {
        const hasModalSnapshot = this.modalRollResultsSnapshot.length > 0;
        const effectiveResults = hasModalSnapshot ? this.modalRemainingRollResults : this.diceResults;

        this.rolledCrossesCount = effectiveResults.filter(result => result === 'dices-nothing.png').length;
        this.rolledJokersCount = effectiveResults.filter(result => result === 'dices-joker.png').length;
        const purpleBankCount = this.modalTokenBankHexagons['purple'] ?? this.gameBankHexagons['purple'] ?? 0;
        const rawLuckyPurple = Math.max(this.rolledJokersCount - 1, 0);
        const selectedDiscardCount = this._getSelectedDiscardCount();
        this.luckyPurple = Math.min(rawLuckyPurple, purpleBankCount);
        this.isLuckyPurpleEnabled = this.luckyPurple > 0;

        const rawRequiredDiscardCount = Math.max(this.rolledCrossesCount - 1, 0);
        const totalTokensInHand = this._getTotalTokensInHandCount();
        const allBankDisabled = this.areAllTokenBankModalDisabled;
        const maxDiscardPossibleWithCurrentState = totalTokensInHand + selectedDiscardCount;
        const requiredDiscardCount = allBankDisabled
            ? Math.min(rawRequiredDiscardCount, maxDiscardPossibleWithCurrentState)
            : rawRequiredDiscardCount;
        this.tokensToDiscard = Math.max(requiredDiscardCount - selectedDiscardCount, 0);

        const isCrossDiscardScenario = this.rolledCrossesCount >= 2 && this.rolledCrossesCount <= 4;
        const allHandDisabled = totalTokensInHand <= 0 || this.tokensToDiscard <= 0;
        const hasAnyDiscardedTokens = selectedDiscardCount > 0;
        this.showTokensToDiscardBlock = isCrossDiscardScenario && (!(allHandDisabled && allBankDisabled) || hasAnyDiscardedTokens);
    }

    private _getSelectedDiscardCount(): number {
        return ['red', 'blue', 'white', 'green', 'purple'].reduce((total, color) => {
            return total + (this.modalDiscardHexagons[color as Color] ?? 0);
        }, 0);
    }

    private _getTotalTokensInHandCount(): number {
        return ['red', 'blue', 'white', 'green', 'purple'].reduce((total, color) => {
            return total + (this.modalHandHexagons[color as Color] ?? 0);
        }, 0);
    }

    private _autoSelectIfNecessary(): void {
        // Determine required selections based on cross mode
        let requiredSelections = 0;
        
        if (this.hasTwoNothings) {
            requiredSelections = 1;
        } else if (this.hasThreeNothings) {
            requiredSelections = this.activePlayerHasTokens ? 2 : 1;
        } else if (this.hasFourNothings) {
            requiredSelections = Math.min(3, this.activePlayerTokens.length);
        } else {
            return; // No crosses, no need to select
        }
        
        // Calculate available elements
        const availableDice = this.nonNothingDiceResults;
        const availableTokens = this.activePlayerTokens;
        const totalAvailable = availableDice.length + availableTokens.length;
        
        // Auto-select if required equals available
        if (requiredSelections === totalAvailable) {
            // Select all dice
            for (const dice of availableDice) {
                this.selectedCancelChoices.push({
                    type: 'dice',
                    value: dice.value,
                    diceIndex: dice.index
                });
            }
            
            // Select all tokens
            for (const token of availableTokens) {
                this.selectedCancelChoices.push({
                    type: 'token',
                    value: token.color,
                    tokenIndex: token.index
                });
            }
        }
    }

    public get nonNothingDiceResults(): Array<{value: string, index: number}> {
        return this.diceResults
            .map((value, index) => ({ value, index }))
            .filter(r => r.value !== 'dices-nothing.png');
    }

    public get activePlayerTokens(): Array<{color: Color, index: number}> {
        const playerHex = this.playerHexagons[this.activePlayer];
        if (!playerHex) return [];
        
        const tokens: Array<{color: Color, index: number}> = [];
        const colors: Color[] = ['red', 'blue', 'white', 'green', 'purple'];
        
        for (const color of colors) {
            const count = playerHex[color] ?? 0;
            // Expand tokens: if count = 3, add 3 separate entries
            for (let i = 0; i < count; i++) {
                tokens.push({ color, index: i });
            }
        }
        
        return tokens;
    }

    public get activePlayerHasTokens(): boolean {
        return this.activePlayerTokens.length > 0;
    }

    public get requiredSelections(): number {
        if (this.hasTwoNothings) {
            return 1;
        } else if (this.hasThreeNothings) {
            return this.activePlayerHasTokens ? 2 : 1;
        } else if (this.hasFourNothings) {
            return Math.min(3, this.activePlayerTokens.length);
        }
        return 0;
    }

    public get totalAvailableElements(): number {
        return this.nonNothingDiceResults.length + this.activePlayerTokens.length;
    }

    public get isAutoSelected(): boolean {
        return this.requiredSelections === this.totalAvailableElements && this.selectedCancelChoices.length > 0;
    }

    public onCancelDice(diceResult: string, diceIndex: number): void {
        const existingIndex = this.selectedCancelChoices.findIndex(
            choice => choice.type === 'dice' && choice.diceIndex === diceIndex
        );
        
        if (existingIndex !== -1) {
            // Remove if already selected
            this.selectedCancelChoices.splice(existingIndex, 1);
        } else {
            // Add new selection
            let maxSelections = 1;
            if (this.hasFourNothings) {
                maxSelections = 3;
            } else if (this.hasThreeNothings) {
                maxSelections = this.activePlayerHasTokens ? 2 : 1;
            }
            if (this.selectedCancelChoices.length < maxSelections) {
                this.selectedCancelChoices.push({ type: 'dice', value: diceResult, diceIndex });
            }
        }

        this._updateTokensByDiceState();
    }

    public onCancelToken(color: Color, index: number): void {
        const existingIndex = this.selectedCancelChoices.findIndex(
            choice => choice.type === 'token' && choice.value === color && choice.tokenIndex === index
        );
        
        if (existingIndex !== -1) {
            // Remove if already selected
            this.selectedCancelChoices.splice(existingIndex, 1);
        } else {
            // Add new selection
            let maxSelections = 1;
            if (this.hasFourNothings) {
                maxSelections = 3;
            } else if (this.hasThreeNothings) {
                maxSelections = this.activePlayerHasTokens ? 2 : 1;
            }
            if (this.selectedCancelChoices.length < maxSelections) {
                this.selectedCancelChoices.push({ type: 'token', value: color, tokenIndex: index });
            }
        }

        this._updateTokensByDiceState();
    }

    public isDiceDisabled(index: number): boolean {
        const isDisabledByCancelSelection = this.selectedCancelChoices.some(
            choice => choice.type === 'dice' && choice.diceIndex === index
        );

        return isDisabledByCancelSelection || this.modalConsumedDiceIndexes.includes(index);
    }

    public isDiceSelected(index: number): boolean {
        return this.selectedCancelChoices.some(
            choice => choice.type === 'dice' && choice.diceIndex === index
        );
    }

    public isTokenSelected(color: Color, index: number): boolean {
        return this.selectedCancelChoices.some(
            choice => choice.type === 'token' && choice.value === color && choice.tokenIndex === index
        );
    }

    /**
     * Get available tokens for joker exchange with remaining counts (including purple option)
     */
    public get availableJokerTokens(): Array<{color: Color, remainingCount: number}> {
        const basicColors: Color[] = ['green', 'white', 'blue', 'red'];
        const tokens: Array<{color: Color, remainingCount: number}> = [];
        
        // Count non-joker dice by color
        const nonJokerDiceCounts: Record<string, number> = {
            green: 0,
            white: 0,
            blue: 0,
            red: 0
        };
        
        for (const diceResult of this.diceResults) {
            if (diceResult === 'dices-blue.png') nonJokerDiceCounts['blue']++;
            else if (diceResult === 'dices-green.png') nonJokerDiceCounts['green']++;
            else if (diceResult === 'dices-red.png') nonJokerDiceCounts['red']++;
            else if (diceResult === 'dices-white.png') nonJokerDiceCounts['white']++;
            // Skip jokers and crosses
        }
        
        // Add basic colors (green, white, blue, red)
        for (const color of basicColors) {
            const bankCount = this.gameBankHexagons[color] ?? 0;
            const diceCount = nonJokerDiceCounts[color] ?? 0;
            // Count how many times this color was selected for joker exchange
            const selectedCount = this.selectedJokerExchanges.filter(c => c === color).length;
            const remainingCount = bankCount - diceCount - selectedCount;
            
            // Show all 4 colors always
            tokens.push({ color, remainingCount });
        }
        
        // Add purple option: show bank value minus selected purple count
        if (this.jokerCount > 1) {
            const purpleBankCount = this.gameBankHexagons['purple'] ?? 0;
            const purpleSelectedCount = this.selectedJokerExchanges.filter(c => c === 'purple').length;
            const purpleRemainingCount = purpleBankCount - purpleSelectedCount;
            
            tokens.push({ color: 'purple', remainingCount: purpleRemainingCount });
        }
        
        return tokens;
    }

    /**
     * Check if purple option is currently selected
     */
    public get isPurpleSelected(): boolean {
        return this.selectedJokerExchanges.includes('purple');
    }

    /**
     * Handle joker token click with purple/basic colors mutual exclusion
     */
    public onJokerTokenClick(color: Color): void {
        // Find remaining count for this color
        const token = this.availableJokerTokens.find(t => t.color === color);
        if (!token || token.remainingCount === 0) return;
        
        if (color === 'purple') {
            // Check if there are enough purple tokens in bank
            const purpleNeeded = this.jokerCount - 1;
            const purpleBankCount = this.gameBankHexagons['purple'] ?? 0;
            if (purpleBankCount < purpleNeeded) {
                // Not enough purple in bank
                return;
            }
            
            // Selecting purple: clear all selections and add (jokerCount - 1) purple tokens
            this.selectedJokerExchanges = [];
            for (let i = 0; i < purpleNeeded; i++) {
                this.selectedJokerExchanges.push('purple');
            }
        } else {
            // Selecting basic color: check if purple is already selected
            if (this.isPurpleSelected) {
                // Cannot select basic colors when purple is selected
                return;
            }
            
            // Check if we've already selected enough jokers
            if (this.selectedJokerExchanges.length >= this.jokerCount) return;
            
            // Add basic color selection
            this.selectedJokerExchanges.push(color);
        }

        this._updateTokensByDiceState();
    }

    /**
     * Check if all jokers have been exchanged for tokens
     */
    public get isJokerExchangeComplete(): boolean {
        if (!this.hasJokers) return true;
        
        // For purple: need (jokerCount - 1) selections
        // For basic colors: need jokerCount selections
        const requiredCount = this.isPurpleSelected ? this.jokerCount - 1 : this.jokerCount;
        return this.selectedJokerExchanges.length === requiredCount;
    }

    /**
     * Get count of exchanged jokers
     */
    public get exchangedJokersCount(): number {
        return this.selectedJokerExchanges.length;
    }

    /**
     * Reset joker selections to initial state
     */
    public resetJokerSelection(): void {
        this.selectedJokerExchanges = [];
        this._updateTokensByDiceState();
    }

    public get canCloseDiceModal(): boolean {
        if (this.areAllTokenBankModalDisabled) {
            if (!this.showTokensToDiscardBlock) {
                return true;
            }

            return this.areAllTokensToDiscardModalDisabled;
        }

        // First, check if all jokers have been exchanged
        if (!this.isJokerExchangeComplete) return false;
        
        if (!this.hasTwoNothings && !this.hasThreeNothings && !this.hasFourNothings) return true;
        
        if (this.hasTwoNothings) {
            // Two crosses: always need exactly 1 selection
            return this.selectedCancelChoices.length === 1;
        }
        
        if (this.hasThreeNothings) {
            // Three crosses: depends on whether player has tokens
            if (!this.activePlayerHasTokens) {
                // No tokens: need exactly 1 dice selection
                return this.selectedCancelChoices.length === 1;
            } else {
                // Has tokens: need exactly 2 selections
                return this.selectedCancelChoices.length === 2;
            }
        }
        
        if (this.hasFourNothings) {
            // Four crosses: need exactly 3 token selections, or all tokens if player has <= 3
            const requiredSelections = Math.min(3, this.activePlayerTokens.length);
            return this.selectedCancelChoices.length === requiredSelections;
        }
        
        return false;
    }

    public reRoll() {
        this.rollDice(4);
    }

    public closeDiceModal(): void {
        if (!this.canCloseDiceModal) return;

        const rolledDiceCount = this.modalRollResultsSnapshot.length || this.diceResults.length;
        const regularPickedTokensCount = this.pickedTokensThisTurn.filter((color) => color !== 'purple').length;

        const colors: Color[] = ['red', 'blue', 'white', 'green', 'purple'];
        const playerHex = this.playerHexagons[this.activePlayer];
        if (playerHex) {
            for (const color of colors) {
                const bankValue = this.modalTokenBankHexagons[color] ?? 0;
                const discardedValue = this.modalDiscardHexagons[color] ?? 0;
                this.gameBankHexagons[color] = bankValue + discardedValue;
                playerHex[color] = this.modalHandHexagons[color] ?? 0;
            }
        }

        this._lastClosedRollCount = rolledDiceCount;

        if (rolledDiceCount === 2) {
            const hasRegularTokenForRoll2Rule = regularPickedTokensCount >= 1;
            this.isFinishTurnUnlockedByDiceModal = hasRegularTokenForRoll2Rule;
            this.isWaitingForPostRoll2Token = !hasRegularTokenForRoll2Rule;
        } else {
            this.isFinishTurnUnlockedByDiceModal = true;
            this.isWaitingForPostRoll2Token = false;
        }
        
        // Apply joker exchanges
        if (this.hasJokers && this.selectedJokerExchanges.length > 0) {
            const playerHex = this.playerHexagons[this.activePlayer];
            if (playerHex) {
                for (const color of this.selectedJokerExchanges) {
                    // Add to player bank
                    playerHex[color] = (playerHex[color] ?? 0) + 1;
                    
                    // Subtract from game bank
                    const bankValue = this.gameBankHexagons[color];
                    if (bankValue && bankValue > 0) {
                        this.gameBankHexagons[color] = bankValue - 1;
                    }
                }
            }
        }
        
        // Apply cancel choices if crosses rolled
        if ((this.hasTwoNothings || this.hasThreeNothings || this.hasFourNothings) && this.selectedCancelChoices.length > 0) {
            for (const choice of this.selectedCancelChoices) {
                if (choice.type === 'token') {
                    const color = choice.value as Color;
                    const playerHex = this.playerHexagons[this.activePlayer];
                    if (playerHex && playerHex[color] && playerHex[color]! > 0) {
                        playerHex[color] = playerHex[color]! - 1;
                    }
                }
                // If dice was selected, we don't need to do anything - it just won't count
            }
        }
        
        this.showDiceModal = false;
        this.diceResults = [];
        this.diceReels = [];
        this.hasTwoNothings = false;
        this.hasThreeNothings = false;
        this.hasFourNothings = false;
        this.hasJokers = false;
        this.jokerCount = 0;
        this.selectedJokerExchanges = [];
        this.selectedCancelChoices = [];
        this.modalRollResultsSnapshot = [];
        this.modalRemainingRollResults = [];
        this.modalConsumedDiceIndexes = [];
        this.showLuckyPurpleChoiceModal = false;
        this.modalDiscardHexagons = { red: 0, blue: 0, white: 0, green: 0, purple: 0 };
        this._updateTokensByDiceState();
    }

    public toggleDiceAnimation(): void {
        this.isDiceAnimationEnabled = !this.isDiceAnimationEnabled;
    }

    private _scheduleScaleUpdate() {
        if (this._resizeRaf) cancelAnimationFrame(this._resizeRaf);
        this._resizeRaf = requestAnimationFrame(() => {
            this._updateScale();
            requestAnimationFrame(() => this._updateScale());
        });
        setTimeout(() => this._updateScale(), 0);
    }

    private _updateScale() {
        if (!this.gameLayout?.nativeElement) return;
        const layout = this.gameLayout.nativeElement;
        layout.style.setProperty('--game-scale', '1');
        const width = layout.scrollWidth || layout.offsetWidth;
        const height = layout.scrollHeight || layout.offsetHeight;
        if (!width || !height) return;
        const horizontalPadding = 32;
        const verticalPadding = 32;
        const availableWidth = Math.max(0, window.innerWidth - horizontalPadding);
        const availableHeight = Math.max(0, window.innerHeight - verticalPadding);
        const scale = Math.min(1, availableWidth / width, availableHeight / height);
        layout.style.setProperty('--game-scale', scale.toFixed(3));
    }

    private _loadPlayerCount() {
        const stored = this._localStorageService.getItem(this._playerCountKey);
        if (!stored) {
            this._setBlackTokensByPlayerCount(undefined);
            return;
        }
        const parsed = Number(stored);
        if (Number.isInteger(parsed) && parsed >= 2 && parsed <= 6) {
            this.playerCount = parsed;
            this._updatePlayerSlots();
            this._setBlackTokensByPlayerCount(parsed);
            this._ensureActivePlayerPage();
        }
    }

    public selectPlayerCount(count: number) {
        if (count < 2 || count > 6) return;
        this.playerCount = count;
        this._localStorageService.setItem(this._playerCountKey, count.toString());
        this._updatePlayerSlots();
        this._setBlackTokensByPlayerCount(count);
        this._ensureActivePlayerPage();
        this._captureTurnStartState();
        this._scheduleScaleUpdate();
    }

    /** Public method to update left/right slots based on a provided count (2-6). */
    public updateSlots(count: number) {
        if (!Number.isInteger(count) || count < 2 || count > 6) return;
        this.playerCount = count;
        this._localStorageService.setItem(this._playerCountKey, count.toString());
        this._updatePlayerSlots();
        this._setBlackTokensByPlayerCount(count);
        this._ensureActivePlayerPage();
        this._captureTurnStartState();
        this._scheduleScaleUpdate();
    }

    private _setBlackTokensByPlayerCount(count: number | undefined): void {
        this.gameBankHexagons['black'] = this._getBlackTokensByPlayerCount(count);
    }

    private _getBlackTokensByPlayerCount(count: number | undefined): number {
        if (count === 3) {
            return 30;
        }

        if (count && count >= 4) {
            return 40;
        }

        return 20;
    }

    /** Set which player (1..6) is active/highlighted. */
    public setActivePlayer(playerNumber: number) {
        if (!Number.isInteger(playerNumber) || playerNumber < 1 || playerNumber > 6) return;
        this.activePlayer = playerNumber;
        this._ensureActivePlayerPage();
        this._captureTurnStartState();
    }

    private _ensureActivePlayerPage(): void {
        this.rightSidebarPage = Math.max(1, Math.ceil(this.activePlayer / this.playersPerSidebarPage));
        this.rightSidebarPage = Math.min(this.rightSidebarPage, this.totalSidebarPages);
    }

    private _buildCardPaymentPlan(card: Card, playerHex: { [key in Color]?: number }): { isAffordable: boolean; spend: { [key in Color]?: number } } {
        const spend: { [key in Color]?: number } = {};

        for (const [key, value] of Object.entries(card.pay ?? {})) {
            if ((value ?? 0) > 0 && !this._turnTrackedColors.includes(key as Color)) {
                return { isAffordable: false, spend };
            }
        }

        let purpleNeeded = card.pay?.['purple'] ?? 0;

        for (const color of this._purchasePayColors) {
            const required = card.pay?.[color] ?? 0;
            const available = playerHex[color] ?? 0;
            const directSpend = Math.min(required, available);

            if (directSpend > 0) {
                spend[color] = directSpend;
            }

            purpleNeeded += Math.max(required - available, 0);
        }

        const availablePurple = playerHex['purple'] ?? 0;
        if (availablePurple < purpleNeeded) {
            return { isAffordable: false, spend };
        }

        if (purpleNeeded > 0) {
            spend['purple'] = purpleNeeded;
        }

        return { isAffordable: true, spend };
    }

    private _commitPendingPurchasedCards(): void {
        if (this._pendingPurchasedCardOrderNumbers.size === 0) {
            return;
        }

        const cardsPerRow = this._getCardsPerRow();

        for (const row of this.rows) {
            row.stack = row.stack.filter((card) => !this._pendingPurchasedCardOrderNumbers.has(card.orderNumber));
            row.topCards = row.stack.slice(0, cardsPerRow);

            for (const specialStack of row.specialStacks) {
                specialStack.stack = specialStack.stack.filter((card) => !this._pendingPurchasedCardOrderNumbers.has(card.orderNumber));
                specialStack.topCard = specialStack.stack[0];
            }
        }

        this._pendingPurchasedCardOrderNumbers.clear();
    }

    private _captureTurnStartState(): void {
        const playerHex = this.playerHexagons[this.activePlayer];
        const playerCards = this.playerCardHexagons[this.activePlayer];
        if (!playerHex || !playerCards) return;

        for (const color of this._turnTrackedColors) {
            this._turnStartGameBankHexagons[color] = this.gameBankHexagons[color] ?? 0;
            this._turnStartPlayerHexagons[color] = playerHex[color] ?? 0;
            this._turnStartPlayerCardHexagons[color] = playerCards[color] ?? 0;
        }
    }

    private _hasTurnStateChanges(): boolean {
        const playerHex = this.playerHexagons[this.activePlayer];
        const playerCards = this.playerCardHexagons[this.activePlayer];
        if (!playerHex || !playerCards) return false;

        for (const color of this._turnTrackedColors) {
            const currentBankValue = this.gameBankHexagons[color] ?? 0;
            const currentPlayerValue = playerHex[color] ?? 0;
            const currentPlayerCardValue = playerCards[color] ?? 0;
            const startBankValue = this._turnStartGameBankHexagons[color] ?? 0;
            const startPlayerValue = this._turnStartPlayerHexagons[color] ?? 0;
            const startPlayerCardValue = this._turnStartPlayerCardHexagons[color] ?? 0;

            if (currentBankValue !== startBankValue
                || currentPlayerValue !== startPlayerValue
                || currentPlayerCardValue !== startPlayerCardValue) {
                return true;
            }
        }

        return false;
    }

    private _updatePlayerSlots() {
        const count = this.playerCount ?? 0;
        const empty = [false, false, false];
        const left = [...empty];
        const right = [...empty];

        if (count >= 2) {
            left[0] = true;
            right[0] = true;
        }
        if (count === 3) {
            left[2] = true;
        }
        if (count === 4) {
            left[1] = true;
            right[1] = true;
        }
        if (count === 5) {
            left[1] = true;
            left[2] = true;
            right[1] = true;
        }
        if (count >= 6) {
            left[1] = true;
            left[2] = true;
            right[1] = true;
            right[2] = true;
        }

        this.leftPlayerSlots = left;
        this.rightPlayerSlots = right;
    }

    private _initPlayerNames() {
        if (this.playerNames.length === 6) return;
        this.playerNames = Array.from({ length: 6 }, (_, i) => `Player ${i + 1}`);
    }

    private _loadPlayerNames() {
        const stored = this._localStorageService.getItem(this._playerNamesKey);
        if (!stored) return;
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length === 6) {
                this.playerNames = parsed.map((name, index) => {
                    if (typeof name === 'string' && name.trim().length > 0) {
                        return name;
                    }
                    return `Player ${index + 1}`;
                });
            }
        } catch {
            return;
        }
    }
    private _initPlayerHexagonsWithTestTokens() {
        const isThreeCrossMode = this._settingsService.isCheckToThreeCrossModeEnabled();
        const isFourCrossMode = this._settingsService.isCheckToFourCrossModeEnabled();
        
        // Give each player tokens for testing
        for (let playerNum = 1; playerNum <= 6; playerNum++) {
            if (isThreeCrossMode) {
                // In three cross mode, give 0 tokens for testing
                this.playerHexagons[playerNum] = {
                    red: 0,
                    blue: 0,
                    white: 0,
                    green: 0,
                    purple: 0,
                    black: 10
                };
            } else if (isFourCrossMode) {
                // In four cross mode, give 5 tokens of each color for testing (4+ scenario)
                this.playerHexagons[playerNum] = {
                    red: 5,
                    blue: 0,
                    white: 0,
                    green: 0,
                    purple: 0,
                    black: 10
                };
            } else {
                // In two cross mode, give 2 tokens of each color for testing
                this.playerHexagons[playerNum] = {
                    red: 2,
                    blue: 2,
                    white: 2,
                    green: 2,
                    purple: 2,
                    black: 10
                };
            }
        }
    }
    private _persistPlayerNames() {
        this._localStorageService.setItem(this._playerNamesKey, JSON.stringify(this.playerNames));
    }

    private _buildRows(cards: Card[]) {
        const levels = [4, 3, 2, 1];
        const cardsPerRow = this._getCardsPerRow();
        const rows = levels.map((level) => {
            const levelCards = cards.filter(
                (card) => card.level === level && !card.levelSpecial && !card.levelBonus
            );
            const shuffled = this._shuffle([...levelCards]);
            return {
                level,
                stack: shuffled,
                topCards: shuffled.slice(0, cardsPerRow),
                backUrl: shuffled.length ? this._imageService.generateCardBackUrl(shuffled[0]) : '',
                specialStacks: this._buildSpecialStacks(cards, level)
            };
        });
        this._scheduleScaleUpdate();
        return rows;
    }

    private _getCardsPerRow(): number {
        if (!this.playerCount) return 3;
        if (this.playerCount <= 2) return 3;
        if (this.playerCount <= 4) return 4;
        return 5;
    }

    private _buildSpecialStacks(cards: Card[], level: number): SpecialStack[] {
        const levelSpecialCards = this._mergeSpecialCards(cards, initialCards).filter(
            (card) => card.level === level && card.levelSpecial && !card.levelBonus
        );
        const purpleStack = this._shuffle(
            levelSpecialCards.filter((card) => (card.get?.purple ?? 0) > 0)
        );
        const blackStack = this._shuffle(
            levelSpecialCards.filter((card) => (card.get?.black ?? 0) > 0)
        );

        return [
            this._createSpecialStack('purple', purpleStack),
            this._createSpecialStack('black', blackStack)
        ];
    }

    private _createSpecialStack(color: SpecialStackColor, stack: Card[]): SpecialStack {
        return {
            color,
            stack,
            topCard: stack[0]
        };
    }

    private _mergeSpecialCards(cards: Card[], baseCards: Card[]): Card[] {
        const cardsMap = new Map<number, Card>();
        cards.forEach((card) => cardsMap.set(card.orderNumber, card));

        baseCards
            .filter((card) => card.levelSpecial && !card.levelBonus)
            .forEach((card) => {
                if (!cardsMap.has(card.orderNumber)) {
                    cardsMap.set(card.orderNumber, card);
                }
            });

        return Array.from(cardsMap.values());
    }

    private _shuffle(cards: Card[]): Card[] {
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        return cards;
    }

    private _assignColors(cards: Card[]): Card[] {
        const colors: Color[] = ['red', 'purple', 'blue', 'white', 'black', 'green'];
        cards.forEach((card) => {
            let mixColorDetector = 0;
            colors.forEach((color) => {
                if (color in card.get) {
                    card.color = color;
                    mixColorDetector++;
                }
            });
            if (mixColorDetector > 1) card.color = 'mix';
        });
        return cards;
    }
}
