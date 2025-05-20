
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonMenuButton, IonButtons, IonTitle, IonToolbar, IonHeader, IonMenu, IonContent, IonList, IonListHeader, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cartSharp, cartOutline, homeOutline, homeSharp, fastFoodOutline, fastFoodSharp, logInOutline, logInSharp, refreshOutline, refreshSharp } from 'ionicons/icons';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [FormsModule, FormsModule, RouterLink, RouterLinkActive, IonMenuButton, IonButtons, IonTitle, IonToolbar, IonHeader, IonMenu, IonContent, IonList, IonListHeader, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterLink, IonRouterOutlet],
})

export class AppComponent implements OnInit {
  modoOscuroActivado = false;
  public user: any;
  public usuario: any;
  public appPages = [
    { title: 'Home', url: '/home', icon: 'cart' },
    { title: 'Productos', url: '/productos', icon: 'fast-Food' },
    { title: 'Historico', url: '/historico', icon: 'refresh' },
    { title: 'Login', url: '/login', icon: 'Log-in' }

  ];
  constructor() {
    addIcons({ cartSharp, cartOutline, homeOutline, homeSharp, fastFoodOutline, fastFoodSharp, logInOutline, logInSharp, refreshOutline, refreshSharp });
  }

  async ngOnInit() {

  }



}
