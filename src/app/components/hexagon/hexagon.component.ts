import { Component, Input, OnInit } from '@angular/core';
import { NgClass, NgIf, NgStyle } from "@angular/common";
import { Color } from "../../models/color.type";

@Component({
    selector: 'app-hexagon',
    imports: [NgStyle, NgClass, NgIf],
    standalone: true,
    template: `
			<div class="coin" [ngClass]="coinClass" [ngStyle]="{'background-image': 'url(\\'' + hexUrl + '\\')'}">
				<div class="number-wrapper" *ngIf="number">{{ number }}</div>
			</div>
    `,
    styleUrl: `hexagon.component.css`
})

export class HexagonComponent implements OnInit {
    @Input() number: number | undefined;
    @Input() color: Color | undefined;
    @Input() type: 'get' | 'getWin' | 'getWin2' | 'pay' | 'getMix' | 'getMedWin' | 'chaos' | 'chaos-card' | undefined;

    public gradient: string | undefined;
    public hexUrl: string | undefined;
    public coinClass: 'coin-chaos' | 'coin-small' | 'coin-medium' | 'coin-big' | 'coin-big-win' | 'coin-big-win2' | 'coin-medium-win'  = 'coin-small';

    ngOnInit() {
            switch (this.color) {
                case 'green':
                    this.hexUrl = './assets/hex/Hex-green-mj10' + (this.type?.includes('get') ? '-card' : '') + '.png';
                    break;
                case 'white':
                    this.hexUrl = './assets/hex/Hex-white-mj3' + (this.type?.includes('get') ? '-card' : '') + '.png';
                    break;
                case 'blue':
                    this.hexUrl = './assets/hex/Hex-blue-mj6' + (this.type?.includes('get') ? '-card' : '') + '.png';
                    break;
                case 'red':
                    this.hexUrl = './assets/hex/Hex-redd' + (this.type?.includes('get') ? '-card' : '') + '.png';
                    break;
                case 'purple':
                    this.hexUrl = './assets/hex/Hex-purple-mj' + (this.type?.includes('get') ? '-card' : '') + '.png';
                    break;
                case 'black':
                    this.hexUrl = './assets/hex/Hex-black-mj4' + (this.type?.includes('get') ? '-card' : '') + '.png';
                    break;
                case 'mix':
                    this.hexUrl = './assets/hex/Hex-mix-card.png';
                    // this.hexUrl = './assets/hex/Hex-mix' + (this.type?.includes('get') ? '-card' : '') + '.png';
                    break;
                case 'mix2':
                    this.hexUrl = './assets/hex/Hex-mix2-card.png';
                    break;
                case 'mix6':
                    this.hexUrl = './assets/hex/Hex-mix6-card.png';
                    break;
                case 'dice':
                    this.hexUrl = './assets/hex/dice2.png';
                    break;
            }
        switch (this.type) {
            case 'chaos':
            case 'chaos-card':
                this.coinClass = 'coin-chaos';
                break;
            case 'pay':
                this.coinClass = 'coin-small';
                break;
            case 'getMix':
                this.coinClass = 'coin-medium';
                break;
            case 'get':
                this.coinClass = 'coin-big';
                break;
            case 'getWin':
                this.coinClass = 'coin-big-win';
                break;
            case 'getWin2':
                this.coinClass = 'coin-big-win2';
                break;
            case 'getMedWin':
                this.coinClass = 'coin-medium-win';
                break;
        }
    }
}
