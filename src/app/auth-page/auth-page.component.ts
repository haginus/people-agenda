import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss']
})
export class AuthPageComponent implements OnInit {

  constructor(private auth: AuthService, private snackbar: MatSnackBar, private router: Router) { }

  authError: string;
  loading: boolean = false;
  page: "login" | "register" | null = null;
  matcher = new MyErrorStateMatcher();

  authForm = new FormGroup({
    email: new FormControl(null, [Validators.email, Validators.required])
  })

  loginForm = new FormGroup({
    email: new FormControl(null, [Validators.email, Validators.required]),
    password: new FormControl(null, [Validators.minLength(6), Validators.required])
  })

  registerForm = new FormGroup({
    email: new FormControl(null, [Validators.email, Validators.required]),
    password: new FormControl(null, [Validators.minLength(6), Validators.required]),
    firstName: new FormControl(null, Validators.required),
    lastName: new FormControl(null, Validators.required)
  })

  ngOnInit(): void {
  }

  tryLogin() {
    this.loading = true;
    let email = this.authForm.get("email").value;
    this.auth.checkEmail(email).subscribe(emailExists => {
        this.page = emailExists ? "login" : "register";
        let control = emailExists ? this.loginForm.get("email") : this.registerForm.get("email");
        control.setValue(email);
        this.loading = false;
    });
  }

  back() {
    this.page = null;
  }


  login() {
    this.loading = true;
    const email = this.loginForm.get("email").value;
    const password = this.loginForm.get("password").value;
    this.auth.login(email, password).pipe(
      catchError(err => {
        this.handleError(err.code);
        return of(null);
      })
    ).subscribe(user => {
      if(user) {
        this.router.navigate(['/']);
      }
      this.loading = false;
    });
  }

  async signUp() {
    this.loading = true;
    const email = this.registerForm.get("email").value;
    const password = this.registerForm.get("password").value;
    const firstName = this.registerForm.get("firstName").value;
    const lastName = this.registerForm.get("lastName").value;
    let res = await this.auth.signUp(email, password, firstName, lastName);
    if(res.status == 'success') {
      this.router.navigate(['/']);
    } else {
      console.log(res.error);
      this.handleError(res.error.code);
    }
    this.loading = false;
  }

  handleError(err: string) {
    let msg: string;
    switch(err) {
      case "auth/wrong-password":
        msg = "Parola introdusă este greșită.";
        break;
      case "auth/user-not-found":
        msg = "Acest utilizator nu există.";
        break;
      default:
        msg = "A apărut o eroare.";
    }

    this.snackbar.open(msg, null, {duration: 3000})

  }

  get email() { return this.authForm.get("email").value }
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective): boolean {
    return control && control.invalid && (control.dirty || control.touched)
  }
}
