import { Component } from '@angular/core';
import { DataService } from "../data.service";
import { NgIf, NgStyle } from "@angular/common";

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [NgStyle, NgIf],
    templateUrl: 'menu.component.html',
    styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
    public selectedMenuItem: number = 3;
    public menuVisibility: 'collapsed' | 'expanded' = 'expanded';
    public disabledArtVisibility: 'hidden' | 'visible' = 'hidden';

    constructor(
        private _dataService: DataService
    ) {
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
        this._dataService.selectViewMode(inSelectedMenuIndex);
    }

    public showDisabledArtVisibility() {
        this.disabledArtVisibility = 'visible';
        localStorage.setItem('disabledArtVisibility', 'visible')
        this._dataService.setDisabledArtVisibility(true);
    }

    public hideDisabledArtVisibility() {
        this.disabledArtVisibility = 'hidden';
        localStorage.setItem('disabledArtVisibility', 'hidden')
        this._dataService.setDisabledArtVisibility(false);
    }
}
