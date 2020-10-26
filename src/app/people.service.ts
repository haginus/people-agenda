import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { DBConfig } from 'ngx-indexed-db';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})

export class PeopleService {

  constructor(private snackBar: MatSnackBar, private dbService: NgxIndexedDBService) { }

  getCategories() : Observable<Category[]> {
    return this.dbService.getAll("categories");
  }

  getCategory(categoryId : number) : Observable<Category> {
    return this.dbService.getByID("categories", categoryId);
  }

  addCategory(category: Category) : Observable<number> {
    category.dateCreated = new Date().getTime();
    category.peopleCount = 0;
    delete category.categoryId;
    return this.dbService.add("categories", category);
  }

  /**
   * Updates a category with the given information.
   * @param category The category information, containing its ID.
   * @returns The new category information.
   */
  editCategory(category: Category) : Observable<Category> {
    return this.dbService.update("categories", category).pipe(
      map(categories => categories[category.categoryId])
    );
  }

  /**
   * Deletes the category with the specified ID.
   * @param categoryId ID of the category to be deleted
   * @returns An array of the left categories in the database
   */

  deleteCategory(categoryId : number) : Observable<Category[]> {
    return this.dbService.delete("categories", categoryId);
  }
  
  private _changePeopleCount(categoryId : number, change : number) : Observable<Category> {
    return new Observable(observer => {
      return this.getCategory(categoryId).subscribe(category => {
        category.peopleCount += change;
        this.editCategory(category).subscribe(newCategory => {
          observer.next(newCategory);
          observer.complete();
        })
      });
    });
  }

  private changePeopleCount(categoryIds : number[], change : number) : Observable<boolean> {
    return new Observable(observer => {
      categoryIds.length
      let nr = 0;
      const count = () => {
        nr++;
        if(nr == categoryIds.length) {
          observer.next(true);
          observer.complete();
        }
      }
      for(let i = 0; i < categoryIds.length; i++)
        this._changePeopleCount(categoryIds[i], change).subscribe(_ => count());
    });
  } 

  getPeople() : Observable<Person[]> {
    return this.dbService.getAll("people");
  }

  getPeopleByCategory(categoryId : number) : Observable<Person[]> {
    return this.dbService.getAllByIndex("people", "categoryId", IDBKeyRange.only(categoryId));
  }

  getStarredPeople() : Observable<Person[]> {
    return this.dbService.getAllByIndex("people", "starred", IDBKeyRange.only(1));
  }

  addPerson(person: Person) : Observable<number> {
    this.changePeopleCount(person.categoryId, 1).subscribe(_ => {});
    return this.dbService.add("people", person);
  }

  getPerson(personId: number) : Observable<Person> {
    return this.dbService.getByID("people", personId);
  }

  editPerson(person: Person) : Observable<Person> {
    this.getPerson(person.personId).pipe(
      map(person => person.categoryId)).subscribe(categoryIds => {
        this.changePeopleCount(categoryIds, -1).subscribe(_ => {
          this.changePeopleCount(person.categoryId, 1).subscribe(_ => {});
        });
      });
    
    return this.dbService.update("people", person).pipe(
      map(people => people[person.personId])
    );
  }

  deletePerson(personId : number) : Observable<Person[]> {
    this.getPerson(personId).pipe(
      map(person => person.categoryId),
      switchMap(categoryId => this.changePeopleCount(categoryId, -1))
    ).subscribe(_ => {});
    return this.dbService.delete("people", personId);
  }

  showToast(message : string, duration : number = 5000) {
    this.snackBar.open(message, null, {
      duration: duration,
      horizontalPosition: 'start',
      verticalPosition: 'bottom',
    });
  }
}


export interface Collection<T> {
  [id: string]: T
}

export interface Category {
  categoryId?: number,
  name: string,
  peopleCount?: number,
  dateCreated?: number
}

export interface Person {
  personId?: number,
  firstName: string,
  lastName: string,
  alias?: string,
  CNP: string,
  photo?: string,
  notes: Note[],
  categoryId: number[],
  starred?: 0 | 1,
  home?: string,
  identityCard?: string
}

export interface Note {
  title?: string,
  content: string,
  timestamp: number
}

export interface PeopleQuery {
  sortBy?: {
    index: string,
    order: 'asc' | 'desc'
  },
  filterByCategory?: number[],
  filterByAge?: 'all' | 'minor' | 'major'
  personDetails?: string
}

export const dbConfig: DBConfig = {
  name: 'PeopleAgendaDB',
  version: 1,
  objectStoresMeta: [{
    store: 'people',
    storeConfig: { keyPath: 'personId', autoIncrement: true },
    storeSchema: [
      { name: 'firstName', keypath: 'firstName', options: { unique: false } },
      { name: 'lastName', keypath: 'lastName', options: { unique: false } },
      { name: 'alias', keypath: 'alias', options: { unique: false } },
      { name: 'CNP', keypath: 'CNP', options: { unique: false } },
      { name: 'photo', keypath: 'photo', options: { unique: false } },
      { name: 'notes', keypath: 'notes', options: { unique: false } },
      { name: 'categoryId', keypath: 'categoryId', options: { unique: false } },
      { name: 'starred', keypath: 'starred', options: { unique: false } },
      { name: 'home', keypath: 'home', options: { unique: false } },
      { name: 'identityCard', keypath: 'identityCard', options: { unique: false } }
    ]
  }, {
    store: 'categories',
    storeConfig: { keyPath: 'categoryId', autoIncrement: true },
    storeSchema: [
      { name: 'name', keypath: 'name', options: { unique: false } },
      { name: 'dateCreated', keypath: 'dateCreated', options: { unique: false } },
      { name: 'peopleCount', keypath: 'peopleCount', options: { unique: false } },
    ]
  }]
};
