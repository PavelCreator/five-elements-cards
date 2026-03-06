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

type SpecialStackColor = 'purple' | 'black';

interface SpecialStack {
    color: SpecialStackColor;
    stack: Card[];
    topCard?: Card;
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
    public activePlayer: number = 1; // 1-based player number that's highlighted
    public playerNames: string[] = [];
    public editingPlayerIndex: number | null = null;
    public gameBankHexagons: { [key in Color]?: number } = {
        red: 4,
        blue: 4,
        white: 4,
        green: 4,
        purple: 4,
    };
    public playerHexagons: { [playerNumber: number]: { [key in Color]?: number } } = {
        1: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 0 },
        2: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 0 },
        3: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 0 },
        4: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 0 },
        5: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 0 },
        6: { red: 0, blue: 0, white: 0, green: 0, purple: 0, black: 0 },
    };
    public hexagonsPickedThisTurn: number = 0;
    public readonly maxHexagonsPerTurn: number = 2;
    private pickedTokensThisTurn: Color[] = [];
    public showDiceModal: boolean = false;
    public diceResults: string[] = [];
    public rows: Array<{
        level: number;
        stack: Card[];
        topCards: Card[];
        backUrl: string;
        specialStacks: SpecialStack[];
    }> = [];
    public printModeEnabled: boolean = true;
    private _cardsSubscription?: Subscription;
    private _printModeSubscription?: Subscription;
    private _resizeRaf?: number;

    constructor(
        private _cardsStoreService: CardsStoreService,
        private _imageService: ImageService,
        private _interactionService: InteractionService,
        private _localStorageService: LocalStorageService
    ) {}

    ngOnInit() {
        this._initPlayerNames();
        this._loadPlayerNames();
        this._loadPlayerCount();
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
        }
    }

    public isHexagonDisabled(color: Color): boolean {
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

    public finishTurn(): void {
        // Reset turn counter and picked tokens
        this.hexagonsPickedThisTurn = 0;
        this.pickedTokensThisTurn = [];
        
        // Move to next player
        if (!this.playerCount) return;
        
        let nextPlayer = this.activePlayer + 1;
        if (nextPlayer > this.playerCount) {
            nextPlayer = 1;
        }
        
        this.activePlayer = nextPlayer;
    }

    public cancelTokens(): void {
        // Return all picked tokens back to game bank
        const playerHex = this.playerHexagons[this.activePlayer];
        if (!playerHex) return;
        
        for (const color of this.pickedTokensThisTurn) {
            // Return token to bank
            const bankValue = this.gameBankHexagons[color];
            if (bankValue !== undefined) {
                this.gameBankHexagons[color] = bankValue + 1;
            }
            
            // Remove from player
            const playerValue = playerHex[color];
            if (playerValue !== undefined && playerValue > 0) {
                playerHex[color] = playerValue - 1;
            }
        }
        
        // Reset counters
        this.hexagonsPickedThisTurn = 0;
        this.pickedTokensThisTurn = [];
    }

    public get canFinishTurn(): boolean {
        return this.hexagonsPickedThisTurn >= this.maxHexagonsPerTurn;
    }

    public get canCancelTokens(): boolean {
        return this.hexagonsPickedThisTurn > 0;
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

    public rollDice(count: number): void {
        const diceSides = [
            'dices-blue.png',
            'dices-green.png',
            'dices-joker.png',
            'dices-nothing.png',
            'dices-red.png',
            'dices-white.png'
        ];
        const rollsCount = Math.max(0, Math.floor(count));
        const results: string[] = [];

        for (let i = 0; i < rollsCount; i++) {
            const index = Math.floor(Math.random() * diceSides.length);
            results.push(diceSides[index]);
        }
        
        this.diceResults = results;
        this.showDiceModal = true;
        console.log('rollDice results:', results);
    }

    public closeDiceModal(): void {
        this.showDiceModal = false;
        this.diceResults = [];
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
        if (!stored) return;
        const parsed = Number(stored);
        if (Number.isInteger(parsed) && parsed >= 2 && parsed <= 6) {
            this.playerCount = parsed;
            this._updatePlayerSlots();
        }
    }

    public selectPlayerCount(count: number) {
        if (count < 2 || count > 6) return;
        this.playerCount = count;
        this._localStorageService.setItem(this._playerCountKey, count.toString());
        this._updatePlayerSlots();
        this._scheduleScaleUpdate();
    }

    /** Public method to update left/right slots based on a provided count (2-6). */
    public updateSlots(count: number) {
        if (!Number.isInteger(count) || count < 2 || count > 6) return;
        this.playerCount = count;
        this._localStorageService.setItem(this._playerCountKey, count.toString());
        this._updatePlayerSlots();
        this._scheduleScaleUpdate();
    }

    /** Set which player (1..6) is active/highlighted. */
    public setActivePlayer(playerNumber: number) {
        if (!Number.isInteger(playerNumber) || playerNumber < 1 || playerNumber > 6) return;
        this.activePlayer = playerNumber;
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
