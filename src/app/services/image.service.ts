import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { Card } from "../models/card.interface";
import { Art } from "../models/art.interface";

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() { }

  public generateCardBackUrl(card: Card): string {
    switch (card.color) {

      case 'chaos':
        if (card.level === 1) return './assets/back_cards/chaos.jpg';
        break;

      case 'master':
        if (card.level === 1) return './assets/back_cards/master3.png';
        break;

      case 'red':
      case 'green':
      case 'blue':
      case 'white':
      case 'mix':
        if (card.level === 1) return './assets/back_cards/1.jpg';
        if (card.level === 2) return './assets/back_cards/2.jpg';
        if (card.level === 3) return './assets/back_cards/3.jpg';
        if (card.level === 4) return './assets/back_cards/4.jpg';
        break;

      case 'black':
        if (card.level === 1) return './assets/back_cards/1_black.jpg';
        if (card.level === 2) return './assets/back_cards/2_black.jpg';
        if (card.level === 3) return './assets/back_cards/3_black.jpg';
        if (card.level === 4) return './assets/back_cards/4_black.jpg';
        break;

      case 'purple':
        if (card.level === 1) return './assets/back_cards/1_white.jpg';
        if (card.level === 2) return './assets/back_cards/2_white.jpg';
        if (card.level === 3) return './assets/back_cards/3_white.jpg';
        if (card.level === 4) return './assets/back_cards/4_white.jpg';
        break;
    }
    return '';
  }

}
