import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import socket from 'socket.io-client';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mazmorra',
  templateUrl: './mazmorra.page.html',
  styleUrls: ['./mazmorra.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MazmorraPage implements OnInit {
  public socket: any;
  public player: any;

  host_url: string = 'http://localhost:3000';

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {

    this.socket = socket(this.host_url);
    console.log(this.route.snapshot.params)
    let params: any = this.route.snapshot.params;
    this.player = JSON.parse(params.player);
    let info = {
      code: params.room,
      username: this.player.email,
      email: this.player.email
    }
    this.socket.emit('join_room', info);

    this.socket.on('user_list_' + info.code, (userList: string[]) => {
      console.log(`User list: ${userList}`);
    })
  }

  

}
