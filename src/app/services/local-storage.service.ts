import { Injectable } from '@angular/core';
import { Art } from "../models/art.interface";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

    constructor() {}

    public saveArray(inArray: any[], inName: string) {
        localStorage.setItem(inName, JSON.stringify(inArray));
    }

    public loadArray(inName: string): any[] | undefined {
        let arrayString: string | null = localStorage.getItem(inName);
        return arrayString === null ? undefined : JSON.parse(arrayString);
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
