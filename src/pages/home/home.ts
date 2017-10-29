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
    day_color;
    tot_expenses;
    display_tot_expenses;
    campaign_ended;
    greetMsg;

    constructor(public navCtrl: NavController, public storage: Storage, public modalCtrl: ModalController) {
        //this.storage.clear();

        this.display_currency = '$';
        this.display_tot_expenses = 0;
        this.day_budget = 0;
        this.tot_budget = 0;

        this.day_color = 'secondary';
        this.updateData();
        setInterval(this.checkReload.bind(this), 100);
        this.campaign_ended = 0;
        this.getGreetMsg()
        
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
            if (v && this.tot_budget != v){
                this.tot_budget = v;
            }
        });

        this.storage.get('day_budget').then((v) => {
            if (v && this.day_budget != v){
                this.day_budget = v;

                if (this.day_budget > 0){
                    this.day_color = 'secondary';
                }
                else{
                    this.day_color = 'danger';
                }                
            }
        });        

        this.storage.get('currency').then((v) => {
            if (v && this.display_currency != v){
                this.display_currency = v;
            }
        });

        this.storage.get('n_day').then((v) => {
            if (v && this.n_day != v && !this.campaign_ended){
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

            if(new Date() > new Date(this.tripEnd)){
                this.campaign_ended = 1;
                this.trip_ended();
            }
            else{
                this.campaign_ended = 0;
                this.getGreetMsg()            
            }
        });

        this.calculateBudget();
    }

    trip_ended(){
        if (this.day_budget > 0)
            this.greetMsg = 'Trip has ended, and money was well spent!';
        else
            this.greetMsg = 'Hope this trip don\'t break your bank account. :(';

        this.n_day = 0;
    }

    openSettingModal(){
        let modal = this.modalCtrl.create(SettingPage, {'budget': this.tot_budget, 'currency': this.display_currency});
        modal.onDidDismiss(data => {
            this.updateData();
        });

        modal.present();
    }
    
    dayDiff(tripStart, tripEnd){
        var timeDiff = Math.abs(tripEnd - tripStart);
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        return diffDays;
    }

    getGreetMsg(){
        if(this.tot_budget)
            this.greetMsg = 'Good day, spend your wealth with good health!';
        else
            this.greetMsg = 'Opps, we need your input on your trip\'s budget, sir! Go set it up in Setting!';
    }
    
    calculateBudget(){

        // minus expenses
        this.storage.get('expensesList').then((v) => {
            var startDate = new Date();

            if (new Date(this.tripStart) > startDate){
                startDate = new Date(this.tripStart);
            }

            var n_day = 1;

            if (!this.campaign_ended) n_day = Number(this.dayDiff(startDate, new Date(this.tripEnd)));

            console.log(n_day);

            this.budgetTmp = this.tot_budget;
            this.tot_expenses = 0;

            if(v){
                
                for (var i=0; i < v.length; i++){
                    
                    this.tot_expenses -= Number(v[i].amount) * Number(this.calcFrequency(v[i].freq, v[i].freq_start, v[i].freq_end));
                }

                this.display_tot_expenses = Math.abs(this.tot_expenses);
                this.budgetTmp -= this.display_tot_expenses;

                this.day_budget = (this.budgetTmp / n_day).toFixed(2);

                this.storage.set('day_budget', this.day_budget);

                this.n_day = n_day.toFixed(0);
                if (this.campaign_ended) this.n_day = 0;
                this.storage.set('n_day', this.n_day);
            }
            else if(this.tot_budget) {
                this.n_day = n_day.toFixed(0);
                this.storage.set('n_day', this.n_day);
                this.day_budget = (this.budgetTmp / n_day).toFixed(2);                
            }
            else{
                this.n_day = 0;
            }

        });
    }

    calcFrequency(freq_type, start, end){
        if (freq_type == 0 || freq_type == 1) return 1;

        if (freq_type == 2) return this.dayDiff(new Date(start), new Date(end));

        if (freq_type == 3) return this.dayDiff(new Date(start), new Date(end)) / 7;

        if (freq_type == 4) return this.dayDiff(new Date(start), new Date(end)) / 30;
    }
}
