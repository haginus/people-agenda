import { Component, Input, OnInit } from '@angular/core';
import { parseCNP } from 'src/app/parse-CNP';
import { Person } from '../../people.service';

@Component({
  selector: 'app-people-list',
  templateUrl: './people-list.component.html',
  styleUrls: ['./people-list.component.scss']
})
export class PeopleListComponent implements OnInit {

  constructor() { }

  @Input('people') people: Person[];

  ngOnInit(): void {
  }

  onRightClick() {
    return false;
  }
}
