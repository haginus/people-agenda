import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { from, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: AngularFireAuth, private afs: AngularFirestore) { }

  login(email: string, password: string): Observable<firebase.auth.UserCredential> {
    return from(this.auth.signInWithEmailAndPassword(email, password));
  }

  logout() {
    return this.auth.signOut();
  }

  getUser() : Observable<firebase.User> {
    return this.auth.user;
  }

  checkEmail(email: string) {
    return new Observable(observer => {
      this.auth.signInWithEmailAndPassword(email, "a").catch(err => {
        if(err.code === "auth/user-not-found") {
          observer.next(false);
        } else {
          console.log(err);
          observer.next(true);
        }
        observer.complete();
      })
    })
  }

  async signUp(email: string, password: string, firstName: string, lastName: string) {
    try {
      let user = await this.auth.createUserWithEmailAndPassword(email, password);
      let userDocument = this.afs.doc("users/" + user.user.uid);
      await userDocument.set({firstName: firstName, lastName: lastName});
      return {status: "success", user: user };
    } catch(err) {
      return {status: "error", error: err };
    }
  }
}
