import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HexagonComponent } from '../hexagon/hexagon.component';
import { Color } from '../../models/color.type';

interface OwnedMasterCard {
    orderNumber: number;
    name: string;
    image: string;
    grand: boolean;
}

@Component({
    selector: 'app-player-column',
    standalone: true,
    imports: [NgFor, NgIf, NgClass, FormsModule, HexagonComponent],
    templateUrl: './player-column.component.html',
    styleUrls: ['./player-column.component.css', '../../style.css'],
})
export class PlayerColumnComponent implements OnChanges, AfterViewChecked {
    @ViewChild('renameInput') renameInput?: ElementRef<HTMLInputElement>;
    @Input() playerSlots: boolean[] = [];
    @Input() side!: 'left' | 'right';
    @Input() activePlayer: number = 1;
    @Input() playerNames: string[] = [];
    @Input() editingPlayerIndex: number | null = null;
    @Input() visiblePlayerNumbers: number[] = [];
    @Input() playerHexagons: { [playerNumber: number]: { [key in Color]?: number } } = {};
    @Input() playerCardHexagons: { [playerNumber: number]: { [key in Color]?: number } } = {};
    @Input() playerPassiveBlackTappedThisTurn: { [playerNumber: number]: number } = {};
    @Input() playerOwnedMasterCards: { [playerNumber: number]: OwnedMasterCard[] } = {};

    @Output() activePlayerChange = new EventEmitter<number>();
    @Output() startRenameEvent = new EventEmitter<number>();
    @Output() saveRenameEvent = new EventEmitter<{ playerNumber: number; name: string }>();
    @Output() cancelRenameEvent = new EventEmitter<void>();

    public editingPlayerName: string = '';
    private needsTextSelection: boolean = false;

    ngOnChanges(changes: SimpleChanges): void {
        // When editingPlayerIndex changes, update editingPlayerName
        if (changes['editingPlayerIndex']) {
            if (this.editingPlayerIndex !== null) {
                this.editingPlayerName = this.getPlayerName(this.editingPlayerIndex);
                this.needsTextSelection = true;
            } else {
                this.editingPlayerName = '';
                this.needsTextSelection = false;
            }
        }
    }

    ngAfterViewChecked(): void {
        if (this.needsTextSelection && this.renameInput) {
            const input = this.renameInput.nativeElement;
            input.focus();
            input.select();
            this.needsTextSelection = false;
        }
    }

    /**
     * Calculate player number by explicit list when provided;
     * fallback to side-based layout for legacy usage.
     */
    public getPlayerNumber(index: number): number {
        const explicit = this.visiblePlayerNumbers[index];
        if (Number.isInteger(explicit) && explicit >= 1 && explicit <= 6) {
            return explicit;
        }

        return this.side === 'left' ? index * 2 + 1 : index * 2 + 2;
    }

    /**
     * Get player name for a given player number (1-6).
     */
    public getPlayerName(playerNumber: number): string {
        return this.playerNames[playerNumber - 1] ?? `Player ${playerNumber}`;
    }

    /**
     * Get hexagon value for a specific player and color.
     */
    public getHexagonValue(playerNumber: number, color: Color): number {
        return this.playerHexagons[playerNumber]?.[color] ?? 0;
    }

    /**
     * Get passive card value for a specific player and color.
     */
    public getCardHexagonValue(playerNumber: number, color: Color): number {
        return this.playerCardHexagons[playerNumber]?.[color] ?? 0;
    }

    public getOwnedMasterCards(playerNumber: number): OwnedMasterCard[] {
        return this.playerOwnedMasterCards[playerNumber] ?? [];
    }

    public getPassiveBlackTotalCount(playerNumber: number): number {
        const totalPassiveBlack = Math.max(0, Math.floor(this.getCardHexagonValue(playerNumber, 'black')));
        return totalPassiveBlack;
    }

    public getPassiveBlackTappedCount(playerNumber: number): number {
        const totalPassiveBlack = this.getPassiveBlackTotalCount(playerNumber);
        const tappedCount = Math.max(0, Math.min(Math.floor(this.playerPassiveBlackTappedThisTurn[playerNumber] ?? 0), totalPassiveBlack));
        return tappedCount;
    }

    public getPassiveBlackAvailableCount(playerNumber: number): number {
        const totalPassiveBlack = this.getPassiveBlackTotalCount(playerNumber);
        const tappedCount = this.getPassiveBlackTappedCount(playerNumber);
        const availableCount = Math.max(totalPassiveBlack - tappedCount, 0);
        return availableCount;
    }

    public isPassiveBlackMixed(playerNumber: number): boolean {
        const totalPassiveBlack = this.getPassiveBlackTotalCount(playerNumber);
        const tappedCount = this.getPassiveBlackTappedCount(playerNumber);
        const availableCount = this.getPassiveBlackAvailableCount(playerNumber);
        return totalPassiveBlack > 0 && tappedCount > 0 && availableCount > 0;
    }

    public isPassiveBlackFullyTapped(playerNumber: number): boolean {
        const totalPassiveBlack = this.getPassiveBlackTotalCount(playerNumber);
        return totalPassiveBlack > 0 && this.getPassiveBlackTappedCount(playerNumber) >= totalPassiveBlack;
    }

    public getPassiveBlackStackNumber(playerNumber: number): number {
        if (this.isPassiveBlackMixed(playerNumber)) {
            // Mixed state is rendered as ratio text overlay (e.g. 1/2), so hide built-in number.
            return 0;
        }

        if (this.isPassiveBlackFullyTapped(playerNumber)) {
            return this.getPassiveBlackTotalCount(playerNumber);
        }

        return this.getPassiveBlackAvailableCount(playerNumber);
    }

    public getPassiveBlackMixedRatio(playerNumber: number): string {
        const available = this.getPassiveBlackAvailableCount(playerNumber);
        const total = this.getPassiveBlackTotalCount(playerNumber);
        return `${available}/${total}`;
    }

    /**
     * Set the active player.
     */
    public setActivePlayer(playerNumber: number): void {
        this.activePlayerChange.emit(playerNumber);
    }

    /**
     * Start renaming a player.
     */
    public startRename(playerNumber: number): void {
        this.startRenameEvent.emit(playerNumber);
    }

    /**
     * Select all text in the input field.
     */
    public selectAllText(event: FocusEvent): void {
        const target = event.target as HTMLInputElement | null;
        if (!target) return;
        setTimeout(() => target.select());
    }

    /**
     * Save the renamed player name.
     */
    public saveRename(playerNumber: number): void {
        const trimmed = this.editingPlayerName.trim();
        const name = trimmed || `Player ${playerNumber}`;
        this.saveRenameEvent.emit({ playerNumber, name });
        this.editingPlayerName = '';
    }

    /**
     * Handle blur event on the rename input.
     */
    public onRenameBlur(playerNumber: number): void {
        if (this.editingPlayerIndex !== playerNumber) return;
        this.saveRename(playerNumber);
    }

    /**
     * Cancel the rename operation.
     */
    public cancelRename(): void {
        this.editingPlayerName = '';
        this.cancelRenameEvent.emit();
    }
}
