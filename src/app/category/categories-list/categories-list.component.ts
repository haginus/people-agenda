import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Collection, Category, PeopleService } from '../../people.service';
import { CategoryEditorComponent } from '../category-editor/category-editor.component';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss']
})
export class CategoriesListComponent implements OnInit {

  constructor(private peopleService: PeopleService, private dialog: MatDialog) { }

  @Input('categories') categories : Category[];

  ngOnInit(): void { }

  editCategory(categoryId: number) {
    const dialogRef = this.dialog.open(CategoryEditorComponent, {
      data: {
        categoryId: categoryId,
        mode: 'edit'
      }
    });
  }

  deleteCategory(categoryId: number) {
    const dialogRef = this.dialog.open(CategoryEditorComponent, {
      data: {
        categoryId: categoryId,
        mode: 'delete'
      }
    });
  }

  onRightClick() {
    return false;
  }

}
