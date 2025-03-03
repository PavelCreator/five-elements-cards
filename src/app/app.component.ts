import { Component, OnInit } from '@angular/core';
import { CardComponent } from "./card/card.component";
import { cards } from "./сore-logic/cards";
import { NgFor, NgIf } from "@angular/common";
import { ArtComponent } from "./art/art.component";
import { Art } from "./interfaces/art.interface";
import { artsSorted } from "./сore-logic/arts-sorted";
import { artsUnsorted } from "./сore-logic/arts-unsorted";
import { Collection } from "./interfaces/collection.interface";
import { CollectionHeaderComponent } from "./collection-header/collection-header.component";
import {DataService} from "./data.service";
import { Card } from "./interfaces/card.interface";
import {ArtsComponent} from "./arts/arts.component";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CardComponent, ArtComponent, NgFor, CollectionHeaderComponent, ArtsComponent],
    templateUrl: 'app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    public cards: Card[] = cards;
}
