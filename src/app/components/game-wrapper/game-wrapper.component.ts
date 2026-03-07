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
    public diceReels: string[][] = []; // Array of arrays for dice animation reels
    public isDiceAnimationEnabled: boolean = true;
    public hasTwoNothings: boolean = false;
    public hasThreeNothings: boolean = false;
    public hasFourNothings: boolean = false;
    public hasJokers: boolean = false;
    public jokerCount: number = 0;
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
        
        // Initialize player hexagons based on any cross or joker mode
        if (this._settingsService.isCheckToCrossModeEnabled() || 
            this._settingsService.isCheckToThreeCrossModeEnabled() ||
            this._settingsService.isCheckToFourCrossModeEnabled() ||
            this._settingsService.isCheck2toJokersModeEnabled() ||
            this._settingsService.isCheck2to3JokersModeEnabled() ||
            this._settingsService.isCheck2to4JokersModeEnabled()) {
            this._initPlayerHexagonsWithTestTokens();
        }
        
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
        const reels: string[][] = [];
        const reelLength = 15; // Number of images in the reel
        
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
                const finalIndex = Math.floor(Math.random() * diceSides.length);
                finalResult = diceSides[finalIndex];
            }
            
            results.push(finalResult);
            
            // Generate reel for animation
            const reel: string[] = [];
            for (let j = 0; j < reelLength - 1; j++) {
                const randomIndex = Math.floor(Math.random() * diceSides.length);
                reel.push(diceSides[randomIndex]);
            }
            // Add final result as the last image
            reel.push(finalResult);
            reels.push(reel);
        }
        
        this.diceResults = results;
        this.diceReels = reels;
        
        // Check for crosses
        const nothingCount = results.filter(r => r === 'dices-nothing.png').length;
        this.hasTwoNothings = nothingCount === 2;
        this.hasThreeNothings = nothingCount === 3;
        this.hasFourNothings = nothingCount >= 4;
        this.selectedCancelChoices = [];
        
        // Check for jokers
        const jokerCount = results.filter(r => r === 'dices-joker.png').length;
        this.hasJokers = jokerCount > 0;
        this.jokerCount = jokerCount;
        this.selectedJokerExchanges = [];
        
        // Universal auto-select logic: if required selections equals available elements, auto-select all
        this._autoSelectIfNecessary();
        
        this.showDiceModal = true;
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
    }

    public isDiceDisabled(index: number): boolean {
        return this.selectedCancelChoices.some(
            choice => choice.type === 'dice' && choice.diceIndex === index
        );
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
        
        // Add basic colors (green, white, blue, red)
        for (const color of basicColors) {
            const bankCount = this.gameBankHexagons[color] ?? 0;
            // Count how many times this color was selected
            const selectedCount = this.selectedJokerExchanges.filter(c => c === color).length;
            const remainingCount = bankCount - selectedCount;
            
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
    }

    public get canCloseDiceModal(): boolean {
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

    public closeDiceModal(): void {
        if (!this.canCloseDiceModal) return;
        
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
                    black: 0
                };
            } else if (isFourCrossMode) {
                // In four cross mode, give 5 tokens of each color for testing (4+ scenario)
                this.playerHexagons[playerNum] = {
                    red: 5,
                    blue: 0,
                    white: 0,
                    green: 0,
                    purple: 0,
                    black: 0
                };
            } else {
                // In two cross mode, give 2 tokens of each color for testing
                this.playerHexagons[playerNum] = {
                    red: 2,
                    blue: 2,
                    white: 2,
                    green: 2,
                    purple: 2,
                    black: 2
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
