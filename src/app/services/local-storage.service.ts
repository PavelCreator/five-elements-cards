import { Injectable } from '@angular/core';
import { Art } from "../models/art.interface";
import { ImageService } from "./image.service";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

    constructor(private _imageService: ImageService) {}

    private _normalizeStoredValue(value: unknown): unknown {
        if (typeof value === 'string') {
            return this._imageService.normalizeMidjourneyUrl(value) ?? value;
        }

        if (Array.isArray(value)) {
            return value.map((item) => this._normalizeStoredValue(item));
        }

        if (value && typeof value === 'object') {
            return Object.fromEntries(
                Object.entries(value).map(([key, item]) => [key, this._normalizeStoredValue(item)])
            );
        }

        return value;
    }

    public saveArray(inArray: any[], inName: string) {
        localStorage.setItem(inName, JSON.stringify(this._normalizeStoredValue(inArray)));
    }

    public loadArray(inName: string): any[] | undefined {
        let arrayString: string | null = localStorage.getItem(inName);
        if (arrayString === null) return undefined;

        const parsedArray = JSON.parse(arrayString);
        const normalizedArray = this._normalizeStoredValue(parsedArray) as any[];

        if (JSON.stringify(parsedArray) !== JSON.stringify(normalizedArray)) {
            this.saveArray(normalizedArray, inName);
        }

        return normalizedArray;
    }

    public clearArtsAndCards(): void {
        localStorage.removeItem('arts');
        localStorage.removeItem('cards');
    }

    public setItem(key: string, value: string): void {
        localStorage.setItem(key, value);
        3
    }

    public getItem(key: string): string | null {
        return localStorage.getItem(key);
    }
}
