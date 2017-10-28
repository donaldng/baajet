import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ModalController } from 'ionic-angular';
import { SettingPage } from '../setting/setting';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    items;
    selectedItem;
    display_currency;
    tot_budget;
    day_budget;

    constructor(public navCtrl: NavController, public storage: Storage, public modalCtrl: ModalController) {
        this.display_currency = '$';

        this.updateData();

        setInterval(this.updateData.bind(this), 1000);
    }

    selectedCurrency(v){
        this.display_currency = v;
        this.storage.set('currency', v);
    }

    updateData(){
        this.storage.get('budget').then((v) => {
            if (this.tot_budget != v){
                this.tot_budget = v;
            }
        });
        this.storage.get('currency').then((v) => {
            if (this.display_currency != v){
                this.display_currency = v;
            }
        });
        this.calculateBudget();
    }

    openSettingModal(){
        let modal = this.modalCtrl.create(SettingPage, {'budget': this.tot_budget, 'currency': this.display_currency});
        modal.onDidDismiss(data => {
            this.updateData();
        });

        modal.present();
    }

    calculateBudget(){
        this.storage.get('expensesList').then((v) => {
            console.log(v);
            this.day_budget = '300.50';
        });
    }

    
    greetMsg = 'Good day, spend your wealth with good health!';

}
