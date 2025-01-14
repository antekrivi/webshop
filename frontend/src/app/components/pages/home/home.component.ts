import { Component } from '@angular/core';
import { Item } from '../../../shared/models/Item';
import { ItemService } from '../../../services/item.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: false,
  
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  items:Item[] = [];
  constructor(private itemService: ItemService, activatedRoute: ActivatedRoute) {
    let itemsObservable : Observable<Item[]>;

    activatedRoute.params.subscribe((params) => {
      if(params.searchTerm)
        itemsObservable = this.itemService.getAllItemsBySearchTerm(params.searchTerm);
      else if(params.tag)
        itemsObservable = this.itemService.getAllItemsByTag(params.tag);
      else
        itemsObservable = this.itemService.getAll();

        itemsObservable.subscribe((serverItems) => {
          this.items = serverItems
        })
    })

  }


}
