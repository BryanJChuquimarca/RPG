import { Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    canActivate: [AuthGuard]

  },
  {
    path: 'character-creation',
    loadComponent: () => import('./character-creation/character-creation.page').then( m => m.CharacterCreationPage)
  },
  {
    path: 'salas',
    loadComponent: () => import('./salas/salas.page').then( m => m.SalasPage)
  },
  {
    path: 'mazmorra',
    loadComponent: () => import('./mazmorra/mazmorra.page').then( m => m.MazmorraPage)
  },
  {
    path: 'sala-espera',
    loadComponent: () => import('./sala-espera/sala-espera.page').then( m => m.SalaEsperaPage)
  },
];
