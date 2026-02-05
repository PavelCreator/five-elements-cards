import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Card } from '../models/card.interface';
import { cards as initialCards } from '../data/cards';
import { LocalStorageService } from './local-storage.service';

@Injectable({
    providedIn: 'root',
})
export class CardsStoreService {
    private _cardsSubject$: BehaviorSubject<Card[]>;
    public cards$: Observable<Card[]>;

    constructor(private _localStorageService: LocalStorageService) {
        const storedCards = this._localStorageService.loadArray('cards') as Card[] | undefined;
        const mergedCards = this._mergeSpecialCards(storedCards, initialCards);
        if (storedCards?.length && mergedCards.length !== storedCards.length) {
            this._localStorageService.saveArray(mergedCards, 'cards');
        }
        this._cardsSubject$ = new BehaviorSubject<Card[]>(mergedCards);
        this.cards$ = this._cardsSubject$.asObservable();
    }

    public get cards(): Card[] {
        return this._cardsSubject$.value;
    }

    public setCards(inCards: Card[]) {
        this._cardsSubject$.next(inCards);
    }

    private _mergeSpecialCards(storedCards: Card[] | undefined, baseCards: Card[]): Card[] {
        if (!storedCards?.length) {
            return baseCards;
        }

        const cardsMap = new Map<number, Card>();
        storedCards.forEach((card) => cardsMap.set(card.orderNumber, card));

        baseCards
            .filter((card) => card.levelSpecial)
            .forEach((card) => {
                if (!cardsMap.has(card.orderNumber)) {
                    cardsMap.set(card.orderNumber, card);
                }
            });

        return Array.from(cardsMap.values());
    }
}
