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

    constructor(
        private _dataService: DataService
    ) {
    }

    public selectViewMode(inSelectedMenuIndex: number) {
        this.selectedMenuItem = inSelectedMenuIndex;
        this._dataService.selectViewMode(inSelectedMenuIndex);
    }
}
