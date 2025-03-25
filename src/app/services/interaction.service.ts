import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { Card } from "../models/card.interface";
import { Art } from "../models/art.interface";
import { CardSide } from "../models/card-side.type";
import { ChaosCard } from "../models/chaos-card.interface";

@Injectable({
  providedIn: 'root'
})
export class InteractionService {

  constructor() { }

  private _selectedCardSubject$: BehaviorSubject<Card | undefined> = new BehaviorSubject<Card | undefined>(undefined);
  public selectedCard$: Observable<Card | undefined> = this._selectedCardSubject$.asObservable();

  private _tempFlyingArtSubject$: BehaviorSubject<Art | undefined> = new BehaviorSubject<Art | undefined>(undefined);
  public tempFlyingArt$: Observable<Art | undefined> = this._tempFlyingArtSubject$.asObservable();

  private _removedArtSubject$: BehaviorSubject<Art | undefined> = new BehaviorSubject<Art | undefined>(undefined);
  public removedArt$: Observable<Art | undefined> = this._removedArtSubject$.asObservable();

  private _addArtSubject$: BehaviorSubject<Art | undefined> = new BehaviorSubject<Art | undefined>(undefined);
  public addArt$: Observable<Art | undefined> = this._addArtSubject$.asObservable();

  public removeArtFromCard(art: Art) {
    this._selectedCardSubject$.next(undefined);
    this._addArtSubject$.next(art);
    setTimeout(() => {
      this.saveArts();
      this.saveCards();
    }, 100);
  }

  public toggleCardSelection(inCard: Card) {
    if (inCard?.artData && inCard?.artData?.picturePath === this._selectedCardSubject$.value?.artData?.picturePath) {
      this._selectedCardSubject$.next(undefined);
      this._addArtSubject$.next(this._selectedCardSubject$.value?.artData);
      this.saveCards();
      this.saveArts();
    } else {
      if (inCard?.artData && this._selectedArtSubject$.value?.picturePath !== inCard?.artData?.picturePath) {

        this._addArtSubject$.next(inCard?.artData);
        inCard.artData = this._selectedArtSubject$.value;
        inCard.isSelected = false;
        return;
      }
      this._selectedCardSubject$.next(inCard);
      this._addArtToCard();
    }
  }

  private _selectedArtSubject$: BehaviorSubject<Art | undefined> = new BehaviorSubject<Art | undefined>(undefined);
  public selectedArt$: Observable<Art | undefined> = this._selectedArtSubject$.asObservable();

  private _showDisabledArtsSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public showDisabledArts$: Observable<boolean> = this._showDisabledArtsSubject$.asObservable();

  private _cardsSideSubject$: BehaviorSubject<CardSide> = new BehaviorSubject<CardSide>('front');
  public cardsSide$: Observable<CardSide> = this._cardsSideSubject$.asObservable();

  private _selectedViewModeSubject$: BehaviorSubject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
  public selectedViewMode$: Observable<number | undefined> = this._selectedViewModeSubject$.asObservable();

  private _recalculateArtsSubject$: BehaviorSubject<void> = new BehaviorSubject<void>(undefined);
  public recalculateArts$: Observable<void> = this._recalculateArtsSubject$.asObservable();

  private _recalculateCardsSubject$: BehaviorSubject<void> = new BehaviorSubject<void>(undefined);
  public recalculateCards$: Observable<void> = this._recalculateCardsSubject$.asObservable();

  private _saveArtsSubject$: BehaviorSubject<void> = new BehaviorSubject<void>(undefined);
  public saveArts$: Observable<void> = this._saveArtsSubject$.asObservable();

  private _recalculateChaosCardsSubject$: BehaviorSubject<void> = new BehaviorSubject<void>(undefined);
  public recalculateChaosCards$: Observable<void> = this._recalculateCardsSubject$.asObservable();

  private _saveChaosCardsSubject$: BehaviorSubject<void> = new BehaviorSubject<void>(undefined);
  public saveChaosCards$: Observable<void> = this._saveChaosCardsSubject$.asObservable();

  private _saveCardsSubject$: BehaviorSubject<void> = new BehaviorSubject<void>(undefined);
  public saveCards$: Observable<void> = this._saveCardsSubject$.asObservable();

  public recalculateArts() {
    this._recalculateArtsSubject$.next();
  }

  public recalculateCards() {
    this._recalculateCardsSubject$.next();
  }

  public recalculateChaosCards() {
    this._recalculateChaosCardsSubject$.next();
  }

  public saveArts() {
    this._saveArtsSubject$.next();
  }

  public saveCards() {
    this._saveCardsSubject$.next();
  }

  public saveChaosCards() {
    this._saveChaosCardsSubject$.next();
  }

  public selectViewMode(inViewModeIndex: number) {
    this._selectedViewModeSubject$.next(inViewModeIndex);
  }

  public setDisabledArtVisibility(inShowHidden: boolean) {
    this._showDisabledArtsSubject$.next(inShowHidden);
  }

  public setCardsSide(inSide: CardSide) {
    this._cardsSideSubject$.next(inSide);
  }

  public toggleArtSelection(inArt: Art) {
    if (inArt?.picturePath === this._selectedArtSubject$.value?.picturePath) {
      this._selectedArtSubject$.next(undefined);
    } else {
      this._selectedArtSubject$.next(inArt);
      this._addArtToCard();
    }
  }

  public animationFlyingArtTime = 400;

  private _addArtToCard() {
    if (this._selectedCardSubject$.value && this._selectedArtSubject$.value) {
      const selectedArtCopy = {... this._selectedArtSubject$.value};
      setTimeout(() => {
        if (this._selectedCardSubject$.value) this._selectedCardSubject$.value.artData = selectedArtCopy;
        this._selectedCardSubject$.next(undefined);
        this._selectedArtSubject$.next(undefined);
        this.saveCards();
        this.saveArts();
      }, this.animationFlyingArtTime);
      this._tempFlyingArtSubject$.next({... this._selectedArtSubject$.value, boundingClientRectEnd: this._selectedCardSubject$.value.boundingClientRect});
      this._removedArtSubject$.next(this._selectedArtSubject$.value);
    }
  }

}
