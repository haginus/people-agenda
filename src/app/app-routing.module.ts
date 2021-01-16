import { Injectable, NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthPageComponent } from './auth-page/auth-page.component';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PeopleSearchComponent } from './people-search/people-search.component';
import { PersonComponent } from './person/person.component';
import { SetupComponent } from './setup/setup.component';


@Injectable()
export class SetupGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      let prevURL = route.url.join('/');
      return this.auth.getUser().pipe(
        map(e => {
          if (e && e.uid) {
            return true;
          } else {
            if(prevURL)
              this.router.navigate(['/auth', prevURL]);
            else
              this.router.navigate(['/auth']);
          }
        }),
        catchError((err) => {
          if(prevURL)
            this.router.navigate(['/auth', prevURL]);
          else
            this.router.navigate(['/auth']);
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
  { path: 'auth', component: AuthPageComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
