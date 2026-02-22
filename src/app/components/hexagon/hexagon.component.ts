import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgClass, NgIf, NgStyle } from "@angular/common";
import { Color } from "../../models/color.type";

@Component({
    selector: 'app-hexagon',
    imports: [NgStyle, NgClass, NgIf],
    standalone: true,
    template: `
			<div class="coin" [ngClass]="coinClass" [ngStyle]="{'background-image': 'url(\\'' + hexUrl + '\\')'}">
				<div class="left-half" (click)="$event.stopPropagation(); onLeftClick()"></div>
				<div class="right-half" (click)="$event.stopPropagation(); onRightClick()"></div>
				<div class="number-wrapper" *ngIf="number">{{ number }}</div>
			</div>
    `,
    styleUrl: `hexagon.component.css`
})

export class HexagonComponent implements OnInit {
    @Input() number: number | undefined;
    @Input() color: Color | undefined;
    @Input() type: 'get' | 'getWin' | 'getWin2' | 'pay' | 'getMix' | 'getMedWin' | 'chaos' | 'chaos-card' | 'payBonus' | undefined;

    @Output() leftClick = new EventEmitter<string>();
    @Output() rightClick = new EventEmitter<string>();

    public gradient: string | undefined;
    public hexUrl: string | undefined;
    public coinClass: 'coin-chaos' | 'coin-small' | 'coin-medium' | 'coin-big' | 'coin-big-win' | 'coin-big-win2' | 'coin-medium-win'  = 'coin-small';

    ngOnInit() {
            switch (this.color) {
                case 'green':
                    this.hexUrl = './assets/hex/hex-green' + (this.type?.includes('get') ? '-card' : '') + '.png';
                    break;
                case 'white':
                    this.hexUrl = './assets/hex/hex-white' + (this.type?.includes('get') ? '-card' : '') + '.png';
                    break;
                case 'blue':
                    this.hexUrl = './assets/hex/hex-blue' + (this.type?.includes('get') ? '-card' : '') + '.png';
                    break;
                case 'red':
                    this.hexUrl = './assets/hex/hex-red' + (this.type?.includes('get') ? '-card' : '') + '.png';
                    break;
                case 'purple':
                    this.hexUrl = './assets/hex/hex-purple' + (this.type?.includes('get') ? '-card' : '') + '.png';
                    break;
                case 'black':
                    this.hexUrl = './assets/hex/hex-black' + (this.type?.includes('get') ? '-card' : '') + '.png';
                    break;
                case 'mix':
                    // this.hexUrl = './assets/hex/hex-mix.png';
                    this.hexUrl = './assets/hex/hex-mix4' + (this.type?.includes('get') ? '-card' : '') + '.png';
                    break;
                case 'mix2':
                    this.hexUrl = './assets/hex/hex-mix2-card.png';
                    break;
                case 'mix6':
                    this.hexUrl = './assets/hex/hex-mix6-card.png';
                    break;
                case 'dice':
                    this.hexUrl = './assets/hex/dice.png';
                    break;
                case 'card_1_lvl':
                    this.hexUrl = './assets/hex/card_1_lvl.png';
                    break;
                case 'card_2_lvl':
                    this.hexUrl = './assets/hex/card_2_lvl.png';
                    break;
                case 'card_3_lvl':
                    this.hexUrl = './assets/hex/card_3_lvl.png';
                    break;
                case 'card_4_lvl':
                    this.hexUrl = './assets/hex/card_4_lvl.png';
                    break;
                case 'card_master':
                    this.hexUrl = './assets/hex/card_master.png';
                    break;
                case 'extra_turn':
                    this.hexUrl = './assets/hex/extra_turn.png';
                    break;
                case 'drop_card':
                    this.hexUrl = './assets/hex/drop_card.png';
                    break;
                case 'steal_card':
                    this.hexUrl = './assets/hex/steal_card.png';
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
            case 'payBonus':
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

    onLeftClick() {
        console.log('onLeftClick, color:', this.color);
        this.leftClick.emit(this.color);
    }

    onRightClick() {
        console.log('onRightClick, color:', this.color);
        this.rightClick.emit(this.color);
    }
}
