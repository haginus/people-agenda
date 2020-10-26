import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { config } from 'rxjs';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {

  constructor(private config: ConfigService, private router: Router, private route: ActivatedRoute) { }

  prevURL : string;
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.prevURL = params['prevURL'];
    });
  }

  acceptTerms() : void {
    this.config.acceptTerms().subscribe(accepted => {
      if(accepted) 
        if(this.prevURL) 
          this.router.navigateByUrl(this.prevURL);
        else
          this.router.navigate(['']);
    })
  }

}
