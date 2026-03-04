import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-player-column',
    standalone: true,
    imports: [NgFor, NgIf, NgClass, FormsModule],
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
     * Calculate player number based on side and index.
     * Left side: 1, 3, 5 (odd numbers)
     * Right side: 2, 4, 6 (even numbers)
     */
    public getPlayerNumber(index: number): number {
        return this.side === 'left' ? index * 2 + 1 : index * 2 + 2;
    }

    /**
     * Get player name for a given player number (1-6).
     */
    public getPlayerName(playerNumber: number): string {
        return this.playerNames[playerNumber - 1] ?? `Player ${playerNumber}`;
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
