import { Location } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router, RoutesRecognized } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';
import { NoteEditorComponent } from './note-editor/note-editor.component';
import { Category, Collection, PeopleService, Person } from '../people.service';
import { FormControl, FormGroup, FormGroupDirective, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { CategoryEditorComponent } from '../category/category-editor/category-editor.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { parseCNP } from '../parse-CNP';
import { imageResize } from './image-resize';
import { environment } from './../../environments/environment';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss']
})
export class PersonComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router, private location: Location,
    private peopleService: PeopleService, private dialog: MatDialog) { }

  personId: number;
  person : Person;
  categories : Category[];
  private lastPhoto : string;
  mode: 'edit' | 'view' | 'share';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if(params['personId'] != undefined) {
        this.personId = +params['personId'];
        this.getPerson();
      } else {
        if(params['URI']) {
          this.person = this.decodePerson(params['URI']);
        }
        else
          this.person = {lastName: null, firstName: null, CNP: null, notes: [], categoryId: []}
      }
    });

    this.route.data.subscribe(data => {
      this.mode = data.mode;
    });

    this.peopleService.getCategories().subscribe(categories => this.categories = categories);
  }

  getPerson() {
    this.peopleService.getPerson(this.personId).subscribe(person => {
      if(person) {
        this.person = person;
        this.lastPhoto = person.photo;
      } else {
        this.router.navigate(['']);
      }
    });
  }

  //setForm

  goBack() {
    if(this.mode == 'edit' && this.personId != undefined) {
      this.mode = 'view';
      this.person.photo = this.lastPhoto;
      return
    }
    let state = this.location.getState();
    if(state && state['navigationId'] >= 2) 
      this.location.back();
    else this.router.navigate(['']);
  }

  editNote(id? : number) {
    let data = {
      mode: 'edit',
      notes: this.person.notes
    }
    if(id != undefined) data["noteId"] = id;
    const dialogRef = this.dialog.open(NoteEditorComponent, {
      data: data
    });
    dialogRef.afterClosed().subscribe(res => {
      if(res) {
        this.savePerson();
      }
    })
  }

  deleteNote(id: number) {
    const dialogRef = this.dialog.open(NoteEditorComponent, {
      data: {
        noteId: id,
        mode: 'delete',
        notes: this.person.notes
      }
    });
    dialogRef.afterClosed().subscribe(res => {
      if(res) {
        this.savePerson();
      }
    })
  }

  savePerson() {
    if(this.mode == 'edit') {
      this.person.firstName = this.firstName.value;
      this.person.lastName = this.lastName.value;
      this.person.alias = this.alias.value;
      this.person.CNP = this.CNP.value;
      this.person.categoryId = this.categoryId.value;
      this.person.home = this.home.value;
      this.person.identityCard = this.identityCard.value;
      this.mode = 'view';
    }
    if(this.personId != undefined)
      this.peopleService.editPerson(this.person)
    else {
      this.peopleService.addPerson(this.person).subscribe(id => {
        this.location.replaceState('/person/' + id);
        this.personId = id;
        this.person.personId = id;
      });
    }
    this.lastPhoto = this.person.photo;

    this.peopleService.showToast('Persoană salvată.', 3000);
  }

  startEditMode() {
    this.firstName.setValue(this.person.firstName);
    this.lastName.setValue(this.person.lastName);
    this.alias.setValue(this.person.alias);
    this.CNP.setValue(this.person.CNP);
    this.categoryId.setValue(this.person.categoryId);
    this.home.setValue(this.person.home);
    this.identityCard.setValue(this.person.identityCard);
    this.mode = 'edit';
  }

  addCategory() {
    const dialogRef = this.dialog.open(CategoryEditorComponent, {
      data: {
        mode: 'edit'
      }
    });
    let prev : number[] = this.categoryId.value;
    console.log(prev)
    dialogRef.afterClosed().subscribe(res => {
      if(res) {
        this.categories.push(res)
        prev.push(res.categoryId)
        this.categoryId.setValue(prev);
      }
    });
  }

  deletePerson() {
    const dialogRef = this.dialog.open(DialogPersonDelete);
    dialogRef.afterClosed().subscribe(res => {
      if(res) {
        this.peopleService.deletePerson(this.personId).subscribe(res => {
          this.peopleService.showToast('Persoană ștearsă.');
          this.goBack();
        })
      }
    })
  }

  toggleStarred() {
    let starred = this.person.starred;
    this.person.starred = starred ? 0 : 1; 
    this.peopleService.editPerson(this.person).subscribe(res => {
      let msg = 'Persoana a fost ' + (!starred ? 'adăugată la' : 'scoasă de la') + ' favorite.';
      this.peopleService.showToast(msg);
    })
  }

  uploadPhoto(files : File[]) {
    if(files.length)
      imageResize(files[0]).subscribe(res => {
        this.person.photo = res as string;
      });
  }

  clearPhoto() {
    delete this.person.photo;
  }

  viewPhoto() {
    if(this.person.photo)
      this.dialog.open(DialogViewPhoto, {
        data: this.person.photo,
        id: 'fullScreen'
      });
  }

  private encodePerson() {
    let person : any = {... this.person};
    delete person.photo;
    delete person.personId;
    delete person.categoryId;
    delete person.starred;
    let str = JSON.stringify(person);
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
      return String.fromCharCode(parseInt(p1, 16))
    }))
  }

  private decodePerson(str : string) {
    try {
      let decoded = decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''));
      let person = JSON.parse(decoded);
      delete person.personId;
      person.starred = 0;
      person.categoryId = [];
      return person;
    } catch(e) {
      this.peopleService.showToast("Eroare la obținerea persoanei distribuite. 😞");
      this.router.navigate(['']);
    }
  }

  sharePerson() {
    let encoded = this.encodePerson();
    let url = '/share/' + encoded;
    let text = `Informații despre ${this.person.firstName} ${this.person.lastName}`;
    if(this.person.alias) text += `, zis “${this.person.alias}”`;
    if (navigator.share) {
      navigator.share({
        title: 'Persoană distribuită',
        text: text,
        url: url,
      })
        .then(() => {})
        .catch((error) => {
          navigator.clipboard.writeText(environment.url + url).then(() => {
            this.peopleService.showToast('Informații copiate în clipboard.');
          })
        });
    } else {
      navigator.clipboard.writeText(environment.url + url).then(() => {
        this.peopleService.showToast('Informații copiate în clipboard.');
      })
    }
  }

  saveSharedPerson() {
    const dialogRef = this.dialog.open(DialogPersonCategory, {
      data: {
        person: this.person,
        categories: this.categories
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if(res) {
        this.savePerson();
        this.mode = 'view';
      }
    })
  }

  personForm = new FormGroup({
      'lastName': new FormControl(null, [Validators.required]),
      'firstName': new FormControl(null, [Validators.required]),
      'alias': new FormControl(null, []),
      'CNP': new FormControl(null, [Validators.required, validCNP]),
      'categoryId': new FormControl([], [Validators.required]),
      'home': new FormControl(null),
      'identityCard': new FormControl(null)
    });

  matcher = new MyErrorStateMatcher();

  get firstName() { return this.personForm.get("firstName"); }
  get lastName() { return this.personForm.get("lastName"); }
  get alias() { return this.personForm.get("alias"); }
  get CNP() { return this.personForm.get("CNP"); }
  get categoryId() { return this.personForm.get("categoryId"); }
  get home() { return this.personForm.get("home"); }
  get identityCard() { return this.personForm.get("identityCard"); }

}

