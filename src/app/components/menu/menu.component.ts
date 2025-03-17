import { Component } from '@angular/core';
import { InteractionService } from "../../services/interaction.service";
import { NgIf, NgStyle } from "@angular/common";

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
    public disabledArtVisibility: 'hidden' | 'visible' = 'hidden';

    constructor(
        private _interactionService: InteractionService
    ) {
        this.menuVisibility = localStorage.getItem('menuVisibilityMode') as MenuVisibilityMode || 'expanded';

        const selectedMenuItemFromLocalStorage: string | null = localStorage.getItem('selectedMenuItem');
        if (selectedMenuItemFromLocalStorage) {
            this.selectViewMode(+selectedMenuItemFromLocalStorage);
        }

        const disabledArtVisibilityFromLocalStorage: string | null = localStorage.getItem('disabledArtVisibility');
        if (disabledArtVisibilityFromLocalStorage) {
            if (disabledArtVisibilityFromLocalStorage === 'hidden') {
                this.hideDisabledArtVisibility();
            }
            if (disabledArtVisibilityFromLocalStorage === 'visible') {
                this.showDisabledArtVisibility();
            }
        }
    }

    public selectViewMode(inSelectedMenuIndex: number) {
        this.selectedMenuItem = inSelectedMenuIndex;
        localStorage.setItem('selectedMenuItem', inSelectedMenuIndex.toString())
        this._interactionService.selectViewMode(inSelectedMenuIndex);
    }

    public showDisabledArtVisibility() {
        this.disabledArtVisibility = 'visible';
        localStorage.setItem('disabledArtVisibility', 'visible');
        this._interactionService.setDisabledArtVisibility(true);
    }

    public hideDisabledArtVisibility() {
        this.disabledArtVisibility = 'hidden';
        localStorage.setItem('disabledArtVisibility', 'hidden');
        this._interactionService.setDisabledArtVisibility(false);
    }

    public changeVisibilityMode(visibilityMode: MenuVisibilityMode) {
        this.menuVisibility = visibilityMode;
        localStorage.setItem('menuVisibilityMode', visibilityMode);
    }
}
