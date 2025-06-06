import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonCardHeader, IonCard, IonCardTitle, IonList, IonItem } from '@ionic/angular/standalone';
import socket from 'socket.io-client';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-mazmorra',
  templateUrl: './mazmorra.page.html',
  styleUrls: ['./mazmorra.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCardHeader, IonCard, IonCardTitle, IonList, IonItem]
})
export class MazmorraPage implements OnInit {
  socket: any;
  player: any;
  players: any[] = [];
  enemies: any[] = [];
  turnOrder: any[] = [];
  roomCode = 0;
  currentRound = 1;
  maxRounds = 4;
  bossRound = false;
  enemy: any = null;
  boss: any = null;


  host_url: string = 'http://localhost:3000';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private auth: AuthService) { }

  ngOnInit() {
    this.socket = socket(this.host_url);
    let params: any = this.route.snapshot.params;
    this.roomCode = +params.room;

    this.auth.user$.subscribe((user) => {
      this.player = user;
      console.log('Jugador actual:', this.player);

      this.socket.emit('join_room', {
        email: this.player.email,
        username: this.player.name,
        code: this.roomCode
      });

      setTimeout(() => {
        this.socket.emit('get_room_players', this.roomCode);
      }, 500);
    });

    this.socket.on('set_turn_order', (orden: any) => {
      this.turnOrder = orden;
      console.log('Orden de turnos:', orden);
    });


    this.socket.on('room_players_data', (emails: any[]) => {
      console.log('Emails recibidos:', emails);

      this.players = [];

      let uniqueEmails = Array.from(new Set(emails.map(p => p.email)));

      uniqueEmails.forEach((email) => {
        this.http.get(`${this.host_url}/player/${email}`).subscribe((playerData: any) => {
          this.http.get(`${this.host_url}/player/${email}/progress`).subscribe((progressData: any) => {
            let jugador = {
              id: playerData.id,
              name: playerData.name,
              health_points: playerData.health_points,
              mana_points: playerData.mana_points,
              strength: playerData.strength,
              magical_damage: playerData.magical_damage,
              defense: playerData.defense,
              critical_chance: playerData.critical_chance,
              critical_damage: playerData.critical_damage,
              experience: playerData.experience,
              level: playerData.level,
              currency: playerData.currency,
              current_stage: progressData.current_stage,
              enemies_defeated: progressData.enemies_defeated,
              enemy_boost: progressData.enemy_boost
            };

            this.players.push(jugador);
            console.log('Jugadores:', this.players)

            if (this.players.length === uniqueEmails.length) {
              this.obtenerEnemigos();
              this.CalcularMedia();

            }
          });
        });
      });
    });


  };

  obtenerEnemigos() {
    this.enemies = [];
    let totalEnemigos = 11;
    let recibidos = 0
    for (let i = 1; i <= totalEnemigos; i++) {
      this.http.get(`${this.host_url}/enemies/${i}`).subscribe((enemyData: any) => {
        let enemy = {
          id: enemyData.id,
          name: enemyData.name,
          health_points: enemyData.health_points,
          mana_points: enemyData.mana_points,
          strength: enemyData.strength,
          magical_damage: enemyData.magical_damage,
          defense: enemyData.defense,
          experience_reward: enemyData.experience_reward,
          currency_reward: enemyData.currency_reward,
          rarity_drop: enemyData.rarity_drop,
          rank: enemyData.rank,
          boss: enemyData.boss
        };

        this.enemies.push(enemy);
        recibidos++;
        if (recibidos == totalEnemigos) {
          this.enemies.sort((a, b) => a.id - b.id);
          console.log('Enemigos ordenados:', this.enemies);
        }
      });
    }
  }

  //ahora calcular media del current_stage de todos los jugadores
  CalcularMedia() {
    let suma = this.players.reduce((a, b) => a + (b.current_stage || 0), 0);
    console.log(suma)
    let media = suma / this.players.length
    console.log(media)
  }






  mesclarArray() {
  };

  generarTurnos() {

  };


}
