import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCol, IonRow, IonGrid, IonContent, IonItem, IonLabel, IonList, IonButton } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';

import socket from 'socket.io-client';


@Component({
  selector: 'app-salas',
  templateUrl: './salas.page.html',
  styleUrls: ['./salas.page.scss'],
  standalone: true,
  imports: [IonCol, IonRow, IonGrid, IonContent, CommonModule, FormsModule, IonItem, IonLabel, IonList, IonButton]
})
export class SalasPage implements OnInit {
  public socket: any;
  public player: any;
  message = '';
  messages: { username: string, message: string }[] = [];
  users: string[] = [];
  typingUsers: Set<string> = new Set();
  joined = false;
  host_url: string = 'http://localhost:3000';
  currentRoom: number | null = null;
  playerInfo: any;
  constructor(private auth: AuthService, private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.socket = socket(this.host_url);

    this.auth.user$.subscribe((data) => {
      this.player = data;
      console.log(this.player);
    });

  }


  joinRoom(room_num: number) {
    this.http.get(`${this.host_url}/player/${this.player.email}`).subscribe((response) => {
      console.log(response, 'usuario info');
      this.playerInfo = response;
      let info = {
        code: room_num,
        username: this.playerInfo.name,
        email: this.player.email
      };
      this.socket.emit('join_room', info);
      this.router.navigate(['/sala-espera', { room: room_num, player: JSON.stringify(this.player) }]);
    })


  }


}
