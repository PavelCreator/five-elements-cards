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
        this._cardsSubject$ = new BehaviorSubject<Card[]>(storedCards?.length ? storedCards : initialCards);
        this.cards$ = this._cardsSubject$.asObservable();
    }

    public get cards(): Card[] {
        return this._cardsSubject$.value;
    }

    public setCards(inCards: Card[]) {
        this._cardsSubject$.next(inCards);
    }
}
