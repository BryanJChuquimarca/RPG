import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonInput, IonButton, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { AuthService } from '@auth0/auth0-angular';
import { HttpClient } from '@angular/common/http';

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
      pixelArt: 'warrior-pixel.png',
      hp: 120,
      mana: 40,
      strength: 35,
      magic: 5,
      defense: 25,
      critChance: 10,
      critDamage: 1.3,
      level: 1,
      currency: 0
    },
    {
      name: 'Mago',
      image: 'mage-realistic.png',
      pixelArt: 'mage-pixel.png',
      hp: 70,
      mana: 100,
      strength: 5,
      magic: 40,
      defense: 10,
      critChance: 12,
      critDamage: 1.5,
      level: 1,
      currency: 0
    },
    {
      name: 'Asesino',
      image: 'assassin-realistic.png',
      pixelArt: 'assassin-pixel.png',
      hp: 85,
      mana: 30,
      strength: 30,
      magic: 10,
      defense: 15,
      critChance: 25,
      critDamage: 1.8,
      level: 1,
      currency: 0
    },
    {
      name: 'Clérigo',
      image: 'cleric-realistic.png',
      pixelArt: 'cleric-pixel.png',
      hp: 100,
      mana: 80,
      strength: 15,
      magic: 25,
      defense: 20,
      critChance: 8,
      critDamage: 1.2,
      level: 1,
      currency: 0
    }
  ];

  selectedCharacter: any = null;
  alias: string = '';
  promoCode: string = '';
  public player: any;
  public host_url: string = 'http://localhost:3000'

  constructor(public auth: AuthService, private http: HttpClient) { }

  ngOnInit() {
    this.auth.user$.subscribe((data: any) => {
      this.player = data;
    });
  }

  selectCharacter(character: any) {
    this.selectedCharacter = character;
  }

  saveCharacter() {
    if (!this.selectedCharacter || !this.alias.trim()) {
      alert('Selecciona un personaje y asigna un alias.');
      return;
    }

    const newPlayer = {
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
      currency: this.selectedCharacter.currency
    };

    if (this.promoCode.trim() === 'BONUS2025') {
      newPlayer.currency += 300;
    }

    console.log('Guardando personaje en BD:', newPlayer);
    this.http.post(`${this.host_url}/player`, newPlayer).subscribe((response) => {
      console.log('Personaje guardado:', response);
    });

  }

  comprobarCodigo() {
    if (this.promoCode.trim() === 'BONUS2025') {
      alert('Código de promoción válido.');
    } else {
      alert('Código de promoción inválido.');
    }
  }


}