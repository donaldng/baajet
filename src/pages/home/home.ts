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
    tripEnd;
    tripStart;
    n_day;
    duration;

    constructor(public navCtrl: NavController, public storage: Storage, public modalCtrl: ModalController) {
        this.display_currency = '$';
        this.updateData();
        setInterval(this.checkReload.bind(this), 100);
    }

    checkReload(){
        this.storage.get('reload_home').then((v) => {
            if(v){
                console.log('Reload home');
                this.updateData();
                this.storage.set('reload_home', 0);
            }
        });        
    }

    updateData(){
        console.log('update data home');
        // update once modal close
        this.storage.get('budget').then((v) => {
            if (this.tot_budget != v){
                this.tot_budget = v;
            }
        });

        this.storage.get('day_budget').then((v) => {
            if (this.day_budget != v){
                this.day_budget = v;
            }
        });        

        this.storage.get('currency').then((v) => {
            if (this.display_currency != v){
                this.display_currency = v;
            }
        });

        this.storage.get('n_day').then((v) => {
            if (this.n_day != v){
                this.n_day = v;
            }
        });

        this.storage.get('duration').then((v) => {
            if (v){
                this.duration = v.split(" ~ ");
                this.tripStart = this.duration[0];
                this.tripEnd = this.duration[1];
            }
            else{
                this.tripStart = new Date().toISOString().slice(0, 19);
                this.tripEnd = new Date();
                this.tripEnd.setDate(this.tripEnd.getDate() + 7);
                this.tripEnd = this.tripEnd.toISOString().slice(0, 19);
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

    dateDiff(tripStart, tripEnd){
        tripEnd = new Date(tripEnd);
        var diff = Math.abs(tripEnd - tripStart);
        return (Math.floor(diff / 36e5)/24).toFixed(4);
    }

    calculateBudget(){
        // starting budget
        this.budgetTmp = this.tot_budget;

        // minus expenses
        this.storage.get('expensesList').then((v) => {
            
            for (var i=0; i < v.length; i++){
                this.budgetTmp -= v[i].amount;
            }

            if (!isNaN(this.budgetTmp)){
                // divide by total days left
                this.n_day = parseFloat(this.dateDiff(new Date(), this.tripEnd));
                this.day_budget = (this.budgetTmp / this.n_day).toFixed(2);

                this.storage.set('day_budget', this.day_budget);
                this.n_day = this.n_day.toFixed(0);
                this.storage.set('n_day', this.n_day);
            }
        });
    }

    
    greetMsg = 'Good day, spend your wealth with good health!';

}
