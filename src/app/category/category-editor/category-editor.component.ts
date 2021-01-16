import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category, PeopleService } from 'src/app/people.service';

@Component({
  selector: 'app-category-editor',
  templateUrl: './category-editor.component.html',
  styleUrls: ['./category-editor.component.scss']
})
export class CategoryEditorComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: CategoryEditorData, private peopleService: PeopleService) { }

  category : Category = { name: null };
  error: boolean = false;

  ngOnInit(): void {
    if(!this.data) {
      this.error = true;
      return;
    }
    if(this.data.mode == 'delete' && !this.data.categoryId) {
      this.error = true;
      return;
    }

    if(this.data.categoryId)
      this.peopleService.getCategory(this.data.categoryId).subscribe(category => {
        if(category)
          this.category = category;
        else this.error = true;
      });
  }

  saveCategory() {
    if(this.data?.categoryId)
      this.peopleService.editCategory(this.category);
    else {
      this.peopleService.addCategory(this.category).subscribe();
    }
  }

  deleteCategory() {
    this.peopleService.deleteCategory(this.data.categoryId);
  }

}

export interface CategoryEditorData {
  categoryId?: number,
  mode: 'edit' | 'delete'
}
