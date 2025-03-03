import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { Card } from "./interfaces/card.interface";
import { Art } from "./interfaces/art.interface";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  private _selectedCardSubject$: BehaviorSubject<Card | undefined> = new BehaviorSubject<Card | undefined>(undefined);
  public selectedCard$: Observable<Card | undefined> = this._selectedCardSubject$.asObservable();

  private _removedArtSubject$: BehaviorSubject<Art | undefined> = new BehaviorSubject<Art | undefined>(undefined);
  public removedArt$: Observable<Art | undefined> = this._removedArtSubject$.asObservable();

  private _addArtSubject$: BehaviorSubject<Art | undefined> = new BehaviorSubject<Art | undefined>(undefined);
  public addArt$: Observable<Art | undefined> = this._addArtSubject$.asObservable();

  public toggleCardSelection(inCard: Card) {
    if (inCard?.artData && inCard?.artData?.picturePath === this._selectedCardSubject$.value?.artData?.picturePath) {
      this._selectedCardSubject$.next(undefined);
      this._addArtSubject$.next(this._selectedCardSubject$.value?.artData);
    } else {
      if (inCard?.artData && this._selectedArtSubject$.value?.picturePath !== inCard?.artData?.picturePath) {

        this._addArtSubject$.next(inCard?.artData);
        inCard.artData = this._selectedArtSubject$.value;
        inCard.isSelected = false;
        return;
      }
      this._selectedCardSubject$.next(inCard);
      this._dataFlow();
    }
  }

  private _selectedArtSubject$: BehaviorSubject<Art | undefined> = new BehaviorSubject<Art | undefined>(undefined);
  public selectedArt$: Observable<Art | undefined> = this._selectedArtSubject$.asObservable();

  private _selectedViewModeSubject$: BehaviorSubject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
  public selectedViewMode$: Observable<number | undefined> = this._selectedViewModeSubject$.asObservable();

  public selectViewMode(inViewModeIndex: number) {
    this._selectedViewModeSubject$.next(inViewModeIndex);
  }

  public toggleArtSelection(inArt: Art) {
    if (inArt?.picturePath === this._selectedArtSubject$.value?.picturePath) {
      this._selectedArtSubject$.next(undefined);
    } else {
      this._selectedArtSubject$.next(inArt);
      this._dataFlow();
    }
  }

  private _dataFlow() {
    if (this._selectedCardSubject$.value && this._selectedArtSubject$.value) {
      this._selectedCardSubject$.value.artData = {... this._selectedArtSubject$.value};
      this._selectedCardSubject$.next(undefined);
      this._removedArtSubject$.next(this._selectedArtSubject$.value);
      this._selectedArtSubject$.next(undefined);
    }
  }
}
