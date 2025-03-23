import { Component, OnInit } from '@angular/core';
import { NgIf, NgStyle } from "@angular/common";
import { InteractionService } from "../../services/interaction.service";
import { ArtComponent } from "../art/art.component";
import { Art } from "../../models/art.interface";

@Component({
    selector: 'app-art-to-card-animation',
    standalone: true,
    imports: [ArtComponent, NgIf, NgStyle],
    templateUrl: 'art-to-card-animation.component.html',
    styleUrls: ['../../style.css'],
})
export class ArtToCardAnimationComponent implements OnInit{
    // @ts-ignore
    public tempArt: Art;
    public showTempArt: boolean = false;
    public tempArtTopPosition: string = '0px';
    public tempArtLeftPosition: string = '0px';

    constructor(
        private _interactionService: InteractionService
    ) {
    }

    ngOnInit() {
        this._interactionService.tempFlyingArt$.subscribe((inArt: Art | undefined) => {
            if (inArt) {
                this.tempArtTopPosition = (Math.round(inArt.boundingClientRectStart?.top || 0)).toString() + 'px';
                this.tempArtLeftPosition = (Math.round(inArt.boundingClientRectStart?.left || 0)).toString() + 'px';
                this.showTempArt = true;
                this.tempArt = inArt;
                setTimeout(() => {
                    if (this.tempArt && this.tempArt.boundingClientRectStart && this.tempArt.boundingClientRectEnd) {
                        this.tempArtTopPosition = (Math.round(inArt.boundingClientRectEnd?.top || 0)).toString() + 'px';
                        this.tempArtLeftPosition = (Math.round(inArt.boundingClientRectEnd?.left || 0)).toString() + 'px';
                    }
                }, 1);
                setTimeout(() => {
                    this.showTempArt = false;
                    this.tempArtTopPosition = '0px';
                    this.tempArtLeftPosition = '0px';
                }, this._interactionService.animationFlyingArtTime + 1);
            }
        });
    }
}
