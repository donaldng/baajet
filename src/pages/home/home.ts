import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AboutPage } from '../about/about';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {

  }

  tab2Root = AboutPage;
  items = ['Malaysia', 'Canada', 'Singapore', 'United States'];

  selectedCountry(){
    console.log('');
  }
  
  currency = '$';
  budget = '300.50';
  greetMsg = 'Good day, spend your wealth with good health!';

}
