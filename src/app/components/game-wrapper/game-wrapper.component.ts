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
import { MasterCardComponent } from '../master-card/master-card.component';
import { ImageService } from '../../services/image.service';
import { InteractionService } from '../../services/interaction.service';
import { cards as initialCards } from '../../data/cards';
import { LocalStorageService } from '../../services/local-storage.service';
import { SettingsService } from '../../services/settings.service';
import { HowToWinComponent } from '../how-to-win/how-to-win.component';
import { howToWinCards } from '../../data/how-to-win-cards';
import { HowToWinCard, HowToWinCardType } from '../../models/how-to-win-card.interface';
import { masterCards } from '../../data/master-cards';
import { MasterCard } from '../../models/master-card.interface';

type SpecialStackColor = 'purple' | 'black';
type SpecialStackKey = `${number}-${SpecialStackColor}`;
type BonusShopMixColor = 'red' | 'blue' | 'white' | 'green';
type PreviewPaymentSource = 'token' | 'card';
type PreviewInteractionContext = { source: PreviewPaymentSource; color: Color; unitIndex?: number };

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
    rollCount?: number;
    freeCardLevel?: number;
    extraTurn?: boolean;
    alt: string;
}

interface PendingCancelableBonusShopAction {
    kind: 'purple';
    spentBlackFromPassive: number;
    spentActiveByColor: Partial<Record<Color, number>>;
    gainedPurple: number;
    rewardKey: string;
}

type PlayerLevelPurchaseCounts = { [level: number]: number };
type PlayerPassiveBlackTapState = { [playerNumber: number]: number };
type BonusShopMasterKind = 'master' | 'grand-master';

interface OwnedMasterCard {
    orderNumber: number;
    name: string;
    image: string;
    grand: boolean;
    color?: Color;
}

interface FinalRoundStanding {
    playerNumber: number;
    playerName: string;
    passiveBonusTotal: number;
    isWinner: boolean;
}

