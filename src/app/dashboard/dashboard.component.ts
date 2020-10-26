import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CategoryEditorComponent } from '../category/category-editor/category-editor.component';
import { Category, PeopleService, Person } from '../people.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private dialog: MatDialog, private peopleService: PeopleService) { }

  categories : Category[];
  favoritePeople : Person[];

  ngOnInit(): void {
    this.peopleService.getCategories().subscribe(res => this.categories = res);
    this.peopleService.getStarredPeople().subscribe(res => this.favoritePeople = res);
  }

  addCategory() {
    const dialogRef = this.dialog.open(CategoryEditorComponent, {
      data: {
        mode: 'edit'
      }
    });
    dialogRef.afterClosed().subscribe(res => {
      if(res)
        this.categories.push(res)
    });
  }

}
