import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { Card } from "../models/card.interface";
import { Art } from "../models/art.interface";
import { Lang } from "../models/lang.type";
import { LocalStorageService } from "./local-storage.service";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public lang: Lang = 'en';
  private _checkToCrossMode = new BehaviorSubject<boolean>(false);
  public checkToCrossMode$ = this._checkToCrossMode.asObservable();
  private _checkToThreeCrossMode = new BehaviorSubject<boolean>(false);
  public checkToThreeCrossMode$ = this._checkToThreeCrossMode.asObservable();
  private _checkToFourCrossMode = new BehaviorSubject<boolean>(false);
  public checkToFourCrossMode$ = this._checkToFourCrossMode.asObservable();
  private _check2toJokersMode = new BehaviorSubject<boolean>(false);
  public check2toJokersMode$ = this._check2toJokersMode.asObservable();
  private _check2to3JokersMode = new BehaviorSubject<boolean>(false);
  public check2to3JokersMode$ = this._check2to3JokersMode.asObservable();
  private _check2to4JokersMode = new BehaviorSubject<boolean>(false);
  public check2to4JokersMode$ = this._check2to4JokersMode.asObservable();

  constructor(
      private _localStorageService: LocalStorageService
  ) {
    const lsLang: Lang = this._localStorageService.getItem('lang') as Lang;
    if (lsLang) this.lang = lsLang;
    
    const checkToCrossMode = this._localStorageService.getItem('checkToCrossMode');
    if (checkToCrossMode === 'true') {
      this._checkToCrossMode.next(true);
    }
    
    const checkToThreeCrossMode = this._localStorageService.getItem('checkToThreeCrossMode');
    if (checkToThreeCrossMode === 'true') {
      this._checkToThreeCrossMode.next(true);
    }
    
    const checkToFourCrossMode = this._localStorageService.getItem('checkToFourCrossMode');
    if (checkToFourCrossMode === 'true') {
      this._checkToFourCrossMode.next(true);
    }
    
    const check2toJokersMode = this._localStorageService.getItem('check2toJokersMode');
    if (check2toJokersMode === 'true') {
      this._check2toJokersMode.next(true);
    }
    
    const check2to3JokersMode = this._localStorageService.getItem('check2to3JokersMode');
    if (check2to3JokersMode === 'true') {
      this._check2to3JokersMode.next(true);
    }
    
    const check2to4JokersMode = this._localStorageService.getItem('check2to4JokersMode');
    if (check2to4JokersMode === 'true') {
      this._check2to4JokersMode.next(true);
    }
  }

  public setLang(inLang: Lang): void {
    this.lang = inLang;
    this._localStorageService.setItem('lang', inLang);
  }

  public setCheckToCrossMode(enabled: boolean): void {
    this._checkToCrossMode.next(enabled);
    this._localStorageService.setItem('checkToCrossMode', enabled.toString());
    // Disable other modes if two cross is enabled
    if (enabled) {
      if (this._checkToThreeCrossMode.value) this.setCheckToThreeCrossMode(false);
      if (this._checkToFourCrossMode.value) this.setCheckToFourCrossMode(false);
    }
  }

  public isCheckToCrossModeEnabled(): boolean {
    return this._checkToCrossMode.value;
  }

  public setCheckToThreeCrossMode(enabled: boolean): void {
    this._checkToThreeCrossMode.next(enabled);
    this._localStorageService.setItem('checkToThreeCrossMode', enabled.toString());
    // Disable other modes if three cross is enabled
    if (enabled) {
      if (this._checkToCrossMode.value) this.setCheckToCrossMode(false);
      if (this._checkToFourCrossMode.value) this.setCheckToFourCrossMode(false);
    }
  }

  public isCheckToThreeCrossModeEnabled(): boolean {
    return this._checkToThreeCrossMode.value;
  }

  public setCheckToFourCrossMode(enabled: boolean): void {
    this._checkToFourCrossMode.next(enabled);
    this._localStorageService.setItem('checkToFourCrossMode', enabled.toString());
    // Disable other modes if four cross is enabled
    if (enabled) {
      if (this._checkToCrossMode.value) this.setCheckToCrossMode(false);
      if (this._checkToThreeCrossMode.value) this.setCheckToThreeCrossMode(false);
    }
  }

  public isCheckToFourCrossModeEnabled(): boolean {
    return this._checkToFourCrossMode.value;
  }

  public setCheck2toJokersMode(enabled: boolean): void {
    this._check2toJokersMode.next(enabled);
    this._localStorageService.setItem('check2toJokersMode', enabled.toString());
    // Disable other joker modes if 2 jokers is enabled
    if (enabled) {
      if (this._check2to3JokersMode.value) this.setCheck2to3JokersMode(false);
      if (this._check2to4JokersMode.value) this.setCheck2to4JokersMode(false);
    }
  }

  public isCheck2toJokersModeEnabled(): boolean {
    return this._check2toJokersMode.value;
  }

  public setCheck2to3JokersMode(enabled: boolean): void {
    this._check2to3JokersMode.next(enabled);
    this._localStorageService.setItem('check2to3JokersMode', enabled.toString());
    // Disable other joker modes if 3 jokers is enabled
    if (enabled) {
      if (this._check2toJokersMode.value) this.setCheck2toJokersMode(false);
      if (this._check2to4JokersMode.value) this.setCheck2to4JokersMode(false);
    }
  }

  public isCheck2to3JokersModeEnabled(): boolean {
    return this._check2to3JokersMode.value;
  }

  public setCheck2to4JokersMode(enabled: boolean): void {
    this._check2to4JokersMode.next(enabled);
    this._localStorageService.setItem('check2to4JokersMode', enabled.toString());
    // Disable other joker modes if 4 jokers is enabled
    if (enabled) {
      if (this._check2toJokersMode.value) this.setCheck2toJokersMode(false);
      if (this._check2to3JokersMode.value) this.setCheck2to3JokersMode(false);
    }
  }

  public isCheck2to4JokersModeEnabled(): boolean {
    return this._check2to4JokersMode.value;
  }
}
