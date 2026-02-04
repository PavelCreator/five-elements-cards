import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { Subscription } from 'rxjs';
import { CardsStoreService } from '../../services/cards-store.service';
import { Card } from '../../models/card.interface';
import { Color } from '../../models/color.type';
import { CardComponent } from '../card/card.component';
import { ImageService } from '../../services/image.service';

@Component({
    selector: 'app-game-wrapper',
    standalone: true,
    imports: [NgFor, NgIf, NgStyle, CardComponent],
    templateUrl: 'game-wrapper.component.html',
    styleUrls: ['./game-wrapper.component.css', '../../style.css'],
})
export class GameWrapperComponent implements OnInit, OnDestroy {
    public rows: Array<{ level: number; stack: Card[]; topCards: Card[]; backUrl: string }> = [];
    private _cardsSubscription?: Subscription;

    constructor(
        private _cardsStoreService: CardsStoreService,
        private _imageService: ImageService
    ) {}

    ngOnInit() {
        this._cardsSubscription = this._cardsStoreService.cards$.subscribe((cards) => {
            const preparedCards = this._assignColors(cards);
            this.rows = this._buildRows(preparedCards);
        });
    }

    ngOnDestroy() {
        this._cardsSubscription?.unsubscribe();
    }

    private _buildRows(cards: Card[]) {
        const levels = [4, 3, 2, 1];
        return levels.map((level) => {
            const levelCards = cards.filter((card) => card.level === level && !card.levelSpecial);
            const shuffled = this._shuffle([...levelCards]);
            return {
                level,
                stack: shuffled,
                topCards: shuffled.slice(0, 3),
                backUrl: shuffled.length ? this._imageService.generateCardBackUrl(shuffled[0]) : ''
            };
        });
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
