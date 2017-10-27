import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  constructor(public navCtrl: NavController) {

  }


  expensesList = [
      {name: 'Animals', body: Math.floor((Math.random() * 10) + 1) },
      {name: 'Body Parts', body: Math.floor((Math.random() * 10) + 1) },
      {name: 'Colors & Shapes', body: Math.floor((Math.random() * 10) + 1) },
      {name: 'Apparels', body: Math.floor((Math.random() * 10) + 1) },
      {name: 'Family', body: Math.floor((Math.random() * 10) + 1) },
      {name: 'Vegitables & Fruits', body: Math.floor((Math.random() * 10) + 1) }

  ];

}