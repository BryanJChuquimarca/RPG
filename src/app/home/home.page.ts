import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCol, IonRow, IonGrid, IonContent, IonButton } from '@ionic/angular/standalone';
import { AuthService } from '@auth0/auth0-angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonCol, IonRow, IonGrid, IonContent, CommonModule, FormsModule, IonButton]
})

export class HomePage implements OnInit {

  public player: any;
  public host_url: string = 'http://localhost:3000'

  constructor(private auth: AuthService, private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.auth.user$.subscribe((data) => {
      this.player = data;
      console.log(this.player);

      this.http.get(`${this.host_url}/player/${this.player.email}`).subscribe((response) => {
        // 1. check if user exist in database
        if (response == 'Player not found') {
          // 1.1 if player doesn't exist, create player
          //Navigate to create player page
          this.router.navigate(['/character-creation']);
          
        } else {
          console.log('Player found');
          // 1.2 if player exist, load player data


        }
        console.log(response);
      })

    });
  }

  userCheck(id: string) {

  }

}