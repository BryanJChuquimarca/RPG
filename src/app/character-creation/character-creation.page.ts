import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonInput, IonButton, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { AuthService } from '@auth0/auth0-angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
@Component({
  selector: 'app-character-creation',
  templateUrl: './character-creation.page.html',
  styleUrls: ['./character-creation.page.scss'],
  standalone: true,
  imports: [IonContent, IonInput, IonButton, IonItem, IonLabel, IonList, CommonModule, FormsModule]
})
export class CharacterCreationPage implements OnInit {

  characters = [
    {
      name: 'Guerrero',
      image: 'warrior-realistic.png',
      pixelArt: 'Guerrero.png',
      hp: 120,
      mana: 40,
      strength: 28,
      magic: 5,
      defense: 14,
      critChance: 7,   // 7%
      critDamage: 1.3,
      level: 1,
      currency: 0
    },
    {
      name: 'Mago',
      image: 'mage-realistic.png',
      pixelArt: 'Mago.png',
      hp: 70,
      mana: 100,
      strength: 5,
      magic: 32,
      defense: 8,
      critChance: 8,   // 8%
      critDamage: 1.5,
      level: 1,
      currency: 0
    },
    {
      name: 'Asesino',
      image: 'assassin-realistic.png',
      pixelArt: 'Asesino.png',
      hp: 85,
      mana: 30,
      strength: 22,
      magic: 10,
      defense: 10,
      critChance: 15,  // 15%
      critDamage: 1.8,
      level: 1,
      currency: 0
    },
    {
      name: 'Clérigo',
      image: 'cleric-realistic.png',
      pixelArt: 'Clérigo.png',
      hp: 100,
      mana: 80,
      strength: 12,
      magic: 22,
      defense: 12,
      critChance: 6,   // 6%
      critDamage: 1.2,
      level: 1,
      currency: 0
    }
  ];

  selectedCharacter: any = null;
  alias: string = '';
  promoCode: string = '';
  public player: any;
  public host_url: string = 'https://backend-rpg.onrender.com'

  constructor(public auth: AuthService, private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.auth.user$.subscribe((data: any) => {
      this.player = data;
    });
  }

  selectCharacter(character: any) {
    this.selectedCharacter = character;
    console.log(this.selectedCharacter
    )
  }

  saveCharacter() {
    if (!this.selectedCharacter || !this.alias.trim()) {
      alert('Selecciona un personaje y asigna un alias.');
      return;
    }

    let newPlayer = {
      id: this.player.email,
      name: this.alias,
      health_points: this.selectedCharacter.hp,
      mana_points: this.selectedCharacter.mana,
      strength: this.selectedCharacter.strength,
      magical_damage: this.selectedCharacter.magic,
      defense: this.selectedCharacter.defense,
      critical_chance: this.selectedCharacter.critChance,
      critical_damage: this.selectedCharacter.critDamage,
      experience: 0,
      level: this.selectedCharacter.level,
      currency: this.selectedCharacter.currency,
      class: this.selectedCharacter.name
    };

    if (this.promoCode.trim() === 'BONUS2025') {
      newPlayer.currency += 300;
    }

    console.log('Guardando personaje en BD:', newPlayer);
    this.http.post(`${this.host_url}/player`, newPlayer).subscribe((response) => {
      console.log('Personaje guardado:', response);
    });

    this.router.navigate(['/home'])

  }

  comprobarCodigo() {
    if (this.promoCode.trim() === 'BONUS2025') {
      alert('Código de promoción válido.');
    } else {
      alert('Código de promoción inválido.');
    }
  }


}