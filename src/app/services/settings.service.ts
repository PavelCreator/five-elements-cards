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

  constructor(
      private _localStorageService: LocalStorageService
  ) {
    const lsLang: Lang = this._localStorageService.getItem('lang') as Lang;
    if (lsLang) this.lang = lsLang;
  }

  public setLang(inLang: Lang): void {
    this.lang = inLang;
    this._localStorageService.setItem('lang', inLang);
  }

}
