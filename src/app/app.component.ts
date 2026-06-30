import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgStyle } from "@angular/common";
import { ArtsComponent } from "./components/arts/arts.component";
import { InteractionService } from "./services/interaction.service";
import { MenuComponent } from "./components/menu/menu.component";
import { CardsComponent } from "./components/cards/cards.component";
import { ArtToCardAnimationComponent } from "./components/art-to-card-animation/art-to-card-animation.component";
import { LocalStorageService } from "./services/local-storage.service";
import { GameWrapperComponent } from "./components/game-wrapper/game-wrapper.component";
import { SettingsService } from "./services/settings.service";
import { howToWinCards } from "./data/how-to-win-cards";
import { HowToWinCard, HowToWinCardType } from "./models/how-to-win-card.interface";
import { HowToWinComponent } from "./components/how-to-win/how-to-win.component";

type AppTab = 'collection' | 'game' | 'settings';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CardsComponent, ArtsComponent, MenuComponent, NgStyle, NgIf, NgFor, ArtToCardAnimationComponent, GameWrapperComponent, HowToWinComponent],
    templateUrl: 'app.component.html',
    styleUrls: ['style.css'],
})
export class AppComponent implements OnInit{
    public artsWrapperHeight: string = '50vh';
    public cardsWrapperHeight: string = '50vh';
    public activeTab: AppTab = 'collection';
    public showTabNav: boolean = true;
    public showGameWrapper: boolean = true;
    private readonly activeTabStorageKey: string = 'activeTab';
    public playerCount?: number;
    private readonly playerCountStorageKey: string = 'gamePlayerCount';
    public darkThemeEnabled: boolean = false;
    public readonly winConditionModes: HowToWinCardType[] = ['Grand', 'Blitz'];
    public winConditionMode: HowToWinCardType = 'Grand';
    public selectedWinConditionOptions: number[] = [1, 2, 3, 4];
    public selectedWinConditionMap: Record<number, boolean> = {};
    public visibleWinConditionCards: HowToWinCard[] = [];
    private readonly _maxSelectedWinConditions: number = 4;
    private readonly _allHowToWinCards: HowToWinCard[] = [...howToWinCards];
    private readonly _grandWinConditionCards: HowToWinCard[] = this._buildWinConditionCards('Grand');
    private readonly _blitzWinConditionCards: HowToWinCard[] = this._buildWinConditionCards('Blitz');

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
        this._loadDarkThemeMode();
        this._loadWinConditions();

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

    public setDarkThemeEnabled(enabled: boolean): void {
        this.darkThemeEnabled = enabled;
        this._settingsService.setDarkThemeEnabled(this.darkThemeEnabled);
        this._applyDarkThemeClass();
    }

    public setActiveTab(tab: AppTab): void {
        this.activeTab = tab;
        this._localStorageService.setItem(this.activeTabStorageKey, tab);
        if (tab === 'settings') {
            this._loadPlayerCount();
        }
    }

    public onGameNavigationRequested(action: 'settings' | 'new-game'): void {
        if (action === 'settings') {
            this.setActiveTab('settings');
            return;
        }

        this.setActiveTab('game');
        this.showGameWrapper = false;
        setTimeout(() => {
            this.showGameWrapper = true;
        });
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

    public setWinConditionMode(mode: HowToWinCardType): void {
        if (this.winConditionMode === mode) {
            return;
        }

        this.winConditionMode = mode;
        this._updateVisibleWinConditionCards();
        this._settingsService.setWinConditionMode(mode);
    }

    public toggleWinCondition(option: number | undefined): void {
        if (!option || option < 1 || option > 8) {
            return;
        }

        const selectedIndex = this.selectedWinConditionOptions.indexOf(option);

        if (selectedIndex !== -1) {
            if (this.selectedWinConditionOptions.length === 1) {
                return;
            }

            this.selectedWinConditionOptions = this.selectedWinConditionOptions.filter((value) => value !== option);
            this._settingsService.setSelectedWinConditionOptions(this.selectedWinConditionOptions);
            this._syncSelectedWinConditionMap();
            return;
        }

        if (this.selectedWinConditionOptions.length >= this._maxSelectedWinConditions) {
            this.selectedWinConditionOptions = [...this.selectedWinConditionOptions.slice(1), option];
        } else {
            this.selectedWinConditionOptions = [...this.selectedWinConditionOptions, option];
        }

        this._settingsService.setSelectedWinConditionOptions(this.selectedWinConditionOptions);
        this._syncSelectedWinConditionMap();
    }

    public trackByWinCondition(index: number, condition: HowToWinCard): number {
        return condition.option ?? (index + 1);
    }

    private _loadPlayerCount(): void {
        const stored = this._localStorageService.getItem(this.playerCountStorageKey);
        if (!stored) return;
        const parsed = Number(stored);
        if (Number.isInteger(parsed) && parsed >= 2 && parsed <= 6) {
            this.playerCount = parsed;
        }
    }

    private _loadDarkThemeMode(): void {
        this.darkThemeEnabled = this._settingsService.isDarkThemeEnabled();
        this._applyDarkThemeClass();
    }

    private _applyDarkThemeClass(): void {
        document.body.classList.toggle('theme-dark', this.darkThemeEnabled);
    }

    private _loadWinConditions(): void {
        this.winConditionMode = this._settingsService.getWinConditionMode();
        this.selectedWinConditionOptions = this._settingsService.getSelectedWinConditionOptions();
        this._updateVisibleWinConditionCards();
        this._syncSelectedWinConditionMap();
    }

    private _buildWinConditionCards(mode: HowToWinCardType): HowToWinCard[] {
        return this._allHowToWinCards
            .filter((card) => card.type === mode)
            .sort((left, right) => {
                const leftOption = left.option ?? 0;
                const rightOption = right.option ?? 0;
                return leftOption - rightOption;
            });
    }

    private _updateVisibleWinConditionCards(): void {
        this.visibleWinConditionCards = this.winConditionMode === 'Grand'
            ? this._grandWinConditionCards
            : this._blitzWinConditionCards;
    }

    private _syncSelectedWinConditionMap(): void {
        const nextMap: Record<number, boolean> = {};
        for (const option of this.selectedWinConditionOptions) {
            nextMap[option] = true;
        }
        this.selectedWinConditionMap = nextMap;
    }
}
