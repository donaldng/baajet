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
    budgetTmp;
    n_day;

    constructor(public navCtrl: NavController, public storage: Storage, public modalCtrl: ModalController) {
        this.display_currency = '$';
        this.day_budget = this.tot_budget;        
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

        this.storage.get('n_day').then((v) => {
            if (this.n_day != v){
                this.n_day = v;
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
        let modal = this.modalCtrl.create(SettingPage, {'budget': this.tot_budget, 'currency': this.display_currency, 'n_day': this.n_day});
        modal.onDidDismiss(data => {
            this.updateData();
        });

        modal.present();
    }

    calculateBudget(){
        this.budgetTmp = this.tot_budget;

        this.storage.get('expensesList').then((v) => {
            
            for (var i=0; i < v.length; i++){
                this.budgetTmp -= v[i].amount;
            }
            this.day_budget = (this.budgetTmp / this.n_day).toFixed(2);
        });
    }

    
    greetMsg = 'Good day, spend your wealth with good health!';

}
