import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonList, IonItem, IonLabel, IonButton } from '@ionic/angular/standalone';
import socket from 'socket.io-client';
import { AlertController } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  public playerInfo: any;
  host_url: string = 'https://backend-rpg.onrender.com';

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient, private alertController: AlertController) { }

  ngOnInit() {
    this.socket = socket(this.host_url);
    //parametros de la sala y jugador) 
    console.log(this.route.snapshot.params, '1')
    let params: any = this.route.snapshot.params;
    this.player = JSON.parse(params.player);
    this.roomCode = +params.room;
    this.getPlayerInfo();

    //usuario expulsado
    this.socket.on('user_expulsado', async (data: any) => {
      if (data.user === this.playerInfo.name && data.room === this.roomCode) {
        const alert = await this.alertController.create({
          header: 'Expulsado',
          message: 'Has sido expulsado de la sala',
          buttons: ['OK'],
        });
        await alert.present();
        this.router.navigate(['/salas']);
      }
    });

    //Alerta si la sale esta llena
    this.socket.on('room_full', (data: any) => {
      alert(data.message);
      this.router.navigate(['/salas']);
    });
    //Selecciona el lider de la sala
    this.socket.on(`leader_${this.roomCode}`, (leaderEmail: string) => {
      this.lider = leaderEmail;
      console.log('Líder recibido:', this.lider);
    });

    //inicia el juego
    this.socket.on(`start_game_${this.roomCode}`, () => {
      console.log('¡El juego ha comenzado!');
      this.router.navigate(['/mazmorra', this.roomCode], {
        state: {
          players: this.users.map(username => {
            if (username === this.playerInfo.name) {
              return { name: username, email: this.player.email };
            }
            return { name: username, email: username };
          })
        }
      });
    });

    this.socket.on('error_message', (data: any) => {
      alert(data.message);
    });

  }

  isLeader(): boolean {
    return this.playerInfo.name === this.lider;
  }

  expulsar(user: any) {
    if (this.isLeader()) {
      console.log('Expulsando jugador:', user);
      this.socket.emit('expulsar_jugador', { room: this.roomCode, user: user });
      if (this.users.includes(user)) {
        this.users = this.users.filter(u => u !== user);
        console.log('Jugador expulsado:', user);
        if (user === this.playerInfo.name) {
          this.router.navigate(['/salas']);
        }
      }
    }
  }

  startGame() {
    if (this.isLeader() && this.users.length >= 1) {
      this.socket.emit('start_game', { room: this.roomCode });
      this.router.navigate(['/mazmorra', this.roomCode], {
        state: { players: this.users }
      });
    }
  }

  getPlayerInfo() {
    this.http.get(`${this.host_url}/player/${this.player.email}`).subscribe((response) => {
      console.log(response, 'usuario info');
      this.playerInfo = response;
      console.log(this.playerInfo.name);
      let info = {
        code: this.roomCode,
        username: this.playerInfo.name,
        email: this.player.email
      };
      this.socket.emit('join_room', info);
      this.socket.on('user_list_' + info.code, (userList: string[]) => {
        console.log(`User list: ${userList}`);
        this.users = userList;
      });
    });
  }
}