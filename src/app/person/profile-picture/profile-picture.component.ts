import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.scss']
})
export class ProfilePictureComponent implements OnInit {

  constructor() { }
  @Input('photo') photo : String;
  @Input('width') width : number = 48;
  @Input('height') height : number = 48;
  @Input('colorPal') colorPal: any = null;
  ngOnInit(): void {
    if(this.colorPal === null)
      this.colorPal = colors[Math.floor(Math.random() * colors.length)]
  }

}

const colors = [
  {bg: '#2196F3', color: '#FFFFFF'},
  {bg: '#4CAF50', color: '#FFFFFF'},
  {bg: '#FFEB3B', color: '#000000'},
  {bg: '#673AB7', color: '#FFFFFF'},
  {bg: '#795548', color: '#FFFFFF'},
  {bg: '#ff4081', color: '#FFFFFF'}
]
