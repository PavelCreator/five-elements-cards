import { Component } from '@angular/core';
import { InteractionService } from "../../services/interaction.service";
import { NgIf, NgStyle } from "@angular/common";
import { LocalStorageService } from "../../services/local-storage.service";
import { CardSide } from "../../models/card-side.type";
import { Visibility } from "../../models/visibility.type";

type MenuVisibilityMode = 'collapsed' | 'expanded';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [NgStyle, NgIf],
    templateUrl: 'menu.component.html',
    styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
    public selectedMenuItem: number = 3;
    public menuVisibility: MenuVisibilityMode;
    public disabledArtVisibility: Visibility = 'hidden';
    public disabledCardVisibility: Visibility = 'hidden';
    public collectionHeaderState: Visibility = 'visible';
    public cardSide: CardSide = 'front';
    public showMenu: boolean = true;

    constructor(
        private _interactionService: InteractionService,
        private _localStorageService: LocalStorageService
    ) {
        this.menuVisibility = this._localStorageService.getItem('menuVisibilityMode') as MenuVisibilityMode || 'expanded';

        const selectedMenuItemFromLocalStorage: string | null = this._localStorageService.getItem('selectedMenuItem');
        if (selectedMenuItemFromLocalStorage) {
            this.selectViewMode(+selectedMenuItemFromLocalStorage);
        }

        const disabledArtVisibilityFromLocalStorage: string | null = this._localStorageService.getItem('disabledArtVisibility');
        if (disabledArtVisibilityFromLocalStorage) {
            if (disabledArtVisibilityFromLocalStorage === 'hidden') {
                this.hideDisabledArtVisibility();
            }
            if (disabledArtVisibilityFromLocalStorage === 'visible') {
                this.showDisabledArtVisibility();
            }
        }

        const disabledCardVisibilityFromLocalStorage: string | null = this._localStorageService.getItem('disabledCardVisibility');
        if (disabledCardVisibilityFromLocalStorage) {
            if (disabledCardVisibilityFromLocalStorage === 'hidden') {
                this.hideDisabledCardVisibility();
            }
            if (disabledCardVisibilityFromLocalStorage === 'visible') {
                this.showDisabledCardVisibility();
            }
        }

        const collectionHeaderVisibilityFromLocalStorage: string | null = this._localStorageService.getItem('collectionHeaderVisibility');
        if (collectionHeaderVisibilityFromLocalStorage) {
            if (collectionHeaderVisibilityFromLocalStorage === 'hidden') {
                this.changeCollectionHeaderState('hidden');
            }
            if (collectionHeaderVisibilityFromLocalStorage === 'visible') {
                this.changeCollectionHeaderState('visible');
            }
        }
    }

    public selectViewMode(inSelectedMenuIndex: number) {
        this.selectedMenuItem = inSelectedMenuIndex;
        this._localStorageService.setItem('selectedMenuItem', inSelectedMenuIndex.toString())
        this._interactionService.selectViewMode(inSelectedMenuIndex);
    }

    public showDisabledArtVisibility() {
        this.disabledArtVisibility = 'visible';
        this._localStorageService.setItem('disabledArtVisibility', 'visible');
        this._interactionService.setDisabledArtVisibility(true);
    }

    public hideDisabledArtVisibility() {
        this.disabledArtVisibility = 'hidden';
        this._localStorageService.setItem('disabledArtVisibility', 'hidden');
        this._interactionService.setDisabledArtVisibility(false);
    }

    public showDisabledCardVisibility() {
        this.disabledCardVisibility = 'visible';
        this._localStorageService.setItem('disabledCardVisibility', 'visible');
        this._interactionService.setDisabledCardVisibility(true);
    }

    public hideDisabledCardVisibility() {
        this.disabledCardVisibility = 'hidden';
        this._localStorageService.setItem('disabledCardVisibility', 'hidden');
        this._interactionService.setDisabledCardVisibility(false);
    }

    public changeVisibilityMode(visibilityMode: MenuVisibilityMode) {
        this.menuVisibility = visibilityMode;
        this._localStorageService.setItem('menuVisibilityMode', visibilityMode);
    }

    public resetAllCardsAndArts() {
        this._localStorageService.clearArtsAndCards();
        window.location.reload();
    }

    public showCardsSide(inSide: CardSide) {
        this.cardSide = inSide;
        this._interactionService.setCardsSide(inSide);
    }

    public changeCollectionHeaderState(collectionHeaderState: Visibility) {
        this.collectionHeaderState = collectionHeaderState;
        this._localStorageService.setItem('collectionHeaderVisibility', collectionHeaderState);
        this._interactionService.changeCollectionHeaderState(collectionHeaderState);
    }
}
