import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonCardHeader, IonCard, IonCardTitle, IonCardContent, } from '@ionic/angular/standalone';
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
  imports: [IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCardHeader, IonCard, IonCardTitle, IonCardContent]
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
  lider: any
  currentTurnIndex = 0;
  battleLog: string[] = [];
  host_url: string = 'http://localhost:3000';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private auth: AuthService) { }

  ngOnInit() {
    this.socket = socket(this.host_url);
    let params: any = this.route.snapshot.params;
    this.roomCode = +params.room;

    this.socket.on(`leader_${this.roomCode}`, (leaderEmail: string) => {
      this.lider = leaderEmail;
    });

    this.auth.user$.subscribe((user) => {
      this.player = user;
      //console.log('Jugador actual:', this.player);

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
      //console.log('Orden de turnos:', orden);
    });


    this.socket.on('room_players_data', (emails: any[]) => {

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
              class: playerData.class,
              current_stage: progressData.current_stage,
              enemies_defeated: progressData.enemies_defeated,
              enemy_boost: progressData.enemy_boost

            };

            this.players.push(jugador);
            //console.log(this.players)
            if (this.players.length === uniqueEmails.length) {
              this.obtenerEnemigos(() => {
                this.CalcularMedia();
                this.guardarEnemigosPorNivel();
                //this.socket.emit('player_ready', this.roomCode, this.player.email);

              });
            }
          });
        });
      });
    });

    /*this.socket.on(`enemigossala${this.roomCode}`, (enemy: any) => {
      //console.log("📥 Recibí los enemigos del líder:", enemy);
      this.enemy = enemy;
      this.mesclarArray();
    });*/

  };

  obtenerEnemigos(callback: Function) {
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
          callback();
        }
      });
    }
  }

  CalcularMedia() {
    let suma = this.players.reduce((a, b) => a + (b.current_stage || 0), 0);
    let media = Math.floor(suma / this.players.length)

    this.estatsenemigos(media);

  }

  estatsenemigos(buff: number) {
    if (buff <= 1) {
      return;
    }

    for (let i = 0; i < this.enemies.length; i++) {
      let enemigo = this.enemies[i];

      enemigo.health_points = Math.floor(enemigo.health_points * (1 + 0.2 * (buff - 1)));
      enemigo.mana_points = Math.floor(enemigo.mana_points * (1 + 0.15 * (buff - 1)));
      enemigo.strength = Math.floor(enemigo.strength * (1 + 0.25 * (buff - 1)));
      enemigo.magical_damage = Math.floor(enemigo.magical_damage * (1 + 0.25 * (buff - 1)));
      enemigo.defense = Math.floor(enemigo.defense * (1 + 0.2 * (buff - 1)));
      enemigo.experience_reward = Math.floor(enemigo.experience_reward * (1 + 0.3 * (buff - 1)));
      enemigo.currency_reward = Math.floor(enemigo.currency_reward * (1 + 0.3 * (buff - 1)));

      this.enemies[i] = enemigo;
    }
  }

  clasificarEnemigosPorRango() {
    let enemigosPorRango: { [key: string]: any[] } = {
      common: [],
      uncommon: [],
      epic: [],
      artisanal: [],
      legendary: []
    };

    for (let enemigo of this.enemies) {
      if (enemigo.boss) continue;
      enemigosPorRango[enemigo.rarity_drop]?.push(enemigo);
    }

    return enemigosPorRango;
  }

  guardarEnemigosPorNivel() {
    let niveles = this.players.map(p => p.level || 1);
    let promedioNivel = niveles.reduce((a, b) => a + b, 0) / niveles.length;
    let enemigosPorRango = this.clasificarEnemigosPorRango();

    let enemigosElegidos = [];

    let elegirAleatorio = (lista: any[]) => lista[Math.floor(Math.random() * lista.length)];

    let probabilidades: { [key: string]: number } = {
      common: 0.6,
      uncommon: 0.3,
      epic: 0.1,
      artisanal: 0.0
    };

    if (promedioNivel >= 10) {
      probabilidades = { common: 0.3, uncommon: 0.4, epic: 0.25, artisanal: 0.05 };
    } else if (promedioNivel >= 20) {
      probabilidades = { common: 0.2, uncommon: 0.3, epic: 0.35, artisanal: 0.15 };
    } else if (promedioNivel >= 30) {
      probabilidades = { common: 0.1, uncommon: 0.25, epic: 0.4, artisanal: 0.25 };
    }

    for (let i = 0; i < 3; i++) {
      let rand = Math.random();
      let acumulado = 0;
      let seleccionado = null;

      for (let [rango, prob] of Object.entries(probabilidades)) {
        acumulado += prob;
        if (rand <= acumulado && enemigosPorRango[rango].length > 0) {
          seleccionado = elegirAleatorio(enemigosPorRango[rango]);
          break;
        }
      }

      if (!seleccionado) {
        let todos: any[] = [];
        Object.values(enemigosPorRango).forEach((grupo: any[]) => {
          todos = todos.concat(grupo);
        });
      }
      if (seleccionado) {
        enemigosElegidos.push(seleccionado);
      }
    }

    let jefes = this.enemies.filter(e => e.boss);
    let jefe = jefes.length > 0 ? elegirAleatorio(jefes) : null;

    this.enemy = enemigosElegidos;
    this.boss = jefe;
    this.mesclarArray();
    //this.get();
  }

  get() {
    this.socket.emit('enemigos_seleccionados', this.roomCode, this.enemy);
  }



  mesclarArray() {
    this.turnOrder = [];

    for (let ronda = 0; ronda < 3; ronda++) {
      let mezcla = [];

      for (let i = 0; i < this.players.length; i++) {
        mezcla.push(this.players[i]);
      }

      if (this.enemy.length > ronda) {
        mezcla.push(this.enemy[ronda]);
      } else {
        //console.log(`No hay suficientes enemigos seleccionados para la ronda ${ronda + 1}`);
      }

      for (let i = mezcla.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp: any = mezcla[i];
        mezcla[i] = mezcla[j];
        mezcla[j] = temp;
      }

      this.turnOrder.push(mezcla);
    }

    if (this.boss) {
      let rondaJefe = [...this.players.filter(p => p.health_points > 0)];
      rondaJefe.push(this.boss);
      this.turnOrder.push(rondaJefe);
    }
    //console.log('📋 Órdenes por ronda:', this.turnOrder);
    this.currentTurnIndex = 0;
    this.currentRound = 1;
    let primerTurno = this.currentPlayer;
    if (primerTurno && this.enemy.includes(primerTurno)) {
      setTimeout(() => {
        this.enemyAttack();
      }, 1000);
    }
  };

  get currentPlayer() {
    if (this.turnOrder.length === 0 || this.turnOrder[this.currentRound - 1] === undefined) return null;
    return this.turnOrder[this.currentRound - 1][this.currentTurnIndex] || null;
  }

  isPlayerTurn(jugador: any): boolean {
    let current = this.currentPlayer;
    if (!current) return false;
    return jugador.id === current.id;
  }


  ataqueMagico() {
    let atacante = this.currentPlayer;
    let defender = this.currentRound === 4 ? this.boss : this.enemy[this.currentRound - 1];
    if (!atacante || !defender) return;

    if (atacante.mana_points < 5) {
      this.battleLog.push(`${atacante.name} no tiene suficiente mana para atacar.`);
      return;
    }

    atacante.mana_points -= 5;

    let daño = this.calculardaño(atacante, defender, 'magic');
    defender.health_points = Math.max(defender.health_points - daño, 0);

    this.battleLog.push(`${atacante.name} realizó un ataque mágico a ${defender.name} causando ${daño} puntos de daño.`);

    this.comprobarenemigoDerrrotado(defender);
    this.proximoturno();
  }

  defender() {
    let player = this.currentPlayer;
    if (!player) return;

    player.isDefending = true;

    this.battleLog.push(`${player.name} se defendió y reducirá el daño del próximo ataque.`);
    this.proximoturno();
  }

  pocion() {
    let player = this.currentPlayer;
    if (!player) return;

    let healAmount = 20;
    player.health_points = Math.min(player.health_points + healAmount, player.max_health || player.health_points);

    this.battleLog.push(`${player.name} usó un objeto y recuperó ${healAmount} puntos de vida, pero perdió su turno.`);
    this.proximoturno();
  }


  enemyAttack() {
    let enemy = this.currentPlayer;
    if (!enemy) return;

    let livingPlayers = this.players.filter(p => (p.health_points || 0) > 0);
    if (livingPlayers.length === 0) {
      this.battleLog.push('Todos los jugadores han sido derrotados. Fin del juego.');
      return;
    }

    let targetIndex = Math.floor(Math.random() * livingPlayers.length);
    let target = livingPlayers[targetIndex];

    let attackType: 'physical' | 'magic' = 'physical';
    if ((enemy.magical_damage || 0) > (enemy.strength || 0)) {
      attackType = 'magic';
    }

    let daño = this.calculardaño(enemy, target, attackType);
    target.health_points = Math.max(target.health_points - daño, 0);

    if (attackType === 'magic') {
      this.battleLog.push(`${enemy.name} realizó un ataque mágico a ${target.name} causando ${daño} puntos de daño.`);
    } else {
      this.battleLog.push(`${enemy.name} realizó un ataque físico a ${target.name} causando ${daño} puntos de daño.`);
    }

    if (target.health_points === 0) {
      this.battleLog.push(`${target.name} ha sido derrotado.`);
    }

    this.proximoturno();
  }

  proximoturno() {
    let roundTurns = this.turnOrder[this.currentRound - 1];
    let found = false;
    let attempts = 0;

    let isBossRound = this.currentRound === 4 && this.boss;

    let enemigoActual = isBossRound ? this.boss : this.enemy[this.currentRound - 1];
    let enemyAlive = enemigoActual && enemigoActual.health_points > 0;
    let playerVivos = this.players.some(p => p.health_points > 0);

    if (!enemyAlive) {
      this.currentRound++;
      this.currentTurnIndex = 0;
      if (this.currentRound === 4 && this.boss) {
        this.battleLog.push('¡Enfréntate al jefe!');
        return;
      }
      if (this.currentRound > 4) {
        this.battleLog.push('¡Mazmorra completada!');
        return;
      } else {
        this.battleLog.push(`Ronda ${this.currentRound} comienza.`);
      }
      return;
    }

    if (!playerVivos) {
      this.battleLog.push('Todos los jugadores han sido derrotados. Fin del juego.');
      return;
    }

    do {
      this.currentTurnIndex++;
      if (this.currentTurnIndex >= (roundTurns ? roundTurns.length : 0)) {
        this.currentTurnIndex = 0;
      }
      let next = this.currentPlayer;
      if (next && (next.health_points > 0)) {
        found = true;
      }
      attempts++;
    } while (!found && attempts < 10);

    let proximoturno = this.currentPlayer;
    if (isBossRound && proximoturno && proximoturno === this.boss) {
      setTimeout(() => {
        this.enemyAttack();
      }, 1000);
    }
    else if (!isBossRound && proximoturno && this.enemy.includes(proximoturno)) {
      setTimeout(() => {
        this.enemyAttack();
      }, 1000);
    }
  }


  calculardaño(atacante: any, defender: any, attackType: 'physical' | 'magic'): number {
    let baseDamage = 0;
    if (attackType === 'physical') {
      baseDamage = atacante.strength;
    } else {
      baseDamage = atacante.magical_damage;
    }

    let critRoll = Math.random();
    let isCritical = critRoll < (atacante.critical_chance || 0);
    let daño = baseDamage;

    if (isCritical) {
      daño = Math.floor(daño * (1 + (atacante.critical_damage || 0)));
      this.battleLog.push(`¡Golpe crítico de ${atacante.name}!`);
    }

    let defense = defender.defense || 0;
    daño = daño - defense;

    if (daño > 0) {
      daño = Math.max(daño, 1);
    } else {
      daño = 0;
    }

    if (defender.isDefending) {
      daño = Math.floor(daño / 2);
      this.battleLog.push(`${defender.name} redujo el daño a la mitad por defenderse.`);
      defender.isDefending = false;
    }

    return daño;
  }


  ataqueFisico() {
    let atacante = this.currentPlayer;
    let defender = this.currentRound === 4 ? this.boss : this.enemy[this.currentRound - 1];
    if (!atacante || !defender || defender.health_points <= 0) return;

    let daño = this.calculardaño(atacante, defender, 'physical');
    defender.health_points = Math.max(defender.health_points - daño, 0);

    this.battleLog.push(`${atacante.name} realizó un ataque físico a ${defender.name} causando ${daño} puntos de daño.`);

    this.comprobarenemigoDerrrotado(defender);
    this.proximoturno();
  }

  comprobarenemigoDerrrotado(enemigo: any) {
    if (enemigo.health_points <= 0) {
      this.battleLog.push(`${enemigo.name} ha sido derrotado.`);
    }
  }

}
