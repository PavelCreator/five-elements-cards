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

  public toggleCardSelection(inCard: Card) {
    if (inCard?.picturePath === this._selectedCardSubject$.value?.picturePath) {
      this._selectedCardSubject$.next(undefined);
    } else {
      this._selectedCardSubject$.next(inCard);
      this._dataFlow();
    }
  }

  private _selectedArtSubject$: BehaviorSubject<Art | undefined> = new BehaviorSubject<Art | undefined>(undefined);
  public selectedArt$: Observable<Art | undefined> = this._selectedArtSubject$.asObservable();

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
      this._selectedArtSubject$.next(undefined);
      this._removedArtSubject$.next(this._selectedArtSubject$.value);
    }
  }
}
