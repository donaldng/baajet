import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    items;
    selectedItem;
    display_currency;
    tot_budget;

    constructor(public navCtrl: NavController, public storage: Storage) {
        this.items = ['$', '¥', '€', '£', '฿'];
        this.display_currency = '$';
        this.tot_budget = 2000;
        
        this.storage.get('currency').then((currency) => {
            if (currency){
                this.display_currency = currency;
            }
        });

    }

    selectedCurrency(v){
        this.display_currency = v;
        this.storage.set('currency', v);
    }

    budget = '300.50';
    greetMsg = 'Good day, spend your wealth with good health!';

}
