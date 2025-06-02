import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonList, IonItem, IonLabel, IonButton } from '@ionic/angular/standalone';
import socket from 'socket.io-client';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sala-espera',
  templateUrl: './sala-espera.page.html',
  styleUrls: ['./sala-espera.page.scss'],
  standalone: true,
  imports: [IonButton, IonLabel, IonItem, IonList, IonCardTitle, IonCardHeader, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SalaEsperaPage implements OnInit {
  public socket: any;
  public player: any;
  public users: string[] = [];
  public roomCode: number = 0;
  public lider: string | null = null;

  host_url: string = 'http://localhost:3000';

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.socket = socket(this.host_url);

    console.log(this.route.snapshot.params)
    let params: any = this.route.snapshot.params;
    this.player = JSON.parse(params.player);
    this.roomCode = +params.room;

    let info = {
      code: params.room,
      username: this.player.email,
      email: this.player.email
    }
    this.socket.emit('join_room', info);

    this.socket.on('room_full', (data: any) => {
      alert(data.message);
      this.router.navigate(['/salas']);
    });

    this.socket.on(`leader_${this.roomCode}`, (leaderEmail: string) => {
      this.lider = leaderEmail;
      console.log('Líder recibido:', this.lider);
    });

    this.socket.on('user_list_' + info.code, (userList: string[]) => {
      console.log(`User list: ${userList}`);
      this.users = userList;
    });

    this.socket.on(`start_game_${this.roomCode}`, () => {
      console.log('¡El juego ha comenzado!');
      this.router.navigate(['/juego', this.roomCode, JSON.stringify(this.player)]);
    });

    this.socket.on('error_message', (data: any) => {
      alert(data.message);
    });

  }

  isLeader(): boolean {
    return this.player.email === this.lider;
  }

  startGame() {
    if (this.isLeader() && this.users.length >= 1) {
      this.socket.emit('start_game', { room: this.roomCode });
    }
  }


}