import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ModalController } from 'ionic-angular';
import { SettingPage } from '../setting/setting';
import { Events } from 'ionic-angular';

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
    tot_expenses;
    campaign_ended;
    greetMsg;
    expensesList;
    timezone;
    newphotoFlag;
    tot_remaining;
    day_remaining;
    day_expenses;
    day_color = 'primary';

    constructor(public navCtrl: NavController, public storage: Storage, public modalCtrl: ModalController, public events: Events) {
        //this.storage.clear();
        this.timezone = new Date().getTimezoneOffset() / 60;
        this.display_currency = '$';
        this.tot_expenses = 0;
        this.day_budget = 0;
        this.tot_budget = 0;
        this.tot_remaining = 0;
        this.day_remaining = 0;
        this.day_expenses = 0;
        this.updateData();

        events.subscribe('reload:home', (k, v) => {
            if (k == "expensesList")
                this.calc(v);                
            else if(k == "tot_budget"){
                this.tot_budget = v;
                this.calcDbBudget();
            }
            else if(k == "duration"){
                this.decodeDuration(v);    
                this.check_ended();
            }
        });

        events.subscribe('reload:expenses', (v) => {
            this.calc(v);                
        });

        events.subscribe('update:currency', (c) => {
            this.display_currency = c;
        });

        events.subscribe('newphotoFlag', (v) => {
            this.newphotoFlag = v;
        });        

        this.campaign_ended = 0;
        this.getGreetMsg();
        
    }

    updateData(){
        // update once modal close
        this.storage.get('budget').then((v) => {
            if (v && this.tot_budget != v){
                this.tot_budget = v;
            }
        });

        this.storage.get('newphotoFlag').then((v) => {
            if (v && this.newphotoFlag != v){
                this.newphotoFlag = v;
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
                this.decodeDuration(v);        
          }
            else{
                this.tripStart = new Date().toISOString().slice(0, 19);
                this.tripEnd = new Date();
                this.tripEnd.setDate(this.tripEnd.getDate() + 7);
                this.tripEnd = this.tripEnd.toISOString().slice(0, 19);
            }

            this.check_ended();

        });
        
        this.calcDbBudget();

    }

    trip_ended(){
        if (this.day_budget > 0)
            this.greetMsg = 'Trip has ended, and money was well spent!';
        else
            this.greetMsg = 'Hope this trip don\'t break your bank account. :(';

        this.n_day = 0;
    }
    check_ended(){
        if(new Date() > new Date(this.tripEnd)){
            this.campaign_ended = 1;
            this.trip_ended();
        }
        else{
            this.campaign_ended = 0;
            this.getGreetMsg();   
        }           
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
            this.greetMsg = 'Opps, we gonna need your inputs on trip\'s budget! Go set it up in Setting!';

        if(this.day_color == "danger") this.greetMsg = 'Oh no, your budget is running low!';
    }
    
    calcDbBudget(){
        // minus expenses
        this.storage.get('expensesList').then((v) => {
            this.calc(v);
        });
    }

    get_nday(){
        var startDate = new Date();
        if (new Date(this.tripStart) > startDate){
            startDate = new Date(this.tripStart);
        }

        var n_day = 1;
        if (!this.campaign_ended) n_day = Number(this.dayDiff(startDate, new Date(this.tripEnd)));
        return n_day;
    }

    calc(v){
        var n_day = this.get_nday();
        this.budgetTmp = this.tot_budget;
        this.tot_expenses = 0;
        this.day_expenses = 0;
        if(v){
            
            for (var i=0; i < v.length; i++){
                if(v[i].freq == 0 && v[i].freq_start.slice(0, 10).replace('T',' ') == new Date().toISOString().slice(0, 10).replace('T',' ') && v[i].freq_end.slice(0, 10).replace('T',' ') == new Date().toISOString().slice(0, 10).replace('T',' ')){
                    // Do not account day expenses into daily budget calculation
                    // Unless it's a over spent, then we deduct overspent amount from daily budget
                    this.day_expenses += Number(v[i].amount);
                    continue;
                }
                this.tot_expenses -= Number(v[i].amount) * Number(this.calcFrequency(v[i].freq, v[i].freq_start, v[i].freq_end));
            }
            this.tot_expenses = Math.abs(this.tot_expenses);
            this.budgetTmp -= this.tot_expenses;

            this.day_budget = (this.budgetTmp / n_day).toFixed(2);

            // If we over spent the day budget, then lessen day budget.
            if(this.day_budget < this.day_expenses){
                var overspent = this.day_expenses - this.day_budget;
                this.day_budget -= Number(overspent/n_day);
                this.day_budget = this.day_budget.toFixed(2);
            }

            this.n_day = n_day;
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

        // Exclude day_expenses from day_budget calculation
        // But include it back to tot_expenses after
        // Since we don't want to affect day_budget every time we spent money

        this.tot_expenses += this.day_expenses;

        this.events.publish('total_expenses', this.tot_expenses);
        this.storage.set('day_budget', this.day_budget);
        
        this.tot_remaining = this.tot_budget - this.tot_expenses;
        this.day_remaining = this.day_budget - this.day_expenses;
        this.day_remaining = this.day_remaining.toFixed(2);

        if(this.day_remaining / this.day_budget <= 0.15) this.day_color = "danger";
        else this.day_color = "primary";

        this.getGreetMsg();

    }

    decodeDuration(v){
        this.duration = v.split(" ~ ");
        this.tripStart = this.duration[0];
        this.tripEnd = this.duration[1];   
    }

    gotoManage(){
        this.events.publish('gotoManage', {'selected_id': -1, 'camOn': this.newphotoFlag});
        this.navCtrl.parent.select(1);
    }

    gotoImage(){
        this.events.publish('gotoManage', {'selected_id': -1, 'camOn': 1});
        this.navCtrl.parent.select(1);
    }

    gotoSetting(){
        let modal = this.modalCtrl.create(SettingPage);
        modal.present();
    }

    calcFrequency(freq_type, start, end){
        if (freq_type == 0 || freq_type == 1) return 1;
        if (freq_type == 2) return this.dayDiff(new Date(start), new Date(end));
        if (freq_type == 3) return this.dayDiff(new Date(start), new Date(end)) / 7;
        if (freq_type == 4) return this.dayDiff(new Date(start), new Date(end)) / 30;
    }
}
