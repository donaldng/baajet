import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ModalController, Platform } from 'ionic-angular';
import { SettingPage } from '../setting/setting';
import { Events } from 'ionic-angular';
import { AdMobFree, AdMobFreeBannerConfig } from '@ionic-native/admob-free';
import { ImageService } from '../../service/image';

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
    tot_color = 'primary';
    tot_bar;
    day_bar;
    reserved_amount;
    reserveList;
    seemore_reserved;
    baaThumbnail;
    seemore_ok;
    
    constructor(public imgLib: ImageService, private alertCtrl: AlertController, public admob: AdMobFree, public navCtrl: NavController, public storage: Storage, public modalCtrl: ModalController, public events: Events,  public platform: Platform) {
        //this.storage.clear();

        this.expensesList = [];
        this.timezone = new Date().getTimezoneOffset() / 60;
        this.display_currency = '$';
        this.tot_expenses = 0;
        this.day_budget = 0;
        this.tot_budget = 0;
        this.tot_remaining = 0;
        this.day_remaining = 0;
        this.day_expenses = 0;
        this.seemore_reserved = 0;
        this.seemore_ok = 0;

        this.updateData();

        if(!this.baaThumbnail) this.baaThumbnail = "assets/imgs/thumbnail-" + this.getRandomInt(1,8) + ".png";

        events.subscribe('reload:home', (k, v) => {
            if (k == "expensesList"){
                this.calc(v);
                this.expensesList = v;
                this.baaThumbnail = "assets/imgs/thumbnail-" + this.getRandomInt(1,8) + ".png";
            }
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
        
        platform.ready().then(() => {
        
            let adId;
            if(platform.is('android')) {
                adId = 'ca-app-pub-8912779457218327~4932552355';
            } else if (platform.is('ios')) {
                adId = 'ca-app-pub-8912779457218327~7658077602';
            }

            let bannerConfig: AdMobFreeBannerConfig = {
                isTesting: true,
                autoShow: true,
                id: adId
            };

            admob.banner.config(bannerConfig);

            admob.banner.prepare().then(() => {
            }).catch(e => console.log(e));        
        });


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
            this.greetMsg = 'Look like you haven\'t setup your trip schedule yet, that\'s not good!';

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

        this.tot_bar = document.getElementById('tot_bar');
        this.day_bar = document.getElementById('day_bar');

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

        if(this.day_remaining / this.day_budget <= 0.15){
            this.day_color = "danger";
            if(this.day_bar) this.day_bar.style.backgroundColor='#f53d3d';
        } 
        else{
            this.day_color = "secondary";
            if(this.day_bar) this.day_bar.style.backgroundColor='#02d1a4';
        }

        if(this.tot_remaining / this.tot_budget <= 0.15){
            this.tot_color = "danger";
            if(this.tot_bar) this.tot_bar.style.backgroundColor='#f53d3d';

        } 
        else{
            this.tot_color = "secondary";
            if(this.tot_bar) this.tot_bar.style.backgroundColor='#02d1a4';
        }

        let tot_perc = 0;
        if (this.tot_remaining > 0) tot_perc = this.tot_remaining/this.tot_budget*100;

        let day_perc = 0;
        if (this.day_remaining > 0) day_perc = this.day_remaining/this.day_budget*100;

        if(this.tot_bar) this.tot_bar.style.width = (tot_perc) + '%';
        if(this.day_bar) this.day_bar.style.width = (day_perc) + '%';

        this.getGreetMsg();
        this.getReservedAmount(v);

    }

    decodeDuration(v){
        this.duration = v.split(" ~ ");
        this.tripStart = this.duration[0];
        this.tripEnd = this.duration[1];   
    }

    quickAdd(claim){
        let title = 'Add expenses';
        let placeholder = '';
        let value = '';

        if (claim){
            title = "Use fund";
            placeholder = claim.amount;
            value = claim.amount;
        }

        let prompt = this.alertCtrl.create({
            title: title,
            message: "How much are you spending?",
            inputs: [
            {
                name: 'price',
                placeholder: placeholder,
                type: 'number',
                value: value
            },
            ],
            buttons: [
            {
                text: 'Cancel',
                handler: data => {
                }
            },
            {
                text: 'Go',
                handler: data => {
                    if(!claim){
                        this.gotoManage(data.price);
                    }
                    else{
                        // If claim direct add one
                        this.claimExpenses(claim, data.price);
                    }                    
                }
            }
            ]
        });
        prompt.present().then(() => {
            const firstInput: any = document.querySelector('ion-alert input');
            firstInput.focus();
            return;
        });
    }

    getReservedAmount(expensesList){
        if(!expensesList){
            this.storage.get('expensesList').then((v) => {
                this.processReserved(v);
                this.expensesList = v;
            });
        }
        else{
            this.expensesList = expensesList;
            this.processReserved(expensesList);
        }
    }

    processReserved(expensesList){
        this.reserved_amount = 0;
        this.reserveList = [];

        if(!expensesList) return;

        for (var i = 0, len = expensesList.length; i < len; i++) {
            // if is reserved
            if (expensesList[i].freq == 1){
                this.reserved_amount += Number(expensesList[i].amount);
                this.reserveList.push(expensesList[i]);
            }
        }

        let resv_length = this.reserveList.length;
        this.reserveList = this.reserveList.sort(function(a, b) {  return b.id - a.id; });

        if(!this.seemore_ok){
            this.reserveList = this.reserveList.slice(0, 6);
            if (resv_length > 6){
                this.seemore_reserved = 1;
            }            
        }
        else{
            this.seemore_reserved = 0;
        }
    }

    gotoManage(init_price){
        this.events.publish('gotoManage', {'selected_id': -1, 'camOn': this.newphotoFlag, 'init_price': init_price});
        //this.navCtrl.parent.select(1);
    }

    gotoImage(){
        this.events.publish('gotoManage', {'selected_id': -1, 'camOn': 1});
        //this.navCtrl.parent.select(1);
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

    claimExpenses(expenses, price){
        let index = this.findIndex(expenses.id);

        // Validate
        if (price > expenses.amount){
            alert('You cannot claim more than your reserved fund, my good sir!');
            return;
        }
        else if (price < 0){
            alert('I cannot process negative number, baaaaa...');
            return;
        }

        // Remove amount from claim
        expenses.amount = expenses.amount - price;
        this.expensesList[index] = expenses;

        let tmpImage = 0;
        if (typeof expenses.tmpImage != 'undefined') tmpImage = expenses.tmpImage;

        let thumbnail = 0;
        if (typeof expenses.thumbnail != 'undefined') thumbnail = expenses.thumbnail;


        // Claim's should not be included into today's expenses, neither for future's, so leave it to the past.
        var x = new Date();
        x.setDate(x.getDate() - 1);
        var yesterday = x.toISOString().slice(0, 19).replace('T',' ');

        // Add new expenses
        var newExpenses = {
            'id': Math.round((new Date()).getTime() / 1000),
            'name': expenses.name,
            'amount': Number(price),
            'freq': 0,
            'freq_start': yesterday,
            'freq_end': yesterday,
            'datetime': yesterday,
            'image': tmpImage,
            'thumbnail': thumbnail,
            'todays': true
        };
        this.expensesList.push(newExpenses);

        // Delete claim if depleted
        if (expenses.amount <= 0){
            let index = this.expensesList.indexOf(expenses);
            this.expensesList.splice(index,1);
        }

        this.events.publish('reload:home', 'expensesList', this.expensesList);
        this.events.publish('change_segment', newExpenses.freq);
        this.storage.set('expensesList', this.expensesList);
        this.events.publish('reload:expenses', this.expensesList);
    }

    findIndex(find_id){
        if(!this.expensesList) return;
        for (var i = 0, len = this.expensesList.length; i < len; i++) {
            if (this.expensesList[i].id == find_id){
                return i;
            }
        }
        return -1;
    }  

    getRandomInt(min, max) {
        var n = Math.floor(Math.random() * (max - min + 1)) + min;

        if (n == 5) {
            // rare thumbnail
            n = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        else if (n == 8){
            // Extra rare
            n = Math.floor(Math.random() * (max - min + 1)) + min;
            if(n == 8){
                n = Math.floor(Math.random() * (max - min + 1)) + min;
            }
        }

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getDefaultThumbnail(x, y){
        return this.imgLib.getDefaultThumbnail(x , y);
    }

    seemore(){
        this.seemore_ok = 1;
        this.processReserved(this.expensesList);        
    }
}
