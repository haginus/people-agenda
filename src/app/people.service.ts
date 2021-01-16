import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { DBConfig } from 'ngx-indexed-db';
import { from, Observable, of } from 'rxjs';
import { catchError, concatMap, map, switchMap, tap } from 'rxjs/operators';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})

export class PeopleService {

  constructor(private snackBar: MatSnackBar, private dbService: NgxIndexedDBService, private afs: AngularFirestore, private auth: AuthService) { }

  getCategories() : Observable<Category[]> {
    let collectionRef = this.afs.collection<Category>("categories");
    return collectionRef.valueChanges({idField: 'categoryId'});
  }

  getCategory(categoryId : any) : Observable<Category> {
    let docRef = this.afs.doc<Category>("categories/" + categoryId);
    return docRef.get().pipe(
      map(snapshot => { return {...snapshot.data(), categoryId: categoryId }}),
      tap(d => console.log(d))
    );
  }

  addCategory(category: Category) : Observable<any> {
    category.dateCreated = new Date().getTime();
    category.peopleCount = 0;
    delete category.categoryId;
    let collectionRef = this.afs.collection<Category>("categories");
    return from(collectionRef.add(category));
  }

  editCategory(category: Category) : Observable<void> {
    let docRef = this.afs.doc<Category>("categories/" + category.categoryId);
    delete category.categoryId;
    return from(docRef.set(category));
  }

  /**
   * Deletes the category with the specified ID.
   * @param categoryId ID of the category to be deleted
   * @returns An array of the left categories in the database
   */

  deleteCategory(categoryId : number) : Observable<void> {
    let docRef = this.afs.doc<Category>("categories/" + categoryId);
    return from(docRef.delete());
  }

  private changePeopleCount(categoryIds : number[], change : number) : Observable<boolean> {
    return new Observable(observer => {
      observer.next(true);
    });
  } 

  getPeople() : Observable<Person[]> {
    let collectionRef = this.afs.collection<Person>("people");
    return collectionRef.valueChanges({idField: 'personId'});
  }

  getPeopleByCategory(categoryId : number) : Observable<Person[]> {
    let collectionRef = this.afs.collection<Person>("people", ref => ref.where('categoryId', '==', categoryId));
    return collectionRef.valueChanges({idField: 'personId'});
  }

  getStarredPeople() : Observable<Person[]> {
    return this.auth.getUser().pipe(
      switchMap(user => {
        let collectionRef = this.afs.collection<Person>("people", ref => ref.where('starredBy', 'array-contains', user.uid));
        return collectionRef.valueChanges({idField: 'personId'});
      })
    );
  }

  addPerson(person: Person) : Observable<string> {
    let collectionRef = this.afs.collection<Person>("people");
    delete person.personId;
    return from(collectionRef.add(person)).pipe(
      map(ref => ref.id)
    );
  }

  getPerson(personId: string) : Observable<Person> {
    let docRef = this.afs.doc<Person>("people/" + personId)
    return docRef.valueChanges({idField: 'personId'});
  }

  editPerson(person: Person) : Observable<Person> {
    let docRef = this.afs.doc<Person>("people/" + person.personId);
    return from(docRef.update(person)).pipe(
      map(_ => person)
    );
  }

  deletePerson(personId : string) : Observable<any> {
    let docRef = this.afs.doc<Person>("people/" + personId);
    return from(docRef.delete());
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
  categoryId?: string,
  name: string,
  peopleCount?: number,
  dateCreated?: number
}

export interface Person {
  personId?: string,
  firstName: string,
  lastName: string,
  alias?: string,
  CNP: string,
  photo?: string,
  notes: Note[],
  categoryId: string[],
  starredBy: string[],
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
  filterByCategory?: string[],
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
