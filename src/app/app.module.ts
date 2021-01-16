import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { AppRoutingModule, SetupGuard } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { SetupComponent } from './setup/setup.component';
import { dbConfig } from './people.service'

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoriesListComponent } from './category/categories-list/categories-list.component';
import { PeopleListComponent } from './person/people-list/people-list.component';
import { ProfilePictureComponent } from './person/profile-picture/profile-picture.component';
import { DialogPersonCategory, DialogPersonDelete, DialogViewPhoto, PersonComponent } from './person/person.component';
import { NoteEditorComponent } from './person/note-editor/note-editor.component';
import { CategoryEditorComponent } from './category/category-editor/category-editor.component';
import { DialogSearchFilters, PeopleSearchComponent } from './people-search/people-search.component';
import { AgePipe } from './person/age.pipe';
import { AuthPageComponent } from './auth-page/auth-page.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@NgModule({
  declarations: [
    AppComponent,
    SetupComponent,
    DashboardComponent,
    CategoriesListComponent,
    PeopleListComponent,
    ProfilePictureComponent,
    PersonComponent,
    NoteEditorComponent,
    CategoryEditorComponent,
    PeopleSearchComponent,
    DialogPersonDelete,
    DialogPersonCategory,
    DialogSearchFilters,
    DialogViewPhoto,
    AgePipe,
    AuthPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    FormsModule,
    MatSelectModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    NgxIndexedDBModule.forRoot(dbConfig),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule
  ],
  providers: [SetupGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