export const validCNP: ValidatorFn = (control: FormControl): ValidationErrors | null => {
  const cnp : string = control.value;
  try {
    parseCNP(cnp)
  } catch(e) {
    return e;
  }
  return null;
};


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective): boolean {
    return control && control.invalid && (control.dirty || control.touched)
  }
}

@Component({
  selector: 'dialog-person-delete',
  templateUrl: '../dialog-templates/dialog-person-delete.html',
})
export class DialogPersonDelete {} 

@Component({
  selector: 'dialog-person-category',
  templateUrl: '../dialog-templates/dialog-person-category.html',
})
export class DialogPersonCategory {
  constructor(@Inject(MAT_DIALOG_DATA) public data : any, private dialog: MatDialog) {}
  addCategory() {
    const dialogRef = this.dialog.open(CategoryEditorComponent, {
      data: {
        mode: 'edit'
      }
    });
    dialogRef.afterClosed().subscribe(res => {
      if(res) {
        this.data.categories.push(res);
        this.data.person.categoryId.push(res.categoryId);
      }
    });
  }
} 

@Component({
  selector: 'dialog-view-photo',
  template: '<div style="display: flex;"><img [src]="photo" style="width: 100%;"/></div>',
})
export class DialogViewPhoto {
  constructor(@Inject(MAT_DIALOG_DATA) public photo : string) {}
} 
