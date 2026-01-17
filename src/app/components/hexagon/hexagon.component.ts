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
    @Input() type: 'get' | 'pay' | 'getMix' | 'chaos' | undefined;

    public gradient: string | undefined;
    public hexUrl: string | undefined;
    public coinClass: 'coin-chaos' | 'coin-small' | 'coin-medium' | 'coin-big'  = 'coin-small';

    ngOnInit() {
        switch (this.color) {
            case 'green':
                this.hexUrl = './assets/hex/Hex-green-mj10' + (this.type === 'get' || this.type === 'getMix' ? '-card' : '') + '.png';
                break;
            case 'white':
                this.hexUrl = './assets/hex/Hex-white-mj3' + (this.type === 'get' || this.type === 'getMix' ? '-card' : '') + '.png';
                break;
            case 'blue':
                this.hexUrl = './assets/hex/Hex-blue-mj6' + (this.type === 'get' || this.type === 'getMix' ? '-card' : '') + '.png';
                break;
            case 'red':
                this.hexUrl = './assets/hex/Hex-redd' + (this.type === 'get' || this.type === 'getMix' ? '-card' : '') + '.png';
                break;
            case 'purple':
                this.hexUrl = './assets/hex/Hex-purple-mj' + (this.type === 'get' || this.type === 'getMix' ? '-card' : '') + '.png';
                break;
            case 'black':
                this.hexUrl = './assets/hex/Hex-black-mj4' + (this.type === 'get' || this.type === 'getMix' ? '-card' : '') + '.png';
                break;
            case 'mix':
                this.hexUrl = './assets/hex/Hex-mix.png';
                break;
            case 'dice':
                this.hexUrl = './assets/hex/dice2.png';
                break;
        }

        switch (this.type) {
            case 'chaos':
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
        }
    }
}
