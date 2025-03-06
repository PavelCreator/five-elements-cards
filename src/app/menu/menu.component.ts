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
    public hiddenArtVisibility: 'hidden' | 'visible' = 'hidden';

    constructor(
        private _dataService: DataService
    ) {
        const selectedMenuItemFromLocalStorage: string | null = localStorage.getItem('selectedMenuItem');
        if (selectedMenuItemFromLocalStorage) {
            this.selectViewMode(+selectedMenuItemFromLocalStorage);
        }

        const hiddenArtVisibilityFromLocalStorage: string | null = localStorage.getItem('hiddenArtVisibility');
        if (hiddenArtVisibilityFromLocalStorage) {
            this.selectViewMode(+hiddenArtVisibilityFromLocalStorage);
        }
    }

    public selectViewMode(inSelectedMenuIndex: number) {
        this.selectedMenuItem = inSelectedMenuIndex;
        localStorage.setItem('selectedMenuItem', inSelectedMenuIndex.toString())
        this._dataService.selectViewMode(inSelectedMenuIndex);
    }

    public toggleHiddenArtVisibility() {
        if (this.hiddenArtVisibility === 'hidden') this.hiddenArtVisibility = 'visible';
        if (this.hiddenArtVisibility === 'visible') this.hiddenArtVisibility = 'hidden';
        // this._dataService.setHiddenArtVisibility();
    }
}
