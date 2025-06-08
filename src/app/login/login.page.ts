import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonButton]
})
export class LoginPage implements OnInit {

  constructor(public auth: AuthService, @Inject(DOCUMENT) private document: Document) { }
  public usuario: any;

  async ngOnInit() {
    this.auth.user$.subscribe((data: any) => {
      this.usuario = data;
    });




  }

  login() {
    this.auth.loginWithRedirect({
      appState: {
        target: '/home'
      }
    });
  };

  
  logout() {
    this.auth.logout({
      logoutParams: {
        returnTo: this.document.location.origin
      }
    });
  }

}
