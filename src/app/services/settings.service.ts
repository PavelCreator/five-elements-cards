import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { Card } from "../models/card.interface";
import { Art } from "../models/art.interface";
import { Lang } from "../models/lang.type";
import { LocalStorageService } from "./local-storage.service";
import { HowToWinCardType } from "../models/how-to-win-card.interface";
import { GameMode } from '../models/game-mode.type';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public lang: Lang = 'en';
  private readonly _darkThemeKey = 'darkThemeEnabled';
  private readonly _legacyModesCleanupDoneKey = 'legacyModesCleanupDone_v1';
  private readonly _winConditionModeKey = 'winConditionMode';
  private readonly _gameModeKey = 'gameMode';
  private readonly _winConditionOptionsKey = 'selectedWinConditionOptions';
  private readonly _defaultWinConditionOptions: number[] = [1, 2, 3, 4];
  private _darkThemeEnabled = new BehaviorSubject<boolean>(false);
  public darkThemeEnabled$ = this._darkThemeEnabled.asObservable();
  private _gameMode = new BehaviorSubject<GameMode>('normal');
  public gameMode$ = this._gameMode.asObservable();
  private _winConditionMode = new BehaviorSubject<HowToWinCardType>('Grand');
  public winConditionMode$ = this._winConditionMode.asObservable();
  private _selectedWinConditionOptions = new BehaviorSubject<number[]>(this._defaultWinConditionOptions);
  public selectedWinConditionOptions$ = this._selectedWinConditionOptions.asObservable();

  constructor(
      private _localStorageService: LocalStorageService
  ) {
    this._runLegacyModesCleanup();

    const lsLang: Lang = this._localStorageService.getItem('lang') as Lang;
    if (lsLang) this.lang = lsLang;

    const darkThemeEnabled = this._localStorageService.getItem(this._darkThemeKey);
    if (darkThemeEnabled === 'true') {
      this._darkThemeEnabled.next(true);
    }

    const gameMode = this._localStorageService.getItem(this._gameModeKey);
    if (gameMode === 'normal' || gameMode === 'hardcore') {
      this._gameMode.next(gameMode);
    }

    const winConditionMode = this._localStorageService.getItem(this._winConditionModeKey);
    if (winConditionMode === 'Grand' || winConditionMode === 'Blitz') {
      this._winConditionMode.next(winConditionMode);
    }

    const storedOptionsRaw = this._localStorageService.getItem(this._winConditionOptionsKey);
    if (storedOptionsRaw) {
      try {
        const parsed = JSON.parse(storedOptionsRaw);
        this.setSelectedWinConditionOptions(parsed, false);
      } catch {
        this.setSelectedWinConditionOptions(this._defaultWinConditionOptions, false);
      }
    }
  }

  public getWinConditionMode(): HowToWinCardType {
    return this._winConditionMode.value;
  }

  public getGameMode(): GameMode {
    return this._gameMode.value;
  }

  public setGameMode(mode: GameMode): void {
    this._gameMode.next(mode);
    this._localStorageService.setItem(this._gameModeKey, mode);
  }

  public setWinConditionMode(mode: HowToWinCardType): void {
    this._winConditionMode.next(mode);
    this._localStorageService.setItem(this._winConditionModeKey, mode);
  }

  public getSelectedWinConditionOptions(): number[] {
    return [...this._selectedWinConditionOptions.value];
  }

  public setSelectedWinConditionOptions(options: number[], persist: boolean = true): void {
    const sanitized = this._sanitizeWinConditionOptions(options);
    this._selectedWinConditionOptions.next(sanitized);
    if (persist) {
      this._localStorageService.setItem(this._winConditionOptionsKey, JSON.stringify(sanitized));
    }
  }

  public setLang(inLang: Lang): void {
    this.lang = inLang;
    this._localStorageService.setItem('lang', inLang);
  }

  public setDarkThemeEnabled(enabled: boolean): void {
    this._darkThemeEnabled.next(enabled);
    this._localStorageService.setItem(this._darkThemeKey, enabled.toString());
  }

  public isDarkThemeEnabled(): boolean {
    return this._darkThemeEnabled.value;
  }

  private _runLegacyModesCleanup(): void {
    const cleanupDone = this._localStorageService.getItem(this._legacyModesCleanupDoneKey);
    if (cleanupDone === 'true') {
      return;
    }

    const legacyKeys: string[] = [
      'checkToCrossMode',
      'checkToThreeCrossMode',
      'checkToFourCrossMode',
      'check2toJokersMode',
      'check2to3JokersMode',
      'check2to4JokersMode',
    ];

    for (const key of legacyKeys) {
      localStorage.removeItem(key);
    }

    this._localStorageService.setItem(this._legacyModesCleanupDoneKey, 'true');
  }

  private _sanitizeWinConditionOptions(options: number[]): number[] {
    if (!Array.isArray(options)) {
      return [...this._defaultWinConditionOptions];
    }

    const uniqueValid = Array.from(new Set(
      options
        .map((option) => Number(option))
        .filter((option) => Number.isInteger(option) && option >= 1 && option <= 8)
    ));

    if (uniqueValid.length === 0) {
      return [...this._defaultWinConditionOptions];
    }

    return uniqueValid.slice(0, 4);
  }
}
