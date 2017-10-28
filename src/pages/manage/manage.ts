import { Component } from '@angular/core';
import { ModalController, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-manage',
  templateUrl: 'manage.html'
})

export class ManagePage {
  expenses;
  public pageName;
  id;
  color;

  constructor(
    public params: NavParams,
    public viewCtrl: ViewController
  ) {
    var expenses = [
      {
        name: 'Gollum',
        amount: 'Sneaky little hobbitses!',
        freq: 'assets/img/avatar-gollum.jpg',
        items: [
          { title: 'Race', note: 'Hobbit' },
          { title: 'Culture', note: 'River Folk' },
          { title: 'Alter Ego', note: 'Smeagol' }
        ]
      },
      {
        name: 'Frodo',
        amount: 'Go back, Sam! I\'m going to Mordor alone!',
        freq: 'assets/img/avatar-frodo.jpg',
        items: [
          { title: 'Race', note: 'Hobbit' },
          { title: 'Culture', note: 'Shire Folk' },
          { title: 'Weapon', note: 'Sting' }
        ]
      },
      {
        name: 'Samwise Gamgee',
        amount: 'What we need is a few good taters.',
        freq: 'assets/img/avatar-samwise.jpg',
        items: [
          { title: 'Race', note: 'Hobbit' },
          { title: 'Culture', note: 'Shire Folk' },
          { title: 'Nickname', note: 'Sam' }
        ]
      }
    ];
    this.id = this.params.get('id');

    if(this.id != 0){
      this.expenses = expenses[this.id];
      this.pageName = "Edit expenses";
      this.color = "secondary";
    }
    else{
      this.expenses = {
                        name: '',
                        amount: '',
                        freq: '',
                        items: []
                      };
      this.pageName = "Add expenses";
      this.color = "primary";
    }

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
