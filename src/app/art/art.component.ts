import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { NgIf, NgStyle } from "@angular/common";
import { Art } from "../interfaces/art.interface";
import { DataService } from "../data.service";

@Component({
    selector: 'app-art',
    templateUrl: './art.component.html',
    standalone: true,
    imports: [
        NgStyle,
        NgIf
    ],
    styleUrls: ['../style.css']
})
export class ArtComponent implements OnInit {
    //@ts-ignore
    @Input() art: Art;
    public borderColor: string | undefined = 'grey';

    public showDisabledArt: boolean = false;

    constructor(
        private _dataService: DataService,
        private el: ElementRef
    ) {
    }

    ngOnInit() {
        this._setBorderColorFromArtColor();

        console.log('Art Component');
        this._dataService.selectedArt$.subscribe((inArt: Art | undefined) => {
            if (inArt === undefined && this.art.isSelected) {
                this._removeArtSelection();
            }
            if (inArt?.picturePath === this.art.picturePath && !this.art.isSelected) {
                this._addArtSelection();
            }
            if (inArt?.picturePath !== this.art.picturePath && this.art.isSelected) {
                this._removeArtSelection();
            }
        })

        this._dataService.showDisabledArts$.subscribe((inShowHidden: boolean | undefined) => {
            if (inShowHidden !== undefined) {
                this.showDisabledArt = inShowHidden;
                console.log('this.showDisabledArt =', this.showDisabledArt);
            }
        })
    }

    public toggleArtSelection() {
        if (this.art.isSelected) {
            this._removeArtSelection();
        } else {
            this._selectArt();
        }
    }

    private _removeArtSelection() {
        this.art.isSelected = false;
        this._setBorderColorFromArtColor();
    }

    private _addArtSelection() {
        this.art.isSelected = true;
        this.borderColor = '#ff00f2';
    }

    private _selectArt() {
        const viewportOffset = this.el.nativeElement.getBoundingClientRect();
        this.art.boundingClientRectStart = {
            top: viewportOffset.top,
            left: viewportOffset.left
        }
        this._dataService.toggleArtSelection(this.art);
    }

    private _setBorderColorFromArtColor() {
        switch (this.art?.color) {
            case 'red':
                this.borderColor = this.art.hidden ? '#440000' : '#930000';
                break;
            case 'green':
                this.borderColor = this.art.hidden ? '#004d00' : '#009a00';
                break;
            case 'lightBlue':
                this.borderColor = this.art.hidden ? '#545454' : '#bfbfbf';
                break;
            case 'darkBlue':
                this.borderColor = this.art.hidden ? '#002b59' : '#005cb9';
                break;
            case 'purple':
                this.borderColor = this.art.hidden ? '#400057' : '#7e00ab';
                break;
            case 'black':
                this.borderColor = this.art.hidden ? 'grey' : 'black';
                break;
            default:
                this.borderColor = '#888888'
                break;
        }
    }
}
