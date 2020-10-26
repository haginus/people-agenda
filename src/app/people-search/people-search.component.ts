import { Location } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { parseCNP } from '../parse-CNP';
import { Category, PeopleQuery, PeopleService, Person } from '../people.service';

@Component({
  selector: 'app-people-search',
  templateUrl: './people-search.component.html',
  styleUrls: ['./people-search.component.scss']
})

export class PeopleSearchComponent implements OnInit {

  constructor(private location: Location, private router: Router, private route: ActivatedRoute,
    private peopleService: PeopleService, private dialog: MatDialog) { }

  categories : Category[];
  peopleFiltered : Person[];
  peopleQueried : Person[];
  people: Person[];
  filtersOn: boolean;
  peopleQuery : PeopleQuery = {
    sortBy: {
      index: "id",
      order: "desc"
    },
    filterByAge: 'all'
  };

  private today: number;

  goBack() {
    let state = this.location.getState();
    if(state && state['navigationId'] >= 2) 
      this.location.back();
    else this.router.navigate(['']);
  }

  ngOnInit(): void {
    this.today = new Date().getTime();

    this.route.params.subscribe(params => {
      if(params && params["categoryId"]) {
        this.peopleQuery.filterByCategory = [+params["categoryId"]]
      }

      this.peopleService.getCategories().subscribe(res => {
        this.categories = res;
        if(!this.peopleQuery.filterByCategory)
          this.peopleQuery.filterByCategory = res.map(category => category.categoryId);
        
        this.peopleService.getPeople().subscribe(res => {
          this.people = res;
          this.filterPeople();
          this.queryPeople();
        });
      });
    });
  }

  filterPeople() {
    //filter
    this.peopleFiltered = this.people.filter(person => this.peopleQuery.filterByCategory.filter(cat => person.categoryId.includes(cat)).length != 0);
    const query = this.peopleQuery;

    if(query.filterByAge == 'minor') 
    this.peopleFiltered = this.peopleFiltered.filter(person => getAge(parseCNP(person.CNP).dateBorn) < 18)
    else if(query.filterByAge == 'major')
      this.peopleFiltered = this.peopleFiltered.filter(person => getAge(parseCNP(person.CNP).dateBorn) >= 18)
    
    if(query.filterByAge != 'all' || query.filterByCategory.length < this.categories.length)
      this.filtersOn = true;
    else
      this.filtersOn = false;
    
    //sort
    if(this.peopleQuery.sortBy.index == 'id' && this.peopleQuery.sortBy.order == 'asc')
      this.peopleFiltered.sort((a, b) => a.personId - b.personId)
    if(this.peopleQuery.sortBy.index == 'id' && this.peopleQuery.sortBy.order == 'desc')
      this.peopleFiltered.sort((a, b) => b.personId - a.personId)
    if(this.peopleQuery.sortBy.index == 'firstName' && this.peopleQuery.sortBy.order == 'asc')
      this.peopleFiltered.sort((a, b) => a.firstName < b.firstName ? -1 : 1)
    if(this.peopleQuery.sortBy.index == 'firstName' && this.peopleQuery.sortBy.order == 'desc')
      this.peopleFiltered.sort((a, b) => a.firstName < b.firstName ? 1 : -1)
    if(this.peopleQuery.sortBy.index == 'lastName' && this.peopleQuery.sortBy.order == 'asc')
      this.peopleFiltered.sort((a, b) => a.lastName < b.lastName ? -1 : 1)
    if(this.peopleQuery.sortBy.index == 'lastName' && this.peopleQuery.sortBy.order == 'desc')
      this.peopleFiltered.sort((a, b) => a.lastName < b.lastName ? 1 : -1)
    if(this.peopleQuery.sortBy.index == 'alias' && this.peopleQuery.sortBy.order == 'asc')
      this.peopleFiltered.sort((a, b) => a.alias < b.alias ? -1 : 1)
    if(this.peopleQuery.sortBy.index == 'alias' && this.peopleQuery.sortBy.order == 'desc')
      this.peopleFiltered.sort((a, b) => a.alias < b.alias ? 1 : -1)
    if(this.peopleQuery.sortBy.index == 'age' && this.peopleQuery.sortBy.order == 'asc')
      this.peopleFiltered.sort((a, b) => getAge(parseCNP(a.CNP).dateBorn) - getAge(parseCNP(b.CNP).dateBorn))
    if(this.peopleQuery.sortBy.index == 'age' && this.peopleQuery.sortBy.order == 'desc')
      this.peopleFiltered.sort((a, b) => getAge(parseCNP(b.CNP).dateBorn) - getAge(parseCNP(a.CNP).dateBorn))
  }

  queryPeople() {
    if(this.peopleQuery.personDetails) {
      this.peopleQuery.personDetails.toLowerCase();
      this.peopleQueried = this.peopleFiltered.filter(person =>
        person.firstName.toLowerCase().includes(this.peopleQuery.personDetails) ||
        person.lastName.toLowerCase().includes(this.peopleQuery.personDetails) ||
        person.CNP.toLowerCase().includes(this.peopleQuery.personDetails) ||
        person.alias?.toLowerCase().includes(this.peopleQuery.personDetails));
    } else this.peopleQueried = this.peopleFiltered;
  }

  openFilters() {
    const dialogRef = this.dialog.open(DialogSearchFilters, {
      id: "fullScreen",
      height: "100vh",
      width: "100vw",
      maxWidth: "100vw",
      data: {
        query: {...this.peopleQuery},
        categories: this.categories
      }
    });
    dialogRef.afterClosed().subscribe(res => {
      this.peopleQuery = res;
      this.filterPeople();
      this.queryPeople();
    })
  }
}

var today = new Date();
const getAge = (date : number) => {
  let birthDate = new Date(date);
  let age = today.getFullYear() - birthDate.getFullYear();
  let m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }
  return age;
}

@Component({
  selector: 'dialog-search-filters',
  templateUrl: '../dialog-templates/dialog-search-filters.html',
})
export class DialogSearchFilters {
  @ViewChild("ageFilter") ageFilter : any;

  peopleQuery: any;
  categories: Category[];
  
  constructor(@Inject(MAT_DIALOG_DATA) private data : any) {
    data.query.filterByAge = [data.query.filterByAge];
    data.query.sortBy.index = [data.query.sortBy.index];
    data.query.sortBy.order = [data.query.sortBy.order];
    this.peopleQuery = this.data.query;
    this.categories = this.data.categories;
  }

  result() : PeopleQuery {
    let query = {...this.peopleQuery};
    query.filterByAge = query.filterByAge[0];
    query.sortBy = { index: query.sortBy.index[0], order: query.sortBy.order[0] }
    return query;
  }
} 

