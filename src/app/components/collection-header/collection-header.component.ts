import { Component, Input } from '@angular/core';
import {Art} from "../../models/art.interface";

@Component({
  selector: 'app-collection-header',
  imports: [],
  standalone: true,
  templateUrl:'./collection-header.component.html',
  styleUrls: ['../../style.css']
})
export class CollectionHeaderComponent {
  @Input() art: Art | undefined;
}

