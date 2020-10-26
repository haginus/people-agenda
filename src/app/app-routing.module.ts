import { Injectable, NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PeopleSearchComponent } from './people-search/people-search.component';
import { PersonComponent } from './person/person.component';
import { SetupComponent } from './setup/setup.component';


@Injectable()
export class SetupGuard implements CanActivate {
    constructor(private config: ConfigService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      let prevURL = route.url.join('/');
      return this.config.getConfig().pipe(
        map(e => {
          if (e && e.acceptedTerms) {
            return true;
          } else {
            if(prevURL)
              this.router.navigate(['/setup', prevURL]);
            else
              this.router.navigate(['/setup']);
          }
        }),
        catchError((err) => {
          if(prevURL)
            this.router.navigate(['/setup', prevURL]);
          else
            this.router.navigate(['/setup']);
          return of(false);
        })
      );
    }
}


const routes: Routes = [
  { path: 'setup', component: SetupComponent },
  { path: 'setup/:prevURL', component: SetupComponent },
  { path: '', pathMatch: 'full', component: DashboardComponent, canActivate: [SetupGuard] },
  { path: 'search', component: PeopleSearchComponent, canActivate: [SetupGuard] },
  { path: 'category/:categoryId', component: PeopleSearchComponent, canActivate: [SetupGuard] },
  { path: 'person/create', component: PersonComponent, canActivate: [SetupGuard], data: {mode: 'edit'} },
  { path: 'person/:personId', component: PersonComponent, canActivate: [SetupGuard], data: {mode: 'view'} },
  { path: 'share/:URI', component: PersonComponent, canActivate: [SetupGuard], data: {mode: 'share'} },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
