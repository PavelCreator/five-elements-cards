import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Subscription } from 'rxjs';
import { CardsStoreService } from '../../services/cards-store.service';
import { Card } from '../../models/card.interface';
import { Color } from '../../models/color.type';
import { CardComponent } from '../card/card.component';
import { ImageService } from '../../services/image.service';
import { InteractionService } from '../../services/interaction.service';
import { cards as initialCards } from '../../data/cards';

type SpecialStackColor = 'purple' | 'black';

interface SpecialStack {
    color: SpecialStackColor;
    stack: Card[];
    topCard?: Card;
}

@Component({
    selector: 'app-game-wrapper',
    standalone: true,
    imports: [NgClass, NgFor, NgIf, NgStyle, CardComponent],
    templateUrl: 'game-wrapper.component.html',
    styleUrls: ['./game-wrapper.component.css', '../../style.css'],
})
export class GameWrapperComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('gameField') gameField?: ElementRef<HTMLDivElement>;
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
        private _interactionService: InteractionService
    ) {}

    ngOnInit() {
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

    private _scheduleScaleUpdate() {
        if (this._resizeRaf) cancelAnimationFrame(this._resizeRaf);
        this._resizeRaf = requestAnimationFrame(() => this._updateScale());
    }

    private _updateScale() {
        if (!this.gameField?.nativeElement) return;
        const field = this.gameField.nativeElement;
        const width = field.offsetWidth;
        const height = field.offsetHeight;
        if (!width || !height) return;
        const horizontalPadding = 32;
        const verticalPadding = 32;
        const availableWidth = Math.max(0, window.innerWidth - horizontalPadding);
        const availableHeight = Math.max(0, window.innerHeight - verticalPadding);
        const scale = Math.min(1, availableWidth / width, availableHeight / height);
        field.style.setProperty('--game-scale', scale.toFixed(3));
    }

    private _buildRows(cards: Card[]) {
        const levels = [4, 3, 2, 1];
        const rows = levels.map((level) => {
            const levelCards = cards.filter(
                (card) => card.level === level && !card.levelSpecial && !card.levelBonus
            );
            const shuffled = this._shuffle([...levelCards]);
            return {
                level,
                stack: shuffled,
                topCards: shuffled.slice(0, 3),
                backUrl: shuffled.length ? this._imageService.generateCardBackUrl(shuffled[0]) : '',
                specialStacks: this._buildSpecialStacks(cards, level)
            };
        });
        this._scheduleScaleUpdate();
        return rows;
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
