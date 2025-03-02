import { Component, Input, OnInit } from '@angular/core';
import { NgClass, NgStyle } from "@angular/common";
import { Color } from "../interfaces/color.type";

@Component({
    selector: 'app-hexagon',
    imports: [NgStyle, NgClass],
    standalone: true,
    template: `
			<!--<div class="hexagon" [ngStyle]="{'background': gradient}">-->
			<div [ngClass]="type === 'pay' ? 'hexagon' : 'hexagon-big'" [ngStyle]="{'background-image': 'url(\\'' + hexUrl + '\\')'}">
				<div class="number-wrapper">{{ number }}</div>
			</div>
    `,
    styleUrl: `hexagon.component.css`
})

export class HexagonComponent implements OnInit {
    @Input() number: number | undefined;
    @Input() color: Color | undefined;
    @Input() type: 'get' | 'pay' | undefined;

    public gradient: string | undefined;
    public hexUrl: string | undefined;

    ngOnInit() {
        switch (this.color) {
            case 'green':
                this.gradient = 'linear-gradient(180deg, rgba(10,88,0,1) 0%, rgba(0,183,13,1) 50%, rgba(10,88,0,1) 100%)';
                break;
            case 'lightBlue':
                this.gradient = 'linear-gradient(180deg, rgba(184,184,184,1) 0%, rgba(255,255,255,1) 50%, rgba(184,184,184,1) 100%)';
                break;
            case 'darkBlue':
                this.gradient = 'linear-gradient(180deg, rgba(0,4,167,1) 0%, rgba(39,70,255,1) 50%, rgba(0,4,167,1) 100%)';
                break;
            case 'red':
                this.gradient = 'linear-gradient(180deg, rgba(255,0,0,1) 0%, rgba(255,198,0,1) 50%, rgba(255,0,0,1) 100%)';
                break;
            case 'purple':
                this.gradient = 'linear-gradient(180deg, rgba(94,0,143,1) 0%, rgba(156,0,255,1) 50%, rgba(94,0,143,1) 100%)';
                break;
            case 'black':
                this.gradient = 'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(92,92,92,1) 50%, rgba(0,0,0,1) 100%)';
                break;
        }

        if (this.type === 'pay') {
            switch (this.color) {
                case 'green':
                    this.hexUrl = './assets/hex/Hex-green4.png';
                    break;
                case 'lightBlue':
                    this.hexUrl = './assets/hex/Hex-white2.png';
                    break;
                case 'darkBlue':
                    this.hexUrl = './assets/hex/Hex-blue2.png';
                    break;
                case 'red':
                    this.hexUrl = './assets/hex/Hex-red2.png';
                    break;
                case 'purple':
                    this.hexUrl = './assets/hex/Hex-purple2.png';
                    break;
                case 'black':
                    this.hexUrl = './assets/hex/Hex-black2.png';
                    break;
            }
        } else {
            switch (this.color) {
                case 'green':
                    this.hexUrl = './assets/hex/Hex-green-big-7.png';
                    break;
                case 'lightBlue':
                    this.hexUrl = './assets/hex/Hex-white-big-6.png';
                    break;
                case 'darkBlue':
                    this.hexUrl = './assets/hex/Hex-blue-big-3.png';
                    break;
                case 'red':
                    this.hexUrl = './assets/hex/Hex-red-big-3.png';
                    break;
                case 'purple':
                    this.hexUrl = './assets/hex/Hex-purple-big-3.png';
                    break;
                case 'black':
                    this.hexUrl = './assets/hex/Hex-black-big-4.png';
                    break;
            }
        }
    }
}
