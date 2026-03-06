import { Component, OnInit } from '@angular/core';
import { NgIf, NgStyle } from "@angular/common";
import { ArtsComponent } from "./components/arts/arts.component";
import { InteractionService } from "./services/interaction.service";
import { MenuComponent } from "./components/menu/menu.component";
import { CardsComponent } from "./components/cards/cards.component";
import { ArtToCardAnimationComponent } from "./components/art-to-card-animation/art-to-card-animation.component";
import { LocalStorageService } from "./services/local-storage.service";
import { GameWrapperComponent } from "./components/game-wrapper/game-wrapper.component";
import { SettingsService } from "./services/settings.service";

type AppTab = 'collection' | 'game' | 'settings';

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
    public showTabNav: boolean = true;
    private readonly activeTabStorageKey: string = 'activeTab';
    public playerCount?: number;
    private readonly playerCountStorageKey: string = 'gamePlayerCount';
    public checkToCrossMode: boolean = false;
    public checkToThreeCrossMode: boolean = false;
    public checkToFourCrossMode: boolean = false;
    public check2toJokersMode: boolean = false;
    public check2to3JokersMode: boolean = false;
    public check2to4JokersMode: boolean = false;

    constructor(
        private _interactionService: InteractionService,
        private _localStorageService: LocalStorageService,
        private _settingsService: SettingsService
    ) {
    }

    ngOnInit() {
        const storedTab: string | null = this._localStorageService.getItem(this.activeTabStorageKey);
        if (storedTab === 'collection' || storedTab === 'game' || storedTab === 'settings') {
            this.activeTab = storedTab;
        }
        this._loadPlayerCount();
        this._loadCheckToCrossMode();
        this._loadCheckToThreeCrossMode();
        this._loadCheckToFourCrossMode();
        this._loadCheck2toJokersMode();
        this._loadCheck2to3JokersMode();
        this._loadCheck2to4JokersMode();

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

        this._interactionService.showTabNav$.subscribe((show: boolean) => {
            this.showTabNav = show;
        })
    }

    public setActiveTab(tab: AppTab): void {
        this.activeTab = tab;
        this._localStorageService.setItem(this.activeTabStorageKey, tab);
        if (tab === 'settings') {
            this._loadPlayerCount();
        }
    }

    public setPlayerCount(count: number): void {
        if (count < 2 || count > 6) return;
        this.playerCount = count;
        this._localStorageService.setItem(this.playerCountStorageKey, count.toString());
    }

    public clearPlayerCount(): void {
        this.playerCount = undefined;
        localStorage.removeItem(this.playerCountStorageKey);
    }

    public toggleCheckToCrossMode(): void {
        this.checkToCrossMode = !this.checkToCrossMode;
        this._settingsService.setCheckToCrossMode(this.checkToCrossMode);
        // Update other modes state after service handles mutual exclusion
        this.checkToThreeCrossMode = this._settingsService.isCheckToThreeCrossModeEnabled();
        this.checkToFourCrossMode = this._settingsService.isCheckToFourCrossModeEnabled();
    }

    public toggleCheckToThreeCrossMode(): void {
        this.checkToThreeCrossMode = !this.checkToThreeCrossMode;
        this._settingsService.setCheckToThreeCrossMode(this.checkToThreeCrossMode);
        // Update other modes state after service handles mutual exclusion
        this.checkToCrossMode = this._settingsService.isCheckToCrossModeEnabled();
        this.checkToFourCrossMode = this._settingsService.isCheckToFourCrossModeEnabled();
    }

    public toggleCheckToFourCrossMode(): void {
        this.checkToFourCrossMode = !this.checkToFourCrossMode;
        this._settingsService.setCheckToFourCrossMode(this.checkToFourCrossMode);
        // Update other modes state after service handles mutual exclusion
        this.checkToCrossMode = this._settingsService.isCheckToCrossModeEnabled();
        this.checkToThreeCrossMode = this._settingsService.isCheckToThreeCrossModeEnabled();
    }

    public toggleCheck2toJokersMode(): void {
        this.check2toJokersMode = !this.check2toJokersMode;
        this._settingsService.setCheck2toJokersMode(this.check2toJokersMode);
        // Update other joker modes state after service handles mutual exclusion
        this.check2to3JokersMode = this._settingsService.isCheck2to3JokersModeEnabled();
        this.check2to4JokersMode = this._settingsService.isCheck2to4JokersModeEnabled();
    }

    public toggleCheck2to3JokersMode(): void {
        this.check2to3JokersMode = !this.check2to3JokersMode;
        this._settingsService.setCheck2to3JokersMode(this.check2to3JokersMode);
        // Update other joker modes state after service handles mutual exclusion
        this.check2toJokersMode = this._settingsService.isCheck2toJokersModeEnabled();
        this.check2to4JokersMode = this._settingsService.isCheck2to4JokersModeEnabled();
    }

    public toggleCheck2to4JokersMode(): void {
        this.check2to4JokersMode = !this.check2to4JokersMode;
        this._settingsService.setCheck2to4JokersMode(this.check2to4JokersMode);
        // Update other joker modes state after service handles mutual exclusion
        this.check2toJokersMode = this._settingsService.isCheck2toJokersModeEnabled();
        this.check2to3JokersMode = this._settingsService.isCheck2to3JokersModeEnabled();
    }

    private _loadPlayerCount(): void {
        const stored = this._localStorageService.getItem(this.playerCountStorageKey);
        if (!stored) return;
        const parsed = Number(stored);
        if (Number.isInteger(parsed) && parsed >= 2 && parsed <= 6) {
            this.playerCount = parsed;
        }
    }

    private _loadCheckToCrossMode(): void {
        this.checkToCrossMode = this._settingsService.isCheckToCrossModeEnabled();
    }

    private _loadCheckToThreeCrossMode(): void {
        this.checkToThreeCrossMode = this._settingsService.isCheckToThreeCrossModeEnabled();
    }

    private _loadCheckToFourCrossMode(): void {
        this.checkToFourCrossMode = this._settingsService.isCheckToFourCrossModeEnabled();
    }

    private _loadCheck2toJokersMode(): void {
        this.check2toJokersMode = this._settingsService.isCheck2toJokersModeEnabled();
    }

    private _loadCheck2to3JokersMode(): void {
        this.check2to3JokersMode = this._settingsService.isCheck2to3JokersModeEnabled();
    }

    private _loadCheck2to4JokersMode(): void {
        this.check2to4JokersMode = this._settingsService.isCheck2to4JokersModeEnabled();
    }
}
