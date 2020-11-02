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
      this.config.getConfig().subscribe(config => {
        if(config.acceptedTerms)
          this.navigate(true);
      })
    });
  }

  acceptTerms() : void {
    this.config.acceptTerms().subscribe(accepted => {
      if(accepted) 
        this.navigate();
    })
  }

  navigate(prevAccepted = false) : void {
    if(!prevAccepted && this.prevURL) 
      this.router.navigateByUrl(this.prevURL);
    else
      this.router.navigate(['']);
  }

}
