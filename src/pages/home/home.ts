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

}