@Component({
    selector: 'app-game-wrapper',
    standalone: true,
    imports: [NgClass, NgFor, NgIf, NgStyle, FormsModule, CardComponent, HexagonComponent, PlayerColumnComponent, MasterCardComponent, HowToWinComponent],
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
    public showPurplePurchasePreviewModal: boolean = false;
    public purplePurchasePreviewCard: Card | null = null;
    public showBonusShopModal: boolean = false;
    public showBonusShopMixModal: boolean = false;
    public showBonusShopFreeCardModal: boolean = false;
    public showBonusShopExtraTurnModal: boolean = false;
    public showBonusShopMasterModal: boolean = false;
    public hasBonusShopActionStarted: boolean = false;
    public usedBonusShopRewardKeysThisTurn: Set<string> = new Set<string>();
    public bonusShopMixSelectionLimit: number = 0;
    public bonusShopMixDraftBankHexagons: Record<BonusShopMixColor, number> = {
        red: 0,
        blue: 0,
        white: 0,
        green: 0,
    };
    public bonusShopMixDraftHandHexagons: Record<BonusShopMixColor, number> = {
        red: 0,
        blue: 0,
        white: 0,
        green: 0,
    };
    public bonusShopFreeCardLevel: number = 0;
    public bonusShopFreeCardChoices: Card[] = [];
    public selectedBonusShopFreeCardOrderNumber: number | null = null;
    public bonusShopMasterChoices: MasterCard[] = [];
    public selectedBonusShopMasterOrderNumber: number | null = null;
    public bonusShopMasterKind: BonusShopMasterKind = 'master';
    public readonly bonusShopRules: BonusShopRule[] = [
        {
            blackCost: 1,
            rewards: [
                { kind: 'hex', color: 'dice', rollCount: 1, alt: 'Roll one dice reward' }
            ]
        },
        {
            blackCost: 2,
            rewards: [
                { kind: 'hex', color: 'mix', alt: 'Mixed hex reward' },
                { kind: 'hex', color: 'dice', number: 2, rollCount: 2, alt: 'Roll two dice reward' }
            ]
        },
        {
            blackCost: 3,
            rewards: [
                { kind: 'hex', color: 'purple', alt: 'Purple hex reward' },
                { kind: 'image', imageSrc: 'assets/hex/card_1_lvl.png', freeCardLevel: 1, alt: 'Free level 1 card' }
            ]
        },
        {
            blackCost: 4,
            rewards: [
                { kind: 'hex', color: 'mix', number: 2, alt: 'Mixed hex reward with value 2' },
                { kind: 'image', imageSrc: 'assets/hex/extra_turn.png', extraTurn: true, alt: 'Extra turn reward' }
            ]
        },
        {
            blackCost: 5,
            rewards: [
                { kind: 'hex', color: 'purple', number: 2, alt: 'Purple hex reward with value 2' },
                { kind: 'image', imageSrc: 'assets/hex/card_2_lvl.png', freeCardLevel: 2, alt: 'Free level 2 card' }
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
                { kind: 'image', imageSrc: 'assets/hex/card_3_lvl.png', freeCardLevel: 3, alt: 'Free level 3 card' }
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
                { kind: 'image', imageSrc: 'assets/hex/card_4_lvl.png', freeCardLevel: 4, alt: 'Free level 4 card' }
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
        1: { red: 2, blue: 2, white: 2, green: 2, purple: 2, black: 8 },
        2: { red: 2, blue: 2, white: 2, green: 2, purple: 2, black: 8 },
        3: { red: 2, blue: 2, white: 2, green: 2, purple: 2, black: 8 },
        4: { red: 2, blue: 2, white: 2, green: 2, purple: 2, black: 8 },
        5: { red: 2, blue: 2, white: 2, green: 2, purple: 2, black: 8 },
        6: { red: 2, blue: 2, white: 2, green: 2, purple: 2, black: 8 },
    };
    public playerCardHexagons: { [playerNumber: number]: { [key in Color]?: number } } = {
        1: { red: 2, blue: 2, white: 2, green: 2, purple: 2, black: 2 },
        2: { red: 2, blue: 2, white: 2, green: 2, purple: 2, black: 2 },
        3: { red: 2, blue: 2, white: 2, green: 2, purple: 2, black: 2 },
        4: { red: 2, blue: 2, white: 2, green: 2, purple: 2, black: 2 },
        5: { red: 2, blue: 2, white: 2, green: 2, purple: 2, black: 2 },
        6: { red: 2, blue: 2, white: 2, green: 2, purple: 2, black: 2 },
    };
    public playerOwnedMasterCards: { [playerNumber: number]: OwnedMasterCard[] } = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
    };
    public hexagonsPickedThisTurn: number = 0;
    public isFinishTurnUnlockedByDiceModal: boolean = false;
    public isWaitingForPostRoll2Token: boolean = false;
    public readonly maxHexagonsPerTurn: number = 2;
    private readonly _turnTrackedColors: Color[] = ['red', 'blue', 'white', 'green', 'purple', 'black'];
    private readonly _purpleWildcardPayColors: Color[] = ['red', 'green', 'white', 'blue'];
    private readonly _magicWildcardPayColors: Color[] = ['red', 'green', 'white', 'blue', 'purple'];
    private readonly _purchasePayColors: Color[] = ['red', 'green', 'white', 'blue', 'black'];
    private readonly _purchaseBonusColors: Color[] = ['red', 'green', 'white', 'blue', 'purple', 'black'];
    private readonly _bonusShopMixColors: BonusShopMixColor[] = ['red', 'blue', 'white', 'green'];
    private _turnStartGameBankHexagons: { [key in Color]?: number } = {};
    private _turnStartPlayerHexagons: { [key in Color]?: number } = {};
    private _turnStartPlayerCardHexagons: { [key in Color]?: number } = {};
    private _turnStartPlayerOwnedMasterCards: OwnedMasterCard[] = [];
    private _purchasedMasterCardOrderNumbers: Set<number> = new Set<number>();
    private _turnStartPurchasedMasterCardOrderNumbers: Set<number> = new Set<number>();
    private _mastersTakenThisTurn: number = 0;
    private _turnStartMastersTakenThisTurn: number = 0;
    private _playerPassiveBlackTappedThisTurn: PlayerPassiveBlackTapState = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
    };
    private _turnStartPassiveBlackTappedCount: number = 0;
    private _playerSpecialStackPurchases: { [playerNumber: number]: Set<SpecialStackKey> } = {
        1: new Set<SpecialStackKey>(),
        2: new Set<SpecialStackKey>(),
        3: new Set<SpecialStackKey>(),
        4: new Set<SpecialStackKey>(),
        5: new Set<SpecialStackKey>(),
        6: new Set<SpecialStackKey>(),
    };
    private _turnStartPlayerSpecialStackPurchases: Set<SpecialStackKey> = new Set<SpecialStackKey>();
    private _playerNormalCardLevelPurchases: { [playerNumber: number]: PlayerLevelPurchaseCounts } = {
        1: { 1: 0, 2: 0, 3: 0, 4: 0 },
        2: { 1: 0, 2: 0, 3: 0, 4: 0 },
        3: { 1: 0, 2: 0, 3: 0, 4: 0 },
        4: { 1: 0, 2: 0, 3: 0, 4: 0 },
        5: { 1: 0, 2: 0, 3: 0, 4: 0 },
        6: { 1: 0, 2: 0, 3: 0, 4: 0 },
    };
    private _turnStartPlayerNormalCardLevelPurchases: PlayerLevelPurchaseCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    private _lastClosedRollCount: number = 0;
    private _lastClosedRollWasBonusAction: boolean = false;
    private _pendingPurchasedCardOrderNumbers: Set<number> = new Set<number>();
    private _pendingBonusActionCardOrderNumbers: Set<number> = new Set<number>();
    private _pendingBonusShopMixBlackCost: number = 0;
    private _pendingBonusShopMixRewardKey: string = '';
    private _pendingBonusShopFreeCardBlackCost: number = 0;
    private _pendingBonusShopFreeCardRewardKey: string = '';
    private _pendingBonusShopExtraTurnBlackCost: number = 0;
    private _pendingBonusShopExtraTurnRewardKey: string = '';
    private _pendingBonusShopMasterBlackCost: number = 0;
    private _pendingBonusShopMasterRewardKey: string = '';
    private _isActivePlayerExtraTurnInProgress: boolean = false;
    private _pendingCancelableBonusShopAction: PendingCancelableBonusShopAction | null = null;
    private _isFinalRoundActive: boolean = false;
    private _finalRoundStartPlayer: number | null = null;
    private _finalRoundQualifiedPlayers: Set<number> = new Set<number>();
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
    public rowWinConditionCards: Array<HowToWinCard | null> = [null, null, null, null];
    public hasWinner: boolean = false;
    public showVictoryModal: boolean = false;
    public showFinalRoundNoticeModal: boolean = false;
    public showVictoryTiebreakModal: boolean = false;
    public winnerName: string = '';
    public winnerConditionLabel: string = '';
    public finalRoundTriggerName: string = '';
    public finalRoundTriggerConditionLabel: string = '';
    public finalRoundStandings: FinalRoundStanding[] = [];
    public finalRoundWinnerName: string = '';
    public printModeEnabled: boolean = true;
    public readonly previewModalColors: Color[] = ['red', 'blue', 'white', 'green', 'purple', 'black'];
    public readonly previewPurpleWildcardTargets: Color[] = ['red', 'blue', 'white', 'green', 'purple'];
    public previewNeedToPayDraft: { [key in Color]?: number } = {};
    public previewTokenPoolDraft: { [key in Color]?: number } = {};
    public previewTokenPoolBase: { [key in Color]?: number } = {};
    public previewPurpleCardUnitsDraft: number = 0;
    public previewPurpleCardUnitsBase: number = 0;
    private _previewDragContext: PreviewInteractionContext | null = null;
    private _previewHoverContext: PreviewInteractionContext | null = null;
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

        this._captureTurnStartState();
        this._loadRowWinConditionCards();
        
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
        this._setDiceModalScrollLock(false);
    }

    @HostListener('window:resize')
    onWindowResize() {
        this._scheduleScaleUpdate();
    }

    @HostListener('window:keydown', ['$event'])
    onWindowKeyDown(event: KeyboardEvent): void {
        if (this.hasWinner) {
            if ((this.showVictoryModal || this.showVictoryTiebreakModal) && (event.key === 'Escape' || event.key === 'Esc')) {
                event.preventDefault();
                this.closeVictoryModal();
            }
            return;
        }

        const target = event.target as HTMLElement | null;
        if (this._isEditableTarget(target)) {
            return;
        }

        const key = event.key;
        const lowerKey = key.toLowerCase();

        if (key === 'Backspace' || key === 'Delete' || key === 'Escape' || key === 'Esc') {
            event.preventDefault();

            if (this._handleEscapeKey()) {
                return;
            }

            if (this.canCancelTokens) {
                this.cancelTokens();
            }
            return;
        }

        if (key === 'Tab' || lowerKey === 'b') {
            event.preventDefault();
            if (this.canUseBonusMarket) {
                this.openBonusMarket();
            }
            return;
        }

        if (this.showPurplePurchasePreviewModal && (event.code === 'Space' || key === 'Enter')) {
            event.preventDefault();
            if (this.canApplyPurplePurchasePreview) {
                this.applyPurplePurchasePreviewModal();
            }
            return;
        }

        if (event.code === 'Space' || key === 'Enter') {
            event.preventDefault();
            if (this.canFinishTurn) {
                this.finishTurn();
            }
            return;
        }

        if (key === '1') {
            event.preventDefault();
            this.onHexagonClick('red');
            return;
        }

        if (key === '2') {
            event.preventDefault();
            this.onHexagonClick('blue');
            return;
        }

        if (key === '3') {
            event.preventDefault();
            this.onHexagonClick('white');
            return;
        }

        if (key === '4') {
            event.preventDefault();
            this.onHexagonClick('green');
            return;
        }

        if (key === '5') {
            event.preventDefault();
            this.onHexagonClick('purple');
            return;
        }

        if (key === '0') {
            event.preventDefault();
            if (!this.isRollButtonDisabled(4)) {
                this.rollDice(4);
            }
            return;
        }

        if (key === '9') {
            event.preventDefault();
            if (!this.isRollButtonDisabled(2)) {
                this.rollDice(2);
            }
        }
    }

    private _isEditableTarget(target: HTMLElement | null): boolean {
        if (!target) {
            return false;
        }

        return target.tagName === 'INPUT'
            || target.tagName === 'TEXTAREA'
            || target.isContentEditable;
    }

    private _handleEscapeKey(): boolean {
        if (this.showFinalRoundNoticeModal) {
            this.closeFinalRoundNoticeModal();
            return true;
        }

        if (this.showPurplePurchasePreviewModal) {
            this.closePurplePurchasePreviewModal();
            return true;
        }

        if (this.showBonusShopMixModal) {
            this.cancelBonusShopMixSelection();
            return true;
        }

        if (this.showBonusShopExtraTurnModal) {
            this.cancelBonusShopExtraTurnSelection();
            return true;
        }

        if (this.showBonusShopMasterModal) {
            this.cancelBonusShopMasterSelection();
            return true;
        }

        if (this.showBonusShopFreeCardModal) {
            this.cancelBonusShopFreeCardSelection();
            return true;
        }

        if (this.showLuckyPurpleChoiceModal) {
            this.cancelLuckyPurpleSelection();
            return true;
        }

        if (this.showDiceModal) {
            this.closeDiceModal();
            return true;
        }

        if (this.showBonusShopModal) {
            this.closeBonusShopModal();
            return true;
        }

        return false;
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
        if (this.hasWinner) {
            return;
        }

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
        if (this.hasWinner) {
            return;
        }

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
        if (this.hasWinner) {
            return;
        }

        if (this.isTokenInHandInteractionDisabled(color)) {
            return;
        }

        const handValue = this.modalHandHexagons[color] ?? 0;

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

    public isTokenInHandInteractionDisabled(color: Color): boolean {
        return this.canCloseDiceModal || this.isTokenInHandDisabled(color);
    }

    public isTokenInHandVisuallyDisabled(color: Color): boolean {
        return !this.canCloseDiceModal && this.isTokenInHandDisabled(color);
    }

    public get areAllTokenBankModalDisabled(): boolean {
        const colors: Color[] = ['red', 'blue', 'white', 'green', 'purple'];
        return colors.every((color) => this.isTokenBankModalDisabled(color));
    }

    public get areAllTokensToDiscardModalDisabled(): boolean {
        return this.tokensToDiscard === 0;
    }

    public finishTurn(): void {
        if (this.hasWinner) {
            return;
        }

        this._commitPendingPurchasedCards();

        // Reset turn counter and picked tokens
        this.hexagonsPickedThisTurn = 0;
        this.isFinishTurnUnlockedByDiceModal = false;
        this.isWaitingForPostRoll2Token = false;
        this._lastClosedRollCount = 0;
        this._lastClosedRollWasBonusAction = false;
        this.hasBonusShopActionStarted = false;
        this.usedBonusShopRewardKeysThisTurn.clear();
        this._pendingCancelableBonusShopAction = null;
        this._setActivePlayerPassiveBlackTappedCount(0);
        this._mastersTakenThisTurn = 0;
        this._isActivePlayerExtraTurnInProgress = false;
        this._resetBonusShopExtraTurnDraft(false);
        this._resetBonusShopFreeCardDraft(false);
        this._resetBonusShopMasterDraft(false);
        this.pickedTokensThisTurn = [];

        this._updateTokensByDiceState();
        
        // Move to next player
        if (!this.playerCount) return;
        
        let nextPlayer = this.activePlayer + 1;
        if (nextPlayer > this.playerCount) {
            nextPlayer = 1;
        }

        if (this._isFinalRoundActive && this._finalRoundStartPlayer !== null && nextPlayer === this._finalRoundStartPlayer) {
            const winnerResolved = this._finalizeFinalRound();
            if (winnerResolved) {
                return;
            }

            this._resetFinalRoundState();
        }
        
        this.activePlayer = nextPlayer;
        this._ensureActivePlayerPage();
        this._captureTurnStartState();
    }

    public cancelTokens(): void {
        if (this.hasWinner) {
            return;
        }

        // Restore bank and active player tokens to turn-start snapshot.
        const playerHex = this.playerHexagons[this.activePlayer];
        const playerCards = this.playerCardHexagons[this.activePlayer];
        if (!playerHex || !playerCards) return;

        for (const color of this._turnTrackedColors) {
            this.gameBankHexagons[color] = this._turnStartGameBankHexagons[color] ?? 0;
            playerHex[color] = this._turnStartPlayerHexagons[color] ?? 0;
            playerCards[color] = this._turnStartPlayerCardHexagons[color] ?? 0;
        }

        this._playerSpecialStackPurchases[this.activePlayer] = new Set<SpecialStackKey>(this._turnStartPlayerSpecialStackPurchases);
        this._playerNormalCardLevelPurchases[this.activePlayer] = { ...this._turnStartPlayerNormalCardLevelPurchases };

        // Reset counters
        this.hexagonsPickedThisTurn = 0;
        this.isFinishTurnUnlockedByDiceModal = false;
        this.isWaitingForPostRoll2Token = false;
        this._lastClosedRollCount = 0;
        this._lastClosedRollWasBonusAction = false;
        this.hasBonusShopActionStarted = false;
        this.usedBonusShopRewardKeysThisTurn.clear();
        this._pendingCancelableBonusShopAction = null;
        this._setActivePlayerPassiveBlackTappedCount(this._turnStartPassiveBlackTappedCount);
        this.playerOwnedMasterCards[this.activePlayer] = this._turnStartPlayerOwnedMasterCards.map((card) => ({ ...card }));
        this._purchasedMasterCardOrderNumbers = new Set<number>(this._turnStartPurchasedMasterCardOrderNumbers);
        this._mastersTakenThisTurn = this._turnStartMastersTakenThisTurn;
        this._resetBonusShopFreeCardDraft(false);
        this._resetBonusShopMasterDraft(false);
        this._pendingPurchasedCardOrderNumbers.clear();
        this._pendingBonusActionCardOrderNumbers.clear();
        this.pickedTokensThisTurn = [];

        this._updateTokensByDiceState();
    }

    public isCardSoldPending(card: Card | undefined): boolean {
        if (!card) return false;
        return this._pendingPurchasedCardOrderNumbers.has(card.orderNumber);
    }

    public isCardBonusActionPending(card: Card | undefined): boolean {
        if (!card) return false;
        return this._pendingBonusActionCardOrderNumbers.has(card.orderNumber);
    }

    public isCardPending(card: Card | undefined): boolean {
        return this.isCardSoldPending(card) || this.isCardBonusActionPending(card);
    }

    public getCardPendingLabel(card: Card | undefined): string {
        return this.isCardBonusActionPending(card) ? 'BONUS ACTION' : 'SOLD';
    }

    public onPurchaseCard(card: Card): void {
        if (this.hasWinner) {
            return;
        }

        if (!card || this.isCardPurchaseLockedThisTurn || this.isCardPending(card)) {
            return;
        }

        const specialStackKey = this._getSpecialStackPurchaseKey(card);
        if (specialStackKey) {
            if (this._playerHasSpecialStackPurchase(this.activePlayer, specialStackKey)
                || this._isSpecialStackClosedForAllPlayers(specialStackKey)) {
                return;
            }
        }

        const playerHex = this.playerHexagons[this.activePlayer];
        const playerCards = this.playerCardHexagons[this.activePlayer];
        if (!playerHex || !playerCards) return;

        const paymentPlan = this._buildCardPaymentPlan(card, playerHex, playerCards);
        if (!paymentPlan.isAffordable) {
            return;
        }

        if (paymentPlan.spentPassiveBlack > 0) {
            const spentPassiveBlack = this._spendActivePlayerPassiveBlackForTurn(paymentPlan.spentPassiveBlack);
            if (spentPassiveBlack < paymentPlan.spentPassiveBlack) {
                return;
            }
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

        this._acquireCardForActivePlayer(card, true, specialStackKey ?? undefined);
    }

    public onPurplePurchasePreview(card: Card): void {
        if (!card || this.hasWinner) {
            return;
        }

        this.purplePurchasePreviewCard = card;
        this._initPurplePurchasePreviewDraft();

        if (this.canApplyPurplePurchasePreview) {
            const targetCard = this.purplePurchasePreviewCard;
            this.closePurplePurchasePreviewModal();
            if (targetCard) {
                this.onPurchaseCard(targetCard);
            }
            return;
        }

        this.showPurplePurchasePreviewModal = true;
    }

    public closePurplePurchasePreviewModal(): void {
        this.showPurplePurchasePreviewModal = false;
        this.purplePurchasePreviewCard = null;
        this.previewNeedToPayDraft = {};
        this.previewTokenPoolDraft = {};
        this.previewTokenPoolBase = {};
        this.previewPurpleCardUnitsDraft = 0;
        this.previewPurpleCardUnitsBase = 0;
        this._previewDragContext = null;
        this._previewHoverContext = null;
    }

    public applyPurplePurchasePreviewModal(): void {
        if (!this.canApplyPurplePurchasePreview || !this.purplePurchasePreviewCard) {
            return;
        }

        const targetCard = this.purplePurchasePreviewCard;
        this.closePurplePurchasePreviewModal();
        this.onPurchaseCard(targetCard);
    }

    public isSpecialStackCardBlockedForActivePlayer(card: Card | undefined): boolean {
        const specialStackKey = this._getSpecialStackPurchaseKey(card);
        if (!specialStackKey) {
            return false;
        }

        return this._playerHasSpecialStackPurchase(this.activePlayer, specialStackKey);
    }

    public isSpecialStackClosedForAllPlayers(level: number, color: SpecialStackColor): boolean {
        const specialStackKey = this._buildSpecialStackKey(level, color);
        return this._isSpecialStackClosedForAllPlayers(specialStackKey);
    }

    public getSpecialStackBackUrl(rowBackUrl: string, specialStack: SpecialStack): string {
        const stackTopCard = specialStack.stack[0] ?? specialStack.topCard;
        if (stackTopCard) {
            return this._imageService.generateCardBackUrl(stackTopCard);
        }

        return rowBackUrl;
    }

    public getSpecialStackVisibleCards(specialStack: SpecialStack): Card[] {
        const visibleCardsCount = this._getSpecialCardsPerStack();
        return specialStack.stack.slice(0, visibleCardsCount);
    }

    public getMainRowMissingSlots(row: { topCards: Card[] }): number[] {
        const cardsPerRow = this._getCardsPerRow();
        const missingCount = Math.max(cardsPerRow - row.topCards.length, 0);
        return Array.from({ length: missingCount }, (_, index) => index);
    }

    public getSpecialStackMissingSlots(specialStack: SpecialStack): number[] {
        const visibleCardsCount = this._getSpecialCardsPerStack();
        const missingCount = Math.max(visibleCardsCount - specialStack.stack.length, 0);
        return Array.from({ length: missingCount }, (_, index) => index);
    }

    public getSpecialStackClosedPlaceholderSlots(): number[] {
        const visibleCardsCount = this._getSpecialCardsPerStack();
        const placeholdersCount = Math.max(visibleCardsCount - 1, 0);
        return Array.from({ length: placeholdersCount }, (_, index) => index);
    }

    public get canFinishTurn(): boolean {
        return this.hexagonsPickedThisTurn >= this.maxHexagonsPerTurn || this.isFinishTurnUnlockedByDiceModal;
    }

    public get canCancelTokens(): boolean {
        return this._hasTurnStateChanges() && !this.hasBonusShopActionStarted;
    }

    public get canUseBonusMarket(): boolean {
        if (this.hasBonusShopActionStarted) {
            return true;
        }

        if (this._getActivePlayerBonusShopBlackBalance() < 1) {
            return false;
        }

        return this.bonusShopRules.some((rule) => !this.isBonusShopRuleDisabled(rule));
    }

    public isBonusShopImageRewardClickable(reward: BonusShopReward): boolean {
        return this._getBonusShopFreeCardLevel(reward) > 0
            || this._isBonusShopExtraTurnReward(reward)
            || this._getBonusShopMasterKind(reward) !== null;
    }

    public get activePlayerBlackPassiveCardSlots(): number[] {
        const playerCards = this.playerCardHexagons[this.activePlayer];
        const totalPassiveBlack = Math.max(0, Math.floor(playerCards?.['black'] ?? 0));
        return Array.from({ length: totalPassiveBlack }, (_, index) => index);
    }

    public isActivePlayerBlackPassiveCardTapped(slotIndex: number): boolean {
        return slotIndex < this._getActivePlayerPassiveBlackTappedCount();
    }

    public get activePlayerBonusShopDarkMasterTokens(): Array<{ color: Color; amount: number }> {
        if (!this._hasActivePlayerDarkMaster()) {
            return [];
        }

        const playerHex = this.playerHexagons[this.activePlayer];
        if (!playerHex) {
            return [];
        }

        const spendableColors: Color[] = ['red', 'blue', 'white', 'green', 'purple'];
        return spendableColors
            .map((color) => ({
                color,
                amount: Math.max(0, Math.floor(playerHex[color] ?? 0)),
            }))
            .filter((token) => token.amount > 0);
    }

    public isBonusShopRuleDisabled(rule: BonusShopRule): boolean {
        if (this.showBonusShopMixModal || this.showBonusShopFreeCardModal || this.showBonusShopMasterModal) {
            return true;
        }

        if (!rule) {
            return true;
        }

        const cost = Math.max(0, Math.floor(rule.blackCost));
        if (cost <= 0) {
            return true;
        }

        const selectableRewardIndexes = rule.rewards
            .map((reward, index) => this._isBonusShopRewardSelectable(reward) ? index : -1)
            .filter((index) => index >= 0);

        if (selectableRewardIndexes.length > 0) {
            const hasUnusedSelectableReward = selectableRewardIndexes.some((rewardIndex) => {
                const rewardKey = this._buildBonusShopRewardKey(cost, rewardIndex);
                return !this.usedBonusShopRewardKeysThisTurn.has(rewardKey);
            });

            if (!hasUnusedSelectableReward) {
                return true;
            }
        }

        return this._getActivePlayerBonusShopBlackBalance() < cost;
    }

    public isBonusShopRewardDisabled(rule: BonusShopRule, rewardIndex: number): boolean {
        if (this.showBonusShopMixModal) {
            return true;
        }

        if (!rule || rewardIndex < 0 || rewardIndex >= rule.rewards.length) {
            return true;
        }

        const reward = rule.rewards[rewardIndex];
        if (!this._isBonusShopRewardSelectable(reward)) {
            return true;
        }

        if (this._isBonusShopExtraTurnBlocked(reward)) {
            return true;
        }

        const cost = Math.max(0, Math.floor(rule.blackCost));
        if (cost <= 0) {
            return true;
        }

        const rewardKey = this._buildBonusShopRewardKey(cost, rewardIndex);
        if (this.usedBonusShopRewardKeysThisTurn.has(rewardKey)) {
            return true;
        }

        if (this._getActivePlayerBonusShopBlackBalance() < cost) {
            return true;
        }

        if (reward.color === 'purple') {
            const requiredPurple = this._getBonusShopPurpleRewardAmount(reward);
            const purpleInBank = this.gameBankHexagons['purple'] ?? 0;
            return purpleInBank < requiredPurple;
        }

        const freeCardLevel = this._getBonusShopFreeCardLevel(reward);
        if (freeCardLevel > 0) {
            return this._getBonusShopFreeCardChoices(freeCardLevel).length <= 0;
        }

        const masterKind = this._getBonusShopMasterKind(reward);
        if (masterKind) {
            return this._getBonusShopMasterChoices(masterKind).every((card) => this._isMasterCardUnavailable(card, masterKind));
        }

        return false;
    }

    private _isBonusShopRewardSelectable(reward: BonusShopReward | undefined): boolean {
        if (!reward) {
            return false;
        }

        if (reward.kind === 'hex') {
            return reward.color === 'dice' || reward.color === 'mix' || reward.color === 'purple';
        }

        if (this._isBonusShopExtraTurnBlocked(reward)) {
            return false;
        }

        return this._getBonusShopFreeCardLevel(reward) > 0
            || this._isBonusShopExtraTurnReward(reward)
            || this._getBonusShopMasterKind(reward) !== null;
    }

    private _isBonusShopExtraTurnBlocked(reward: BonusShopReward | undefined): boolean {
        return this._isActivePlayerExtraTurnInProgress && this._isBonusShopExtraTurnReward(reward);
    }

    private _isBonusShopExtraTurnReward(reward: BonusShopReward | undefined): boolean {
        if (!reward || reward.kind !== 'image') {
            return false;
        }

        if (reward.extraTurn === true) {
            return true;
        }

        return (reward.imageSrc ?? '').toLowerCase().endsWith('/extra_turn.png');
    }

    private _getBonusShopMasterKind(reward: BonusShopReward | undefined): BonusShopMasterKind | null {
        if (!reward || reward.kind !== 'image') {
            return null;
        }

        const imageSrc = (reward.imageSrc ?? '').toLowerCase();
        if (imageSrc.endsWith('/card_master.png')) {
            return 'master';
        }

        if (imageSrc.endsWith('/card_grand_master.png')) {
            return 'grand-master';
        }

        return null;
    }

    private _getBonusShopPurpleRewardAmount(reward: BonusShopReward | undefined): number {
        if (!reward || reward.kind !== 'hex' || reward.color !== 'purple') {
            return 0;
        }

        return Math.max(1, Math.floor(reward.number ?? 1));
    }

    private _getBonusShopFreeCardLevel(reward: BonusShopReward | undefined): number {
        if (!reward || reward.kind !== 'image') {
            return 0;
        }

        const directLevel = Math.max(0, Math.floor(reward.freeCardLevel ?? 0));
        if (directLevel >= 1 && directLevel <= 4) {
            return directLevel;
        }

        const imageSrc = reward.imageSrc ?? '';
        const levelMatch = imageSrc.match(/card_(\d+)_lvl\.png$/i);
        if (!levelMatch) {
            return 0;
        }

        const parsedLevel = Number(levelMatch[1]);
        if (!Number.isInteger(parsedLevel) || parsedLevel < 1 || parsedLevel > 4) {
            return 0;
        }

        return parsedLevel;
    }

    private _getBonusShopFreeCardChoices(level: number): Card[] {
        const normalizedLevel = Math.max(1, Math.floor(level));
        const targetRow = this.rows.find((row) => row.level === normalizedLevel);
        if (!targetRow) {
            return [];
        }

        return targetRow.topCards.filter((card) => !this.isCardPending(card));
    }

    private _getBonusShopMasterChoices(kind: BonusShopMasterKind): MasterCard[] {
        return masterCards.filter((card) => {
            const isGrand = card.grand === true;
            return kind === 'master' ? !isGrand : isGrand;
        });
    }

    private _isMasterCardUnavailable(card: MasterCard | undefined, kind: BonusShopMasterKind): boolean {
        if (!card) {
            return true;
        }

        if (this._purchasedMasterCardOrderNumbers.has(card.orderNumber)) {
            return true;
        }

        if (kind === 'master' && this._mastersTakenThisTurn >= 1) {
            return true;
        }

        return false;
    }

    private _buildBonusShopRewardKey(blackCost: number, rewardIndex: number): string {
        const cost = Math.max(0, Math.floor(blackCost));
        return `${cost}:${rewardIndex}`;
    }

    public get activePlayerTokensForPurchase(): { [key in Color]?: number } {
        return this.playerHexagons[this.activePlayer] ?? {};
    }

    public get activePlayerCardTokensForPurchase(): { [key in Color]?: number } {
        return this.playerCardHexagons[this.activePlayer] ?? {};
    }

    public get activePlayerMasterColors(): Color[] {
        return this._getActivePlayerMasterColors();
    }

    public get playerPassiveBlackTappedThisTurn(): { [playerNumber: number]: number } {
        return this._playerPassiveBlackTappedThisTurn;
    }

    public get purplePreviewPlayerHandTokens(): { [key in Color]?: number } {
        return this.playerHexagons[this.activePlayer] ?? {};
    }

    public get purplePreviewPlayerPassiveCards(): { [key in Color]?: number } {
        return this.playerCardHexagons[this.activePlayer] ?? {};
    }

    public get purplePreviewNeedToPayTokens(): { [key in Color]?: number } {
        const result: { [key in Color]?: number } = {};
        const card = this.purplePurchasePreviewCard;
        if (!card) {
            return result;
        }

        const passiveCards = this.purplePreviewPlayerPassiveCards;
        const hasMagicMaster = this._hasActivePlayerMagicMaster();

        if (hasMagicMaster) {
            const needs: Partial<Record<Color, number>> = {};
            for (const color of this._magicWildcardPayColors) {
                needs[color] = Math.max(card.pay?.[color] ?? 0, 0);
            }

            const passivePool: Partial<Record<Color, number>> = {};
            for (const color of this._magicWildcardPayColors) {
                passivePool[color] = passiveCards[color] ?? 0;
            }

            this._coverNeedsWithUniversalPool(needs, passivePool);

            for (const color of this._magicWildcardPayColors) {
                result[color] = needs[color] ?? 0;
            }

            const requiredBlack = card.pay?.['black'] ?? 0;
            const passiveBlack = Math.max((passiveCards['black'] ?? 0) - this._getActivePlayerPassiveBlackTappedCount(), 0);
            result['black'] = Math.max(requiredBlack - passiveBlack, 0);

            return result;
        }

        for (const color of this.previewModalColors) {
            const required = card.pay?.[color] ?? 0;
            const passive = passiveCards[color] ?? 0;
            result[color] = Math.max(required - passive, 0);
        }

        return result;
    }

    public get previewAutoAppliedPurplePassiveCards(): number {
        const card = this.purplePurchasePreviewCard;
        if (!card) {
            return 0;
        }

        const requiredPurple = card.pay?.['purple'] ?? 0;
        const passivePurple = this.purplePreviewPlayerPassiveCards['purple'] ?? 0;
        return Math.min(requiredPurple, passivePurple);
    }

    public get purplePreviewVisibleNeedToPayColors(): Color[] {
        return this.previewModalColors.filter((color) => (this.previewNeedToPayDraft[color] ?? 0) > 0);
    }

    public get purplePreviewVisibleTokenColors(): Color[] {
        return this.previewModalColors.filter((color) => {
            if (color === 'purple') {
                return false;
            }
            return (this.previewTokenPoolBase[color] ?? 0) > 0;
        });
    }

    public get purplePreviewVisiblePassiveCardColors(): Color[] {
        return this.previewModalColors.filter((color) => {
            if (color === 'purple') {
                return false;
            }
            return (this.purplePreviewPlayerPassiveCards[color] ?? 0) > 0;
        });
    }

    public get previewPurpleTokenUnits(): number[] {
        const count = this.previewTokenPoolBase['purple'] ?? 0;
        return Array.from({ length: count }, (_, index) => index);
    }

    public get previewPurplePassiveCardUnits(): number[] {
        return Array.from({ length: this.previewPurpleCardUnitsBase }, (_, index) => index);
    }

    public get purplePreviewSpecialConditionMasters(): OwnedMasterCard[] {
        return this.playerOwnedMasterCards[this.activePlayer] ?? [];
    }

    public getSpecialConditionMasterSourceColors(masterCard: OwnedMasterCard): Color[] {
        const masterColor = this._resolveOwnedMasterColor(masterCard);
        if (!masterColor) {
            return [];
        }

        const elementalColors: Color[] = ['red', 'blue', 'white', 'green'];

        if (masterColor === 'black') {
            return [...elementalColors, 'purple'];
        }

        if (masterColor === 'purple') {
            return elementalColors;
        }

        if (this._isElementalColor(masterColor)) {
            return elementalColors.filter((color) => color !== masterColor);
        }

        return [];
    }

    public getSpecialConditionMasterTargetColor(masterCard: OwnedMasterCard): Color | null {
        const masterColor = this._resolveOwnedMasterColor(masterCard);
        if (!masterColor) {
            return null;
        }

        if (this._isElementalColor(masterColor) || masterColor === 'purple' || masterColor === 'black') {
            return masterColor;
        }

        return null;
    }

    public get canApplyPurplePurchasePreview(): boolean {
        return this.purplePurchasePreviewCard !== null
            && !this.previewModalColors.some((color) => (this.previewNeedToPayDraft[color] ?? 0) > 0);
    }

    public get showPreviewPaymentGuidance(): boolean {
        return this._getPreviewGuidanceMode() !== null;
    }

    public get isPreviewClickToPayMode(): boolean {
        return this._getPreviewGuidanceMode() === 'click';
    }

    public get previewPaymentGuidanceText(): string {
        return this.isPreviewClickToPayMode ? 'Click to pay' : 'Drag and drop to pay';
    }

    public get isPreviewInteractionFocusActive(): boolean {
        return this._resolvePreviewInteractionContext() !== null;
    }

    public isPreviewTokenDisabled(color: Color): boolean {
        const amount = this.previewTokenPoolDraft[color] ?? 0;
        if (amount <= 0) {
            return true;
        }

        return this._getPreviewPayTargetCount('token', color) <= 0;
    }

    public isPreviewPassiveCardDisabled(color: Color): boolean {
        const amount = this.purplePreviewPlayerPassiveCards[color] ?? 0;
        if (amount <= 0) {
            return true;
        }

        if (color !== 'purple') {
            return true;
        }

        return this.previewPurpleCardUnitsDraft <= 0 || !this._hasPreviewNeedForAny(this.previewPurpleWildcardTargets);
    }

    public onPreviewDragStart(source: PreviewPaymentSource, color: Color, event: DragEvent, unitIndex?: number): void {
        if (source === 'token' && this.isPreviewTokenDisabled(color)) {
            event.preventDefault();
            return;
        }

        if (source === 'card' && this.isPreviewPassiveCardDisabled(color)) {
            event.preventDefault();
            return;
        }

        if (color === 'purple' && typeof unitIndex === 'number') {
            const availableCount = source === 'token' ? (this.previewTokenPoolDraft['purple'] ?? 0) : this.previewPurpleCardUnitsDraft;
            if (unitIndex >= availableCount) {
                event.preventDefault();
                return;
            }
        }

        this._previewDragContext = { source, color, unitIndex };
        this._previewHoverContext = { source, color, unitIndex };
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', `${source}:${color}`);
        }
    }

    public onPreviewSourceClick(source: PreviewPaymentSource, color: Color, event: MouseEvent, unitIndex?: number): void {
        event.preventDefault();
        event.stopPropagation();

        if (source === 'token' && this.isPreviewTokenDisabled(color)) {
            return;
        }

        if (source === 'card' && this.isPreviewPassiveCardDisabled(color)) {
            return;
        }

        if (color === 'purple' && typeof unitIndex === 'number') {
            const availableCount = source === 'token' ? (this.previewTokenPoolDraft['purple'] ?? 0) : this.previewPurpleCardUnitsDraft;
            if (unitIndex >= availableCount) {
                return;
            }
        }

        const availableTargets = this.previewModalColors.filter((targetColor) =>
            this._canPreviewPayTarget(source, color, targetColor)
        );

        if (availableTargets.length !== 1) {
            return;
        }

        this._applyPreviewPayment(source, color, availableTargets[0]);
    }

    public onPreviewDragEnd(): void {
        this._previewDragContext = null;
    }

    public onPreviewSourceHoverStart(source: PreviewPaymentSource, color: Color, unitIndex?: number): void {
        if (source === 'token' && this.isPreviewTokenDisabled(color)) {
            return;
        }

        if (source === 'card' && this.isPreviewPassiveCardDisabled(color)) {
            return;
        }

        if (color === 'purple' && typeof unitIndex === 'number') {
            const availableCount = source === 'token' ? (this.previewTokenPoolDraft['purple'] ?? 0) : this.previewPurpleCardUnitsDraft;
            if (unitIndex >= availableCount) {
                return;
            }
        }

        this._previewHoverContext = { source, color, unitIndex };
    }

    public onPreviewSourceHoverEnd(): void {
        if (this._previewDragContext) {
            return;
        }
        this._previewHoverContext = null;
    }

    public isPreviewSourceFocused(source: PreviewPaymentSource, color: Color, unitIndex?: number): boolean {
        const context = this._resolvePreviewInteractionContext();
        if (!context || context.source !== source || context.color !== color) {
            return false;
        }

        if (context.color === 'purple' && typeof context.unitIndex === 'number') {
            return context.unitIndex === unitIndex;
        }

        return true;
    }

    public isPreviewNeedTargetFocused(color: Color): boolean {
        const context = this._resolvePreviewInteractionContext();
        if (!context) {
            return false;
        }

        return this._canPreviewPayTarget(context.source, context.color, color);
    }

    public onPreviewNeedDragOver(targetColor: Color, event: DragEvent): void {
        if (!this._previewDragContext) {
            return;
        }

        if (!this._canPreviewPayTarget(this._previewDragContext.source, this._previewDragContext.color, targetColor)) {
            return;
        }

        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
    }

    public onPreviewNeedDrop(targetColor: Color, event: DragEvent): void {
        event.preventDefault();
        const context = this._previewDragContext;
        this._previewDragContext = null;
        this._previewHoverContext = null;
        if (!context) {
            return;
        }

        if (!this._canPreviewPayTarget(context.source, context.color, targetColor)) {
            return;
        }

        this._applyPreviewPayment(context.source, context.color, targetColor);
    }

    private _initPurplePurchasePreviewDraft(): void {
        this.previewNeedToPayDraft = { ...this.purplePreviewNeedToPayTokens };
        this.previewTokenPoolDraft = { ...this.purplePreviewPlayerHandTokens };
        this.previewTokenPoolBase = { ...this.purplePreviewPlayerHandTokens };
        this.previewPurpleCardUnitsDraft = Math.max(
            (this.purplePreviewPlayerPassiveCards['purple'] ?? 0) - this.previewAutoAppliedPurplePassiveCards,
            0
        );
        this.previewPurpleCardUnitsBase = this.purplePreviewPlayerPassiveCards['purple'] ?? 0;

        // Auto-apply same-color tokens only when there are no draggable passive purple cards left.
        if (this.previewPurpleCardUnitsDraft <= 0) {
            this._autoApplyPreviewMatchingTokens();
        }

        this._previewDragContext = null;
        this._previewHoverContext = null;
    }

    private _resolvePreviewInteractionContext(): PreviewInteractionContext | null {
        if (this._previewDragContext && this._isPreviewInteractionContextAvailable(this._previewDragContext)) {
            return this._previewDragContext;
        }

        if (this._previewHoverContext && this._isPreviewInteractionContextAvailable(this._previewHoverContext)) {
            return this._previewHoverContext;
        }

        return null;
    }

    private _isPreviewInteractionContextAvailable(context: PreviewInteractionContext): boolean {
        if (!context) {
            return false;
        }

        const { source, color, unitIndex } = context;

        if (source === 'token') {
            const amount = this.previewTokenPoolDraft[color] ?? 0;
            if (amount <= 0) {
                return false;
            }

            if (color === 'purple' && typeof unitIndex === 'number' && unitIndex >= amount) {
                return false;
            }
        }

        if (source === 'card') {
            if (color !== 'purple' || this.previewPurpleCardUnitsDraft <= 0) {
                return false;
            }

            if (typeof unitIndex === 'number' && unitIndex >= this.previewPurpleCardUnitsDraft) {
                return false;
            }
        }

        return this._getPreviewPayTargetCount(source, color) > 0;
    }

    private _getPreviewGuidanceMode(): 'click' | 'drag' | null {
        const context = this._resolvePreviewInteractionContext();
        if (!context) {
            return null;
        }

        const targetCount = this._getPreviewPayTargetCount(context.source, context.color);
        if (targetCount <= 0) {
            return null;
        }

        return targetCount === 1 ? 'click' : 'drag';
    }

    private _getPreviewPayTargetCount(source: PreviewPaymentSource, sourceColor: Color): number {
        return this.previewModalColors.reduce((acc, targetColor) => {
            if (this._canPreviewPayTarget(source, sourceColor, targetColor)) {
                return acc + 1;
            }
            return acc;
        }, 0);
    }

    private _autoApplyPreviewMatchingTokens(): void {
        for (const color of this.previewModalColors) {
            const need = this.previewNeedToPayDraft[color] ?? 0;
            if (need <= 0) {
                continue;
            }

            const available = this.previewTokenPoolDraft[color] ?? 0;
            const applied = Math.min(need, available);
            if (applied <= 0) {
                continue;
            }

            this.previewNeedToPayDraft[color] = need - applied;
            this.previewTokenPoolDraft[color] = available - applied;
        }
    }

    private _hasPreviewNeedForAny(colors: Color[]): boolean {
        return colors.some((color) => (this.previewNeedToPayDraft[color] ?? 0) > 0);
    }

    private _canPreviewPayTarget(source: PreviewPaymentSource, sourceColor: Color, targetColor: Color): boolean {
        if ((this.previewNeedToPayDraft[targetColor] ?? 0) <= 0) {
            return false;
        }

        if (source === 'token') {
            if ((this.previewTokenPoolDraft[sourceColor] ?? 0) <= 0) {
                return false;
            }

            if (sourceColor === 'purple') {
                return this.previewPurpleWildcardTargets.includes(targetColor)
                    || (targetColor === 'black' && this._canDarkMasterPayFromColor(sourceColor));
            }

            if (sourceColor === targetColor) {
                return true;
            }

            if (targetColor === 'black' && this._canDarkMasterPayFromColor(sourceColor)) {
                return true;
            }

            if (this._canMagicMasterPayFromColor(sourceColor, targetColor)) {
                return true;
            }

            if (this._canMasterPayFromColor(sourceColor, targetColor)) {
                return true;
            }

            return sourceColor === targetColor;
        }

        if (sourceColor !== 'purple') {
            return false;
        }

        if (this.previewPurpleCardUnitsDraft <= 0) {
            return false;
        }

        return this.previewPurpleWildcardTargets.includes(targetColor);
    }

    private _canMasterPayFromColor(sourceColor: Color, targetColor: Color): boolean {
        if (!this._isElementalColor(sourceColor) || !this._isElementalColor(targetColor)) {
            return false;
        }

        return this._getActivePlayerMasterElementalColors().includes(targetColor);
    }

    private _canMagicMasterPayFromColor(sourceColor: Color, targetColor: Color): boolean {
        if (!this._hasActivePlayerMagicMaster()) {
            return false;
        }

        return this._isMagicWildcardColor(sourceColor) && this._isMagicWildcardColor(targetColor);
    }

    private _canDarkMasterPayFromColor(sourceColor: Color): boolean {
        if (!this._hasActivePlayerDarkMaster()) {
            return false;
        }

        return sourceColor === 'black' || this._isMagicWildcardColor(sourceColor);
    }

    private _resolveOwnedMasterColor(masterCard: OwnedMasterCard): Color | null {
        if (masterCard.color) {
            return masterCard.color;
        }

        const mappedCard = masterCards.find((card) => card.orderNumber === masterCard.orderNumber);
        return (mappedCard?.color as Color | undefined) ?? null;
    }

    private _isElementalColor(color: Color): color is 'red' | 'green' | 'white' | 'blue' {
        return color === 'red' || color === 'green' || color === 'white' || color === 'blue';
    }

    private _applyPreviewPayment(source: PreviewPaymentSource, sourceColor: Color, targetColor: Color): void {
        this.previewNeedToPayDraft[targetColor] = Math.max((this.previewNeedToPayDraft[targetColor] ?? 0) - 1, 0);

        if (source === 'token') {
            this.previewTokenPoolDraft[sourceColor] = Math.max((this.previewTokenPoolDraft[sourceColor] ?? 0) - 1, 0);
            if (this._previewHoverContext && !this._isPreviewInteractionContextAvailable(this._previewHoverContext)) {
                this._previewHoverContext = null;
            }
            if (this._previewDragContext && !this._isPreviewInteractionContextAvailable(this._previewDragContext)) {
                this._previewDragContext = null;
            }
            return;
        }

        this.previewPurpleCardUnitsDraft = Math.max(this.previewPurpleCardUnitsDraft - 1, 0);
        if (this._previewHoverContext && !this._isPreviewInteractionContextAvailable(this._previewHoverContext)) {
            this._previewHoverContext = null;
        }
        if (this._previewDragContext && !this._isPreviewInteractionContextAvailable(this._previewDragContext)) {
            this._previewDragContext = null;
        }
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
            || (this._lastClosedRollCount > 0 && !this._lastClosedRollWasBonusAction)
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
        if (this.hasWinner) {
            return;
        }

        if (!this.canUseBonusMarket) {
            return;
        }

        this.showBonusShopModal = true;
    }

    public closeBonusShopModal(): void {
        if (this.showBonusShopMixModal) {
            return;
        }

        if (this.hasBonusShopActionStarted && !this.canCancelBonusShopModal) {
            return;
        }

        this._rollbackCancelableBonusShopAction();

        this.showBonusShopModal = false;
    }

    public get canCancelBonusShopModal(): boolean {
        // Cancel should always close the modal. For rollback-capable actions
        // rollback is handled in closeBonusShopModal(); for non-rollback actions,
        // close simply dismisses the modal without resetting state.
        return true;
    }

    public onBonusShopRewardClick(reward: BonusShopReward, rule: BonusShopRule, rewardIndex: number): void {
        if (!this._isBonusShopRewardSelectable(reward) || this.isBonusShopRewardDisabled(rule, rewardIndex)) {
            return;
        }

        const cost = Math.max(0, Math.floor(rule.blackCost));
        if (cost <= 0) {
            return;
        }

        const rewardKey = this._buildBonusShopRewardKey(cost, rewardIndex);

        const playerHex = this.playerHexagons[this.activePlayer];
        if (!playerHex) {
            return;
        }

        if (this._getActivePlayerBonusShopBlackBalance() < cost) {
            return;
        }

        if (reward.color === 'mix') {
            this._openBonusShopMixModal(reward, cost, rewardKey);
            return;
        }

        if (this._isBonusShopExtraTurnReward(reward)) {
            this._openBonusShopExtraTurnModal(cost, rewardKey);
            return;
        }

        const masterKind = this._getBonusShopMasterKind(reward);
        if (masterKind) {
            this._openBonusShopMasterModal(masterKind, cost, rewardKey);
            return;
        }

        const freeCardLevel = this._getBonusShopFreeCardLevel(reward);
        if (freeCardLevel > 0) {
            this._openBonusShopFreeCardModal(freeCardLevel, cost, rewardKey);
            return;
        }

        if (reward.color === 'purple') {
            const purpleAmount = this._getBonusShopPurpleRewardAmount(reward);
            const purpleInBank = this.gameBankHexagons['purple'] ?? 0;
            if (purpleInBank < purpleAmount) {
                return;
            }

            const blackSpend = this._spendActivePlayerBlackForBonusMarket(cost);
            if (!blackSpend) {
                return;
            }

            this._applyBonusShopActiveSpendToGameBank(blackSpend.spentFromActiveByColor);
            playerHex['purple'] = (playerHex['purple'] ?? 0) + purpleAmount;
            this.gameBankHexagons['purple'] = Math.max(purpleInBank - purpleAmount, 0);
            this.hasBonusShopActionStarted = true;
            this.usedBonusShopRewardKeysThisTurn.add(rewardKey);
            this._pendingCancelableBonusShopAction = {
                kind: 'purple',
                spentBlackFromPassive: blackSpend.spentFromPassive,
                spentActiveByColor: { ...blackSpend.spentFromActiveByColor },
                gainedPurple: purpleAmount,
                rewardKey,
            };
            return;
        }

        if (reward.color !== 'dice') {
            return;
        }

        const rollCount = reward.rollCount ?? 0;
        if (rollCount <= 0) {
            return;
        }

        const blackSpend = this._spendActivePlayerBlackForBonusMarket(cost);
        if (!blackSpend) {
            return;
        }

        this.showBonusShopModal = false;
        this._applyBonusShopActiveSpendToGameBank(blackSpend.spentFromActiveByColor);
        this.hasBonusShopActionStarted = true;
        this.usedBonusShopRewardKeysThisTurn.add(rewardKey);
        this._pendingCancelableBonusShopAction = null;
        this._lastClosedRollWasBonusAction = true;
        this.rollDice(rollCount);
    }

    public get bonusShopMixColors(): BonusShopMixColor[] {
        return this._bonusShopMixColors;
    }

    public get bonusShopMixRequiredCount(): number {
        const totalAvailable = this._bonusShopMixColors.reduce((total, color) => {
            return total + (this.bonusShopMixDraftBankHexagons[color] ?? 0) + (this.bonusShopMixDraftHandHexagons[color] ?? 0);
        }, 0);

        return Math.min(this.bonusShopMixSelectionLimit, totalAvailable);
    }

    public get bonusShopMixSelectedCount(): number {
        return this._bonusShopMixColors.reduce((total, color) => {
            return total + (this.bonusShopMixDraftHandHexagons[color] ?? 0);
        }, 0);
    }

    public get canApplyBonusShopMix(): boolean {
        return this.bonusShopMixRequiredCount > 0
            && this.bonusShopMixSelectedCount === this.bonusShopMixRequiredCount
            && this._getActivePlayerBonusShopBlackBalance() >= this._pendingBonusShopMixBlackCost;
    }

    public isBonusShopMixBankDisabled(color: BonusShopMixColor): boolean {
        const bankValue = this.bonusShopMixDraftBankHexagons[color] ?? 0;
        return bankValue <= 0 || this.bonusShopMixSelectedCount >= this.bonusShopMixRequiredCount;
    }

    public isBonusShopMixHandDisabled(color: BonusShopMixColor): boolean {
        return (this.bonusShopMixDraftHandHexagons[color] ?? 0) <= 0;
    }

    public onBonusShopMixBankClick(color: BonusShopMixColor): void {
        if (this.isBonusShopMixBankDisabled(color)) {
            return;
        }

        this.bonusShopMixDraftBankHexagons[color] = (this.bonusShopMixDraftBankHexagons[color] ?? 0) - 1;
        this.bonusShopMixDraftHandHexagons[color] = (this.bonusShopMixDraftHandHexagons[color] ?? 0) + 1;
    }

    public onBonusShopMixHandClick(color: BonusShopMixColor): void {
        if (this.isBonusShopMixHandDisabled(color)) {
            return;
        }

        this.bonusShopMixDraftHandHexagons[color] = (this.bonusShopMixDraftHandHexagons[color] ?? 0) - 1;
        this.bonusShopMixDraftBankHexagons[color] = (this.bonusShopMixDraftBankHexagons[color] ?? 0) + 1;
    }

    public applyBonusShopMixSelection(): void {
        if (!this.canApplyBonusShopMix) {
            return;
        }

        const playerHex = this.playerHexagons[this.activePlayer];
        if (!playerHex) {
            return;
        }

        if (this._getActivePlayerBonusShopBlackBalance() < this._pendingBonusShopMixBlackCost) {
            return;
        }

        const blackSpend = this._spendActivePlayerBlackForBonusMarket(this._pendingBonusShopMixBlackCost);
        if (!blackSpend) {
            return;
        }

        this._applyBonusShopActiveSpendToGameBank(blackSpend.spentFromActiveByColor);

        for (const color of this._bonusShopMixColors) {
            const selectedCount = this.bonusShopMixDraftHandHexagons[color] ?? 0;
            if (selectedCount <= 0) {
                continue;
            }

            this.gameBankHexagons[color] = Math.max((this.gameBankHexagons[color] ?? 0) - selectedCount, 0);
            playerHex[color] = (playerHex[color] ?? 0) + selectedCount;
        }

        this.hasBonusShopActionStarted = true;
        if (this._pendingBonusShopMixRewardKey) {
            this.usedBonusShopRewardKeysThisTurn.add(this._pendingBonusShopMixRewardKey);
        }
        this._resetBonusShopMixDraft();
    }

    public cancelBonusShopMixSelection(): void {
        this._resetBonusShopMixDraft();
    }

    public get canApplyBonusShopExtraTurn(): boolean {
        if (!this.showBonusShopExtraTurnModal) {
            return false;
        }

        if (this._isActivePlayerExtraTurnInProgress) {
            return false;
        }

        return this._pendingBonusShopExtraTurnBlackCost > 0
            && this._getActivePlayerBonusShopBlackBalance() >= this._pendingBonusShopExtraTurnBlackCost;
    }

    public applyBonusShopExtraTurnSelection(): void {
        if (!this.canApplyBonusShopExtraTurn) {
            return;
        }

        const playerHex = this.playerHexagons[this.activePlayer];
        if (!playerHex) {
            return;
        }

        if (this._getActivePlayerBonusShopBlackBalance() < this._pendingBonusShopExtraTurnBlackCost) {
            return;
        }

        const blackSpend = this._spendActivePlayerBlackForBonusMarket(this._pendingBonusShopExtraTurnBlackCost);
        if (!blackSpend) {
            return;
        }

        this._applyBonusShopActiveSpendToGameBank(blackSpend.spentFromActiveByColor);

        if (this._pendingBonusShopExtraTurnRewardKey) {
            this.usedBonusShopRewardKeysThisTurn.add(this._pendingBonusShopExtraTurnRewardKey);
        }

        this._pendingCancelableBonusShopAction = null;
        this.hasBonusShopActionStarted = false;
        this.showBonusShopModal = false;
        this._resetBonusShopExtraTurnDraft(false);
        this._startExtraTurnForActivePlayer();
    }

    public cancelBonusShopExtraTurnSelection(): void {
        if (this.hasBonusShopActionStarted) {
            return;
        }

        this._resetBonusShopExtraTurnDraft(true);
    }

    public onBonusShopFreeCardClick(card: Card): void {
        if (!this.showBonusShopFreeCardModal || this.hasBonusShopActionStarted) {
            return;
        }

        if (!card) {
            return;
        }

        const isCandidate = this.bonusShopFreeCardChoices.some((candidate) => candidate.orderNumber === card.orderNumber);
        if (!isCandidate || this.isCardPending(card)) {
            return;
        }

        this.selectedBonusShopFreeCardOrderNumber = card.orderNumber;
    }

    public get canApplyBonusShopFreeCardSelection(): boolean {
        if (this.hasBonusShopActionStarted) {
            return false;
        }

        if (!this.showBonusShopFreeCardModal || this.selectedBonusShopFreeCardOrderNumber === null) {
            return false;
        }

        if (this._getActivePlayerBonusShopBlackBalance() < this._pendingBonusShopFreeCardBlackCost) {
            return false;
        }

        return this.bonusShopFreeCardChoices.some((card) => card.orderNumber === this.selectedBonusShopFreeCardOrderNumber);
    }

    public isBonusShopFreeCardSelected(card: Card): boolean {
        if (!card || this.selectedBonusShopFreeCardOrderNumber === null) {
            return false;
        }

        return card.orderNumber === this.selectedBonusShopFreeCardOrderNumber;
    }

    public applyBonusShopFreeCardSelection(): void {
        if (!this.canApplyBonusShopFreeCardSelection) {
            return;
        }

        const playerHex = this.playerHexagons[this.activePlayer];
        if (!playerHex) {
            return;
        }

        const selectedCard = this.bonusShopFreeCardChoices.find((card) => card.orderNumber === this.selectedBonusShopFreeCardOrderNumber);
        if (!selectedCard) {
            return;
        }

        if (this._getActivePlayerBonusShopBlackBalance() < this._pendingBonusShopFreeCardBlackCost) {
            return;
        }

        const blackSpend = this._spendActivePlayerBlackForBonusMarket(this._pendingBonusShopFreeCardBlackCost);
        if (!blackSpend) {
            return;
        }

        this._applyBonusShopActiveSpendToGameBank(blackSpend.spentFromActiveByColor);

        const acquired = this._acquireCardForActivePlayer(selectedCard, false, undefined, 'bonus-action', false);
        if (!acquired) {
            this._spendActivePlayerPassiveBlackForTurn(-blackSpend.spentFromPassive);
            this._rollbackBonusShopActiveSpendFromGameBank(blackSpend.spentFromActiveByColor, playerHex);
            return;
        }

        if (this._pendingBonusShopFreeCardRewardKey) {
            this.usedBonusShopRewardKeysThisTurn.add(this._pendingBonusShopFreeCardRewardKey);
        }

        this.hasBonusShopActionStarted = false;
        this._pendingCancelableBonusShopAction = null;
        this._resetBonusShopFreeCardDraft(false);
        this.showBonusShopModal = false;
    }

    public cancelBonusShopFreeCardSelection(): void {
        if (this.hasBonusShopActionStarted) {
            return;
        }

        this._resetBonusShopFreeCardDraft(true);
    }

    public onBonusShopMasterCardClick(card: MasterCard): void {
        if (!this.showBonusShopMasterModal || this.hasBonusShopActionStarted) {
            return;
        }

        if (!card || this._isMasterCardUnavailable(card, this.bonusShopMasterKind)) {
            return;
        }

        this.selectedBonusShopMasterOrderNumber = card.orderNumber;
    }

    public isBonusShopMasterCardSelected(card: MasterCard): boolean {
        if (!card || this.selectedBonusShopMasterOrderNumber === null) {
            return false;
        }

        return card.orderNumber === this.selectedBonusShopMasterOrderNumber;
    }

    public isBonusShopMasterCardDisabled(card: MasterCard): boolean {
        return this._isMasterCardUnavailable(card, this.bonusShopMasterKind);
    }

    public get canApplyBonusShopMasterSelection(): boolean {
        if (this.hasBonusShopActionStarted) {
            return false;
        }

        if (!this.showBonusShopMasterModal || this.selectedBonusShopMasterOrderNumber === null) {
            return false;
        }

        if (this._getActivePlayerBonusShopBlackBalance() < this._pendingBonusShopMasterBlackCost) {
            return false;
        }

        const selectedCard = this.bonusShopMasterChoices.find((card) => card.orderNumber === this.selectedBonusShopMasterOrderNumber);
        if (!selectedCard) {
            return false;
        }

        return !this._isMasterCardUnavailable(selectedCard, this.bonusShopMasterKind);
    }

    public applyBonusShopMasterSelection(): void {
        if (!this.canApplyBonusShopMasterSelection) {
            return;
        }

        const playerHex = this.playerHexagons[this.activePlayer];
        if (!playerHex) {
            return;
        }

        const selectedCard = this.bonusShopMasterChoices.find((card) => card.orderNumber === this.selectedBonusShopMasterOrderNumber);
        if (!selectedCard || this._isMasterCardUnavailable(selectedCard, this.bonusShopMasterKind)) {
            return;
        }

        const blackSpend = this._spendActivePlayerBlackForBonusMarket(this._pendingBonusShopMasterBlackCost);
        if (!blackSpend) {
            return;
        }

        this._applyBonusShopActiveSpendToGameBank(blackSpend.spentFromActiveByColor);

        const playerMasterCards = this.playerOwnedMasterCards[this.activePlayer] ?? [];
        playerMasterCards.push({
            orderNumber: selectedCard.orderNumber,
            name: selectedCard.text.en,
            image: selectedCard.image ?? '',
            grand: selectedCard.grand === true,
            color: selectedCard.color as Color,
        });
        this.playerOwnedMasterCards[this.activePlayer] = playerMasterCards;
        this._purchasedMasterCardOrderNumbers.add(selectedCard.orderNumber);

        if (this.bonusShopMasterKind === 'master') {
            this._mastersTakenThisTurn += 1;
        }

        if (this._pendingBonusShopMasterRewardKey) {
            this.usedBonusShopRewardKeysThisTurn.add(this._pendingBonusShopMasterRewardKey);
        }

        this.hasBonusShopActionStarted = false;
        this._pendingCancelableBonusShopAction = null;
        this._resetBonusShopMasterDraft(false);
        this.showBonusShopModal = false;
    }

    public cancelBonusShopMasterSelection(): void {
        if (this.hasBonusShopActionStarted) {
            return;
        }

        this._resetBonusShopMasterDraft(true);
    }

    public applyBonusShopBonuses(): void {
        if (!this.hasBonusShopActionStarted) {
            return;
        }

        this._pendingCancelableBonusShopAction = null;
        this.hasBonusShopActionStarted = false;
        this.showBonusShopModal = false;
        this._resetBonusShopMixDraft();
        this._resetBonusShopExtraTurnDraft(false);
        this._resetBonusShopFreeCardDraft(false);
        this._resetBonusShopMasterDraft(false);
    }

    private _rollbackCancelableBonusShopAction(): void {
        if (!this._pendingCancelableBonusShopAction) {
            return;
        }

        const pendingAction = this._pendingCancelableBonusShopAction;
        const playerHex = this.playerHexagons[this.activePlayer];
        if (!playerHex) {
            this._pendingCancelableBonusShopAction = null;
            this.hasBonusShopActionStarted = false;
            return;
        }

        if (pendingAction.kind === 'purple') {
            this._spendActivePlayerPassiveBlackForTurn(-pendingAction.spentBlackFromPassive);
            this._rollbackBonusShopActiveSpendFromGameBank(pendingAction.spentActiveByColor, playerHex);

            playerHex['purple'] = Math.max((playerHex['purple'] ?? 0) - pendingAction.gainedPurple, 0);
            this.gameBankHexagons['purple'] = (this.gameBankHexagons['purple'] ?? 0) + pendingAction.gainedPurple;

            this.usedBonusShopRewardKeysThisTurn.delete(pendingAction.rewardKey);
        }

        this._pendingCancelableBonusShopAction = null;
        this.hasBonusShopActionStarted = false;
    }

    private _openBonusShopMixModal(reward: BonusShopReward, blackCost: number, rewardKey: string): void {
        const selectionLimit = Math.max(1, Math.floor(reward.number ?? 1));

        for (const color of this._bonusShopMixColors) {
            this.bonusShopMixDraftBankHexagons[color] = this.gameBankHexagons[color] ?? 0;
            this.bonusShopMixDraftHandHexagons[color] = 0;
        }

        this._pendingBonusShopMixBlackCost = blackCost;
        this._pendingBonusShopMixRewardKey = rewardKey;
        this.bonusShopMixSelectionLimit = selectionLimit;
        this.showBonusShopModal = false;
        this.showBonusShopMixModal = true;
    }

    private _openBonusShopExtraTurnModal(blackCost: number, rewardKey: string): void {
        if (this._isActivePlayerExtraTurnInProgress) {
            return;
        }

        this._pendingBonusShopExtraTurnBlackCost = blackCost;
        this._pendingBonusShopExtraTurnRewardKey = rewardKey;
        this.showBonusShopModal = false;
        this.showBonusShopExtraTurnModal = true;
    }

    private _openBonusShopFreeCardModal(level: number, blackCost: number, rewardKey: string): void {
        const choices = this._getBonusShopFreeCardChoices(level);
        if (choices.length <= 0) {
            return;
        }

        this.bonusShopFreeCardChoices = [...choices];
        this.bonusShopFreeCardLevel = level;
        this.selectedBonusShopFreeCardOrderNumber = null;
        this._pendingBonusShopFreeCardBlackCost = blackCost;
        this._pendingBonusShopFreeCardRewardKey = rewardKey;
        this.showBonusShopModal = false;
        this.showBonusShopFreeCardModal = true;
    }

    private _openBonusShopMasterModal(kind: BonusShopMasterKind, blackCost: number, rewardKey: string): void {
        const choices = this._getBonusShopMasterChoices(kind);
        if (choices.length <= 0) {
            return;
        }

        this.bonusShopMasterKind = kind;
        this.bonusShopMasterChoices = [...choices];
        this.selectedBonusShopMasterOrderNumber = null;
        this._pendingBonusShopMasterBlackCost = blackCost;
        this._pendingBonusShopMasterRewardKey = rewardKey;
        this.showBonusShopModal = false;
        this.showBonusShopMasterModal = true;
    }

    private _resetBonusShopMixDraft(): void {
        this.showBonusShopMixModal = false;
        this.bonusShopMixSelectionLimit = 0;
        this._pendingBonusShopMixBlackCost = 0;
        this._pendingBonusShopMixRewardKey = '';

        for (const color of this._bonusShopMixColors) {
            this.bonusShopMixDraftBankHexagons[color] = 0;
            this.bonusShopMixDraftHandHexagons[color] = 0;
        }
    }

    private _resetBonusShopExtraTurnDraft(showBonusShopModalAfterReset: boolean): void {
        this.showBonusShopExtraTurnModal = false;
        this._pendingBonusShopExtraTurnBlackCost = 0;
        this._pendingBonusShopExtraTurnRewardKey = '';

        if (showBonusShopModalAfterReset) {
            this.showBonusShopModal = true;
        }
    }

    private _startExtraTurnForActivePlayer(): void {
        this._commitPendingPurchasedCards();

        this.hexagonsPickedThisTurn = 0;
        this.isFinishTurnUnlockedByDiceModal = false;
        this.isWaitingForPostRoll2Token = false;
        this._lastClosedRollCount = 0;
        this._lastClosedRollWasBonusAction = false;
        this.hasBonusShopActionStarted = false;
        this._setActivePlayerPassiveBlackTappedCount(0);
        this._mastersTakenThisTurn = 0;
        this._isActivePlayerExtraTurnInProgress = true;
        this.usedBonusShopRewardKeysThisTurn.clear();
        this._pendingCancelableBonusShopAction = null;
        this._resetBonusShopMixDraft();
        this._resetBonusShopExtraTurnDraft(false);
        this._resetBonusShopFreeCardDraft(false);
        this._resetBonusShopMasterDraft(false);
        this.pickedTokensThisTurn = [];

        this._updateTokensByDiceState();
        this._ensureActivePlayerPage();
        this._captureTurnStartState();
    }

    private _getActivePlayerBonusShopBlackBalance(): number {
        const playerHex = this.playerHexagons[this.activePlayer];
        const playerCards = this.playerCardHexagons[this.activePlayer];
        const totalPassiveBlack = Math.max(0, Math.floor(playerCards?.['black'] ?? 0));
        const availablePassiveBlack = Math.max(totalPassiveBlack - this._getActivePlayerPassiveBlackTappedCount(), 0);
        const activeBlack = Math.max(0, Math.floor(playerHex?.['black'] ?? 0));
        if (!this._hasActivePlayerDarkMaster()) {
            return availablePassiveBlack + activeBlack;
        }

        const convertedActive = this._sumActivePlayerTokens(['red', 'green', 'white', 'blue', 'purple']);
        return availablePassiveBlack + activeBlack + convertedActive;
    }

    private _spendActivePlayerBlackForBonusMarket(
        cost: number
    ): { spentFromPassive: number; spentFromActiveByColor: Partial<Record<Color, number>> } | null {
        const normalizedCost = Math.max(0, Math.floor(cost));
        if (normalizedCost <= 0) {
            return { spentFromPassive: 0, spentFromActiveByColor: {} };
        }

        const playerHex = this.playerHexagons[this.activePlayer];
        const playerCards = this.playerCardHexagons[this.activePlayer];
        if (!playerHex || !playerCards) {
            return null;
        }

        const passiveBlack = Math.max((playerCards['black'] ?? 0) - this._getActivePlayerPassiveBlackTappedCount(), 0);
        const activeBlack = playerHex['black'] ?? 0;
        const spentFromActiveByColor: Partial<Record<Color, number>> = {};
        const convertedActiveTotal = this._hasActivePlayerDarkMaster()
            ? this._sumActivePlayerTokens(['red', 'green', 'white', 'blue', 'purple'])
            : 0;
        if (passiveBlack + activeBlack + convertedActiveTotal < normalizedCost) {
            return null;
        }

        const spentFromPassive = Math.min(passiveBlack, normalizedCost);
        let remaining = normalizedCost - spentFromPassive;

        const spentFromBlack = Math.min(activeBlack, remaining);
        if (spentFromBlack > 0) {
            playerHex['black'] = activeBlack - spentFromBlack;
            spentFromActiveByColor['black'] = spentFromBlack;
            remaining -= spentFromBlack;
        }

        if (remaining > 0 && this._hasActivePlayerDarkMaster()) {
            const donorColors: Color[] = ['red', 'green', 'white', 'blue', 'purple'];
            for (const donorColor of donorColors) {
                const donorAvailable = Math.max(0, Math.floor(playerHex[donorColor] ?? 0));
                if (donorAvailable <= 0) {
                    continue;
                }

                const donorSpend = Math.min(donorAvailable, remaining);
                playerHex[donorColor] = donorAvailable - donorSpend;
                spentFromActiveByColor[donorColor] = (spentFromActiveByColor[donorColor] ?? 0) + donorSpend;
                remaining -= donorSpend;

                if (remaining <= 0) {
                    break;
                }
            }
        }

        if (remaining > 0) {
            return null;
        }

        this._spendActivePlayerPassiveBlackForTurn(spentFromPassive);

        return { spentFromPassive, spentFromActiveByColor };
    }

    private _sumActivePlayerTokens(colors: Color[]): number {
        const playerHex = this.playerHexagons[this.activePlayer];
        if (!playerHex) {
            return 0;
        }

        return colors.reduce((sum, color) => sum + Math.max(0, Math.floor(playerHex[color] ?? 0)), 0);
    }

    private _applyBonusShopActiveSpendToGameBank(spendByColor: Partial<Record<Color, number>>): void {
        for (const color of this._turnTrackedColors) {
            const spent = Math.max(0, Math.floor(spendByColor[color] ?? 0));
            if (spent <= 0) {
                continue;
            }

            this.gameBankHexagons[color] = (this.gameBankHexagons[color] ?? 0) + spent;
        }
    }

    private _rollbackBonusShopActiveSpendFromGameBank(
        spendByColor: Partial<Record<Color, number>>,
        playerHex: { [key in Color]?: number }
    ): void {
        for (const color of this._turnTrackedColors) {
            const spent = Math.max(0, Math.floor(spendByColor[color] ?? 0));
            if (spent <= 0) {
                continue;
            }

            playerHex[color] = (playerHex[color] ?? 0) + spent;
            this.gameBankHexagons[color] = Math.max((this.gameBankHexagons[color] ?? 0) - spent, 0);
        }
    }

    private _getActivePlayerPassiveBlackTappedCount(): number {
        return this._playerPassiveBlackTappedThisTurn[this.activePlayer] ?? 0;
    }

    private _setActivePlayerPassiveBlackTappedCount(value: number): void {
        const playerCards = this.playerCardHexagons[this.activePlayer];
        const maxPassiveBlack = Math.max(0, Math.floor(playerCards?.['black'] ?? 0));
        const normalizedValue = Math.max(0, Math.min(Math.floor(value), maxPassiveBlack));
        this._playerPassiveBlackTappedThisTurn[this.activePlayer] = normalizedValue;
    }

    private _spendActivePlayerPassiveBlackForTurn(delta: number): number {
        const previous = this._getActivePlayerPassiveBlackTappedCount();
        this._setActivePlayerPassiveBlackTappedCount(previous + delta);
        const current = this._getActivePlayerPassiveBlackTappedCount();
        return current - previous;
    }

    private _resetBonusShopFreeCardDraft(showBonusShopModalAfterReset: boolean): void {
        this.showBonusShopFreeCardModal = false;
        this.bonusShopFreeCardLevel = 0;
        this.bonusShopFreeCardChoices = [];
        this.selectedBonusShopFreeCardOrderNumber = null;
        this._pendingBonusShopFreeCardBlackCost = 0;
        this._pendingBonusShopFreeCardRewardKey = '';

        if (showBonusShopModalAfterReset) {
            this.showBonusShopModal = true;
        }
    }

    private _resetBonusShopMasterDraft(showBonusShopModalAfterReset: boolean): void {
        this.showBonusShopMasterModal = false;
        this.bonusShopMasterKind = 'master';
        this.bonusShopMasterChoices = [];
        this.selectedBonusShopMasterOrderNumber = null;
        this._pendingBonusShopMasterBlackCost = 0;
        this._pendingBonusShopMasterRewardKey = '';

        if (showBonusShopModalAfterReset) {
            this.showBonusShopModal = true;
        }
    }

    private _acquireCardForActivePlayer(
        card: Card,
        grantBlackToken: boolean,
        specialStackKeyInput?: SpecialStackKey,
        pendingKind: 'sold' | 'bonus-action' = 'sold',
        lockCardPurchaseThisTurn: boolean = true
    ): boolean {
        if (!card) {
            return false;
        }

        const playerHex = this.playerHexagons[this.activePlayer];
        const playerCards = this.playerCardHexagons[this.activePlayer];
        if (!playerHex || !playerCards) {
            return false;
        }

        const specialStackKey = specialStackKeyInput ?? this._getSpecialStackPurchaseKey(card);
        if (specialStackKey) {
            if (this._playerHasSpecialStackPurchase(this.activePlayer, specialStackKey)
                || this._isSpecialStackClosedForAllPlayers(specialStackKey)) {
                return false;
            }
        }

        for (const color of this._purchaseBonusColors) {
            const bonusValue = card.get?.[color] ?? 0;
            if (bonusValue > 0) {
                playerCards[color] = (playerCards[color] ?? 0) + bonusValue;
            }
        }

        if (grantBlackToken) {
            playerHex['black'] = (playerHex['black'] ?? 0) + 1;
            const blackBankValue = this.gameBankHexagons['black'] ?? 0;
            this.gameBankHexagons['black'] = Math.max(blackBankValue - 1, 0);
        }

        if (pendingKind === 'bonus-action') {
            this._pendingBonusActionCardOrderNumbers.add(card.orderNumber);
        } else {
            this._pendingPurchasedCardOrderNumbers.add(card.orderNumber);
        }
        if (specialStackKey) {
            this._playerSpecialStackPurchases[this.activePlayer].add(specialStackKey);
        } else if (!card.levelBonus) {
            const playerLevelPurchases = this._playerNormalCardLevelPurchases[this.activePlayer];
            playerLevelPurchases[card.level] = (playerLevelPurchases[card.level] ?? 0) + 1;
        }

        this._checkForWinnerAfterPurchase();
        if (lockCardPurchaseThisTurn) {
            this.isFinishTurnUnlockedByDiceModal = true;
        }
        this._updateTokensByDiceState();
        return true;
    }

    public rollDice(count: number): void {
        if (this.hasWinner) {
            return;
        }

        // Reset modal draft roll state before generating a new roll to avoid stale calculations.
        this.modalRollResultsSnapshot = [];
        this.modalRemainingRollResults = [];
        this.modalConsumedDiceIndexes = [];

        const rollsCount = Math.max(0, Math.floor(count));
        const results: string[] = [];

        for (let i = 0; i < rollsCount; i++) {
            const finalIndex = Math.floor(Math.random() * this._diceSides.length);
            const finalResult = this._diceSides[finalIndex];
            results.push(finalResult);
        }

        const reels = this._buildReelsFromResults(results);
        this._applyDiceRollResults(results, reels);
        this._setDiceModalScrollLock(true);
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
            red: 0,
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

            if (this.areAllTokensToDiscardModalDisabled) {
                return true;
            }

            return false;
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

        const isBonusRollAction = this.hasBonusShopActionStarted;
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

        if (!isBonusRollAction) {
            this._lastClosedRollCount = rolledDiceCount;

            if (rolledDiceCount === 2) {
                const hasRegularTokenForRoll2Rule = regularPickedTokensCount >= 1;
                this.isFinishTurnUnlockedByDiceModal = hasRegularTokenForRoll2Rule;
                this.isWaitingForPostRoll2Token = !hasRegularTokenForRoll2Rule;
            } else {
                this.isFinishTurnUnlockedByDiceModal = true;
                this.isWaitingForPostRoll2Token = false;
            }
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
        this._setDiceModalScrollLock(false);
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

    private _setDiceModalScrollLock(locked: boolean): void {
        document.body.classList.toggle('dice-modal-open', locked);
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
        this._setActivePlayerPassiveBlackTappedCount(0);
        this._mastersTakenThisTurn = 0;
        this._isActivePlayerExtraTurnInProgress = false;
        this._ensureActivePlayerPage();
        this._captureTurnStartState();
    }

    private _ensureActivePlayerPage(): void {
        this.rightSidebarPage = Math.max(1, Math.ceil(this.activePlayer / this.playersPerSidebarPage));
        this.rightSidebarPage = Math.min(this.rightSidebarPage, this.totalSidebarPages);
    }

    private _buildCardPaymentPlan(
        card: Card,
        playerHex: { [key in Color]?: number },
        playerCards: { [key in Color]?: number }
    ): { isAffordable: boolean; spend: { [key in Color]?: number }; spentPassiveBlack: number } {
        const spend: { [key in Color]?: number } = {};
        let spentPassiveBlack = 0;

        for (const [key, value] of Object.entries(card.pay ?? {})) {
            if ((value ?? 0) > 0 && !this._turnTrackedColors.includes(key as Color)) {
                return { isAffordable: false, spend, spentPassiveBlack };
            }
        }

        const purpleCardBonus = playerCards['purple'] ?? 0;
        let purpleNeeded = Math.max((card.pay?.['purple'] ?? 0) - purpleCardBonus, 0);
        const hasDarkMaster = this._hasActivePlayerDarkMaster();
        const tokenPool: Partial<Record<Color, number>> = {
            red: playerHex['red'] ?? 0,
            green: playerHex['green'] ?? 0,
            white: playerHex['white'] ?? 0,
            blue: playerHex['blue'] ?? 0,
            purple: playerHex['purple'] ?? 0,
            black: playerHex['black'] ?? 0,
        };

        if (this._hasActivePlayerMagicMaster()) {
            const requiredBlack = card.pay?.['black'] ?? 0;
            const passiveBlack = Math.max((playerCards['black'] ?? 0) - this._getActivePlayerPassiveBlackTappedCount(), 0);
            let remainingBlack = Math.max(requiredBlack - passiveBlack, 0);
            spentPassiveBlack = Math.min(requiredBlack, passiveBlack);

            const blackTokenSpend = Math.min(remainingBlack, tokenPool['black'] ?? 0);
            remainingBlack -= blackTokenSpend;
            tokenPool['black'] = Math.max((tokenPool['black'] ?? 0) - blackTokenSpend, 0);
            if (blackTokenSpend > 0) {
                spend['black'] = blackTokenSpend;
            }

            if (remainingBlack > 0 && hasDarkMaster) {
                for (const donorColor of this._magicWildcardPayColors) {
                    const donorAvailable = tokenPool[donorColor] ?? 0;
                    if (donorAvailable <= 0) {
                        continue;
                    }

                    const donorSpend = Math.min(remainingBlack, donorAvailable);
                    tokenPool[donorColor] = donorAvailable - donorSpend;
                    spend[donorColor] = (spend[donorColor] ?? 0) + donorSpend;
                    remainingBlack -= donorSpend;

                    if (remainingBlack <= 0) {
                        break;
                    }
                }
            }

            if (remainingBlack > 0) {
                return { isAffordable: false, spend, spentPassiveBlack };
            }

            const nonBlackNeeds: Partial<Record<Color, number>> = {};
            for (const color of this._magicWildcardPayColors) {
                nonBlackNeeds[color] = Math.max(card.pay?.[color] ?? 0, 0);
            }

            const passivePool: Partial<Record<Color, number>> = {};
            for (const color of this._magicWildcardPayColors) {
                passivePool[color] = playerCards[color] ?? 0;
            }

            this._coverNeedsWithUniversalPool(nonBlackNeeds, passivePool);
            this._coverNeedsWithUniversalPool(nonBlackNeeds, tokenPool, spend);

            if (this._getTotalNeedForColors(nonBlackNeeds, this._magicWildcardPayColors) > 0) {
                return { isAffordable: false, spend, spentPassiveBlack };
            }

            return { isAffordable: true, spend, spentPassiveBlack };
        }

        const masteredColors = new Set<Color>(this._getActivePlayerMasterElementalColors());

        for (const color of this._purpleWildcardPayColors) {
            const required = card.pay?.[color] ?? 0;
            const passiveBonus = playerCards[color] ?? 0;
            let remainingAfterCoins = Math.max(required - passiveBonus, 0);

            const directSpend = Math.min(remainingAfterCoins, tokenPool[color] ?? 0);
            remainingAfterCoins -= directSpend;
            tokenPool[color] = Math.max((tokenPool[color] ?? 0) - directSpend, 0);

            if (directSpend > 0) {
                spend[color] = directSpend;
            }

            if (remainingAfterCoins > 0 && masteredColors.has(color)) {
                for (const donorColor of this._purpleWildcardPayColors) {
                    if (donorColor === color) {
                        continue;
                    }

                    const donorAvailable = tokenPool[donorColor] ?? 0;
                    if (donorAvailable <= 0) {
                        continue;
                    }

                    const donorSpend = Math.min(remainingAfterCoins, donorAvailable);
                    tokenPool[donorColor] = donorAvailable - donorSpend;
                    spend[donorColor] = (spend[donorColor] ?? 0) + donorSpend;
                    remainingAfterCoins -= donorSpend;

                    if (remainingAfterCoins <= 0) {
                        break;
                    }
                }
            }

            if (remainingAfterCoins <= 0) {
                continue;
            }

            purpleNeeded += remainingAfterCoins;
        }

        const availablePurple = tokenPool['purple'] ?? 0;
        if (availablePurple < purpleNeeded) {
            return { isAffordable: false, spend, spentPassiveBlack };
        }

        if (purpleNeeded > 0) {
            spend['purple'] = purpleNeeded;
            tokenPool['purple'] = Math.max(availablePurple - purpleNeeded, 0);
        }

        const requiredBlack = card.pay?.['black'] ?? 0;
        const passiveBlack = Math.max((playerCards['black'] ?? 0) - this._getActivePlayerPassiveBlackTappedCount(), 0);
        spentPassiveBlack = Math.min(requiredBlack, passiveBlack);
        let remainingBlackNeed = Math.max(requiredBlack - passiveBlack, 0);

        const directBlackSpend = Math.min(remainingBlackNeed, tokenPool['black'] ?? 0);
        if (directBlackSpend > 0) {
            spend['black'] = (spend['black'] ?? 0) + directBlackSpend;
            tokenPool['black'] = Math.max((tokenPool['black'] ?? 0) - directBlackSpend, 0);
            remainingBlackNeed -= directBlackSpend;
        }

        if (remainingBlackNeed > 0 && hasDarkMaster) {
            const darkMasterDonorColors: Color[] = ['red', 'green', 'white', 'blue', 'purple'];
            for (const donorColor of darkMasterDonorColors) {
                const donorAvailable = tokenPool[donorColor] ?? 0;
                if (donorAvailable <= 0) {
                    continue;
                }

                const donorSpend = Math.min(remainingBlackNeed, donorAvailable);
                tokenPool[donorColor] = donorAvailable - donorSpend;
                spend[donorColor] = (spend[donorColor] ?? 0) + donorSpend;
                remainingBlackNeed -= donorSpend;

                if (remainingBlackNeed <= 0) {
                    break;
                }
            }
        }

        if (remainingBlackNeed > 0) {
            return { isAffordable: false, spend, spentPassiveBlack };
        }

        return { isAffordable: true, spend, spentPassiveBlack };
    }

    private _coverNeedsWithUniversalPool(
        needs: Partial<Record<Color, number>>,
        pool: Partial<Record<Color, number>>,
        spend?: Partial<Record<Color, number>>
    ): void {
        for (const targetColor of this._magicWildcardPayColors) {
            let remaining = Math.max(needs[targetColor] ?? 0, 0);
            if (remaining <= 0) {
                needs[targetColor] = 0;
                continue;
            }

            const directAvailable = pool[targetColor] ?? 0;
            const directSpend = Math.min(remaining, directAvailable);
            if (directSpend > 0) {
                pool[targetColor] = directAvailable - directSpend;
                remaining -= directSpend;
                if (spend) {
                    spend[targetColor] = (spend[targetColor] ?? 0) + directSpend;
                }
            }

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
                    if (spend) {
                        spend[donorColor] = (spend[donorColor] ?? 0) + donorSpend;
                    }

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

    private _isMagicWildcardColor(color: Color): boolean {
        return this._magicWildcardPayColors.includes(color);
    }

    private _hasActivePlayerMagicMaster(): boolean {
        return this._getActivePlayerMasterColors().includes('purple');
    }

    private _hasActivePlayerDarkMaster(): boolean {
        return this._getActivePlayerMasterColors().includes('black');
    }

    private _getActivePlayerMasterColors(): Color[] {
        const ownedMasters = this.playerOwnedMasterCards[this.activePlayer] ?? [];
        const colors = new Set<Color>();

        for (const ownedMaster of ownedMasters) {
            const resolvedColor = this._resolveOwnedMasterColor(ownedMaster);
            if (resolvedColor && this._turnTrackedColors.includes(resolvedColor)) {
                colors.add(resolvedColor);
            }
        }

        return Array.from(colors);
    }

    private _getActivePlayerMasterElementalColors(): Color[] {
        const colors = new Set<Color>();
        for (const resolvedColor of this._getActivePlayerMasterColors()) {
            if (resolvedColor === 'red' || resolvedColor === 'green' || resolvedColor === 'white' || resolvedColor === 'blue') {
                colors.add(resolvedColor);
            }
        }

        return Array.from(colors);
    }

    private _commitPendingPurchasedCards(): void {
        if (this._pendingPurchasedCardOrderNumbers.size === 0 && this._pendingBonusActionCardOrderNumbers.size === 0) {
            return;
        }

        const cardsPerRow = this._getCardsPerRow();

        for (const row of this.rows) {
            row.stack = row.stack.filter(
                (card) => !this._pendingPurchasedCardOrderNumbers.has(card.orderNumber)
                    && !this._pendingBonusActionCardOrderNumbers.has(card.orderNumber)
            );
            row.topCards = row.stack.slice(0, cardsPerRow);

            for (const specialStack of row.specialStacks) {
                specialStack.stack = specialStack.stack.filter(
                    (card) => !this._pendingPurchasedCardOrderNumbers.has(card.orderNumber)
                        && !this._pendingBonusActionCardOrderNumbers.has(card.orderNumber)
                );
                specialStack.topCard = specialStack.stack[0];
            }
        }

        this._pendingPurchasedCardOrderNumbers.clear();
        this._pendingBonusActionCardOrderNumbers.clear();
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

        this._turnStartPlayerSpecialStackPurchases = new Set<SpecialStackKey>(
            this._playerSpecialStackPurchases[this.activePlayer]
        );
        this._turnStartPlayerNormalCardLevelPurchases = {
            ...this._playerNormalCardLevelPurchases[this.activePlayer]
        };
        this._turnStartPassiveBlackTappedCount = this._getActivePlayerPassiveBlackTappedCount();
        this._turnStartPlayerOwnedMasterCards = (this.playerOwnedMasterCards[this.activePlayer] ?? []).map((card) => ({ ...card }));
        this._turnStartPurchasedMasterCardOrderNumbers = new Set<number>(this._purchasedMasterCardOrderNumbers);
        this._turnStartMastersTakenThisTurn = this._mastersTakenThisTurn;
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

        const currentSpecialPurchases = this._playerSpecialStackPurchases[this.activePlayer];
        if (!this._areEqualSets(currentSpecialPurchases, this._turnStartPlayerSpecialStackPurchases)) {
            return true;
        }

        if (this._getActivePlayerPassiveBlackTappedCount() !== this._turnStartPassiveBlackTappedCount) {
            return true;
        }

        const currentPlayerMasters = this.playerOwnedMasterCards[this.activePlayer] ?? [];
        const currentMasterOrders = currentPlayerMasters.map((card) => card.orderNumber).sort((a, b) => a - b);
        const startMasterOrders = this._turnStartPlayerOwnedMasterCards.map((card) => card.orderNumber).sort((a, b) => a - b);
        if (currentMasterOrders.length !== startMasterOrders.length
            || currentMasterOrders.some((value, index) => value !== startMasterOrders[index])) {
            return true;
        }

        if (!this._areEqualNumberSets(this._purchasedMasterCardOrderNumbers, this._turnStartPurchasedMasterCardOrderNumbers)) {
            return true;
        }

        if (this._mastersTakenThisTurn !== this._turnStartMastersTakenThisTurn) {
            return true;
        }

        return false;
    }

    private _areEqualNumberSets(left: Set<number>, right: Set<number>): boolean {
        if (left.size !== right.size) {
            return false;
        }

        for (const value of left) {
            if (!right.has(value)) {
                return false;
            }
        }

        return true;
    }

    private _getSpecialStackPurchaseKey(card: Card | undefined): SpecialStackKey | null {
        if (!card?.levelSpecial || card.levelBonus) {
            return null;
        }

        if ((card.get?.purple ?? 0) > 0) {
            return this._buildSpecialStackKey(card.level, 'purple');
        }

        if ((card.get?.black ?? 0) > 0) {
            return this._buildSpecialStackKey(card.level, 'black');
        }

        return null;
    }

    private _buildSpecialStackKey(level: number, color: SpecialStackColor): SpecialStackKey {
        return `${level}-${color}`;
    }

    private _playerHasSpecialStackPurchase(playerNumber: number, specialStackKey: SpecialStackKey): boolean {
        const purchasedSpecialStacks = this._playerSpecialStackPurchases[playerNumber];
        if (!purchasedSpecialStacks) {
            return false;
        }

        return purchasedSpecialStacks.has(specialStackKey);
    }

    private _isSpecialStackClosedForAllPlayers(specialStackKey: SpecialStackKey): boolean {
        const activePlayersCount = this.playerCount ?? 0;
        if (activePlayersCount < 1) {
            return false;
        }

        for (let playerNumber = 1; playerNumber <= activePlayersCount; playerNumber++) {
            if (!this._playerHasSpecialStackPurchase(playerNumber, specialStackKey)) {
                return false;
            }
        }

        return true;
    }

    private _areEqualSets<T>(left: Set<T>, right: Set<T>): boolean {
        if (left.size !== right.size) {
            return false;
        }

        for (const item of left) {
            if (!right.has(item)) {
                return false;
            }
        }

        return true;
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

    private _getSpecialCardsPerStack(): number {
        const players = this.playerCount ?? 0;
        return players >= 5 ? 2 : 1;
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

    private _loadRowWinConditionCards(): void {
        const selectedMode: HowToWinCardType = this._settingsService.getWinConditionMode();
        const selectedOptions = this._settingsService.getSelectedWinConditionOptions().slice(0, 4);

        const cardsByOption = new Map<number, HowToWinCard>();
        for (const card of howToWinCards) {
            if (card.type !== selectedMode) {
                continue;
            }

            const option = card.option;
            if (!option || cardsByOption.has(option)) {
                continue;
            }

            cardsByOption.set(option, card);
        }

        this.rowWinConditionCards = [0, 1, 2, 3].map((rowIndex) => {
            const selectedOption = selectedOptions[rowIndex];
            if (!selectedOption) {
                return null;
            }

            return cardsByOption.get(selectedOption) ?? null;
        });
    }

    public closeVictoryModal(): void {
        this.showVictoryModal = false;
        this.showVictoryTiebreakModal = false;
    }

    public closeFinalRoundNoticeModal(): void {
        this.showFinalRoundNoticeModal = false;
    }

    private _checkForWinnerAfterPurchase(): void {
        const metCondition = this._getFirstMetWinConditionForPlayer(this.activePlayer);
        if (!metCondition) {
            return;
        }

        this._finalRoundQualifiedPlayers.add(this.activePlayer);

        if (!this._isFinalRoundActive) {
            this._isFinalRoundActive = true;
            this._finalRoundStartPlayer = this.activePlayer;
            this.finalRoundTriggerName = this.playerNames[this.activePlayer - 1] ?? `Player ${this.activePlayer}`;
            this.finalRoundTriggerConditionLabel = this._getWinConditionLabel(metCondition);
            this.showFinalRoundNoticeModal = true;
        }
    }

    private _getFirstMetWinConditionForPlayer(playerNumber: number): HowToWinCard | null {
        const activeConditions = this.rowWinConditionCards.filter((condition): condition is HowToWinCard => !!condition);

        for (const condition of activeConditions) {
            if (this._doesPlayerMeetWinCondition(playerNumber, condition)) {
                return condition;
            }
        }

        return null;
    }

    private _doesPlayerMeetWinCondition(playerNumber: number, condition: HowToWinCard): boolean {
        const playerCardBonuses = this.playerCardHexagons[playerNumber] ?? {};
        const playerSpecialPurchases = this._playerSpecialStackPurchases[playerNumber] ?? new Set<SpecialStackKey>();
        const playerLevelPurchases = this._playerNormalCardLevelPurchases[playerNumber] ?? { 1: 0, 2: 0, 3: 0, 4: 0 };
        const baseColorCounts = [
            playerCardBonuses['red'] ?? 0,
            playerCardBonuses['blue'] ?? 0,
            playerCardBonuses['white'] ?? 0,
            playerCardBonuses['green'] ?? 0,
        ];

        const oneOfFourTarget = condition.pay?.oneOf4 ?? 0;
        if (oneOfFourTarget > 0) {
            return baseColorCounts.some((count) => count >= oneOfFourTarget);
        }

        const twoOfFourTarget = condition.pay?.twoOf4 ?? 0;
        if (twoOfFourTarget > 0) {
            return baseColorCounts.filter((count) => count >= twoOfFourTarget).length >= 2;
        }

        if (condition.text === 'Dragon') {
            return playerSpecialPurchases.has(this._buildSpecialStackKey(4, 'purple'))
                || playerSpecialPurchases.has(this._buildSpecialStackKey(4, 'black'));
        }

        if (condition.text === 'Dragons') {
            return playerSpecialPurchases.has(this._buildSpecialStackKey(4, 'purple'))
                && playerSpecialPurchases.has(this._buildSpecialStackKey(4, 'black'));
        }

        if (condition.level) {
            const requiredCount = condition.numberOfElements ?? 0;
            return (playerLevelPurchases[condition.level] ?? 0) >= requiredCount;
        }

        const requiredBonuses = Object.entries(condition.pay ?? {}).filter(([, value]) => (value ?? 0) > 0);
        if (requiredBonuses.length > 0) {
            return requiredBonuses.every(([color, value]) => {
                return (playerCardBonuses[color as Color] ?? 0) >= (value ?? 0);
            });
        }

        return false;
    }

    private _declareWinner(playerNumber: number, condition: HowToWinCard): void {
        this.hasWinner = true;
        this.showVictoryModal = true;
        this.showVictoryTiebreakModal = false;
        this.winnerName = this.playerNames[playerNumber - 1] ?? `Player ${playerNumber}`;
        this.finalRoundWinnerName = this.winnerName;
        this.winnerConditionLabel = this._getWinConditionLabel(condition);
        this.showFinalRoundNoticeModal = false;
        this.showDiceModal = false;
        this.showBonusShopModal = false;
        this.showBonusShopMixModal = false;
        this.showBonusShopExtraTurnModal = false;
        this.showBonusShopFreeCardModal = false;
        this.showBonusShopMasterModal = false;
        this.showLuckyPurpleChoiceModal = false;
        this._setDiceModalScrollLock(false);
    }

    private _finalizeFinalRound(): boolean {
        const finalists = this._collectFinalRoundFinalists();
        if (finalists.length <= 0) {
            return false;
        }

        const standings = finalists.map((playerNumber) => ({
            playerNumber,
            playerName: this.playerNames[playerNumber - 1] ?? `Player ${playerNumber}`,
            passiveBonusTotal: this._getPlayerPassiveBonusTotal(playerNumber),
            isWinner: false,
        }));

        standings.sort((left, right) => {
            if (right.passiveBonusTotal !== left.passiveBonusTotal) {
                return right.passiveBonusTotal - left.passiveBonusTotal;
            }

            return left.playerNumber - right.playerNumber;
        });

        const winnerStanding = standings[0];
        if (!winnerStanding) {
            return false;
        }

        const topPassiveTotal = winnerStanding.passiveBonusTotal;
        const winnerStandings = standings.filter((standing) => standing.passiveBonusTotal === topPassiveTotal);
        const winnerNumbers = winnerStandings.map((standing) => standing.playerNumber);
        const winnerNames = winnerStandings.map((standing) => standing.playerName);

        const winnerCondition = this._getFirstMetWinConditionForPlayer(winnerStanding.playerNumber)
            ?? this.rowWinConditionCards.find((condition): condition is HowToWinCard => !!condition)
            ?? null;
        if (!winnerCondition) {
            return false;
        }

        this._declareWinner(winnerStanding.playerNumber, winnerCondition);

        if (standings.length > 1) {
            this.finalRoundStandings = standings.map((standing) => ({
                ...standing,
                isWinner: winnerNumbers.includes(standing.playerNumber),
            }));
            this.finalRoundWinnerName = winnerNames.join(', ');
            this.showVictoryModal = false;
            this.showVictoryTiebreakModal = true;
        } else {
            this.finalRoundStandings = [];
        }

        this._resetFinalRoundState();
        return true;
    }

    private _collectFinalRoundFinalists(): number[] {
        if (!this.playerCount || !this._isFinalRoundActive || this._finalRoundStartPlayer === null) {
            return [];
        }

        const finalists: number[] = [];
        for (let playerNumber = this._finalRoundStartPlayer; playerNumber <= this.playerCount; playerNumber++) {
            if (this._getFirstMetWinConditionForPlayer(playerNumber)) {
                finalists.push(playerNumber);
            }
        }

        return finalists;
    }

    private _getPlayerPassiveBonusTotal(playerNumber: number): number {
        const playerCardBonuses = this.playerCardHexagons[playerNumber] ?? {};
        return this._purchaseBonusColors.reduce((sum, color) => {
            return sum + (playerCardBonuses[color] ?? 0);
        }, 0);
    }

    private _resetFinalRoundState(): void {
        this._isFinalRoundActive = false;
        this._finalRoundStartPlayer = null;
        this._finalRoundQualifiedPlayers.clear();
        this.showFinalRoundNoticeModal = false;
        this.finalRoundTriggerName = '';
        this.finalRoundTriggerConditionLabel = '';
    }

    private _getWinConditionLabel(condition: HowToWinCard): string {
        if ((condition.pay?.oneOf4 ?? 0) > 0) {
            return `${condition.pay?.oneOf4} of 1 color`;
        }

        if ((condition.pay?.twoOf4 ?? 0) > 0) {
            return `${condition.pay?.twoOf4} of 2 colors`;
        }

        if (condition.text) {
            return condition.text;
        }

        if (condition.level) {
            return `${condition.numberOfElements ?? 0} of Level ${condition.level}`;
        }

        return '';
    }
}
