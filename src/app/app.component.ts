import { Component, OnInit } from '@angular/core';
import { NgIf, NgStyle } from "@angular/common";
import { ArtsComponent } from "./components/arts/arts.component";
import { InteractionService } from "./services/interaction.service";
import { MenuComponent } from "./components/menu/menu.component";
import { CardsComponent } from "./components/cards/cards.component";
import { ArtToCardAnimationComponent } from "./components/art-to-card-animation/art-to-card-animation.component";
import { LocalStorageService } from "./services/local-storage.service";
import { GameWrapperComponent } from "./components/game-wrapper/game-wrapper.component";

type AppTab = 'collection' | 'game';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CardsComponent, ArtsComponent, MenuComponent, NgStyle, NgIf, ArtToCardAnimationComponent, GameWrapperComponent],
    templateUrl: 'app.component.html',
    styleUrls: ['style.css'],
})
export class AppComponent implements OnInit{
    public artsWrapperHeight: string = '50vh';
    public cardsWrapperHeight: string = '50vh';
    public activeTab: AppTab = 'collection';
    private readonly activeTabStorageKey: string = 'activeTab';

    constructor(
        private _interactionService: InteractionService,
        private _localStorageService: LocalStorageService
    ) {
    }

    ngOnInit() {
        const storedTab: string | null = this._localStorageService.getItem(this.activeTabStorageKey);
        if (storedTab === 'collection' || storedTab === 'game') {
            this.activeTab = storedTab;
        }

        this._interactionService.selectedViewMode$.subscribe((inSelectedMenuItem: number | undefined) => {
            switch (inSelectedMenuItem) {
                case 1:
                    this.artsWrapperHeight = '0vh'
                    this.cardsWrapperHeight = '100vh'
                    break;
                case 2:
                    this.artsWrapperHeight = '30vh'
                    this.cardsWrapperHeight = '70vh'
                    break;
                case 3:
                default:
                    this.artsWrapperHeight = '50vh'
                    this.cardsWrapperHeight = '50vh'
                    break;
                case 4:
                    this.artsWrapperHeight = '70vh'
                    this.cardsWrapperHeight = '30vh'
                    break;
                case 5:
                    this.artsWrapperHeight = '100vh'
                    this.cardsWrapperHeight = '0vh'
                    break;
            }
        })
    }

    public setActiveTab(tab: AppTab): void {
        this.activeTab = tab;
        this._localStorageService.setItem(this.activeTabStorageKey, tab);
    }
}
