import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { ActionSheetController } from 'ionic-angular'
import { ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';

@Component({
    selector: 'page-expenses',
    templateUrl: 'expenses.html'
})

export class ExpensesPage {
    expensesList = [];
    display_currency = '$';
    oriList;
    freqMap = ['One time','Reserved fund','Daily','Weekly','Monthly'];
    runningId;
    lastExpenses = 0;
    currentHeader;
    expenses_type = 'onetime';
    onetime = 0;
    recurring = 0;
    reserved = 0;
    showSegment = 0;
    tot_expenses = 0;
    tot_budget = 0;
    newphotoFlag;
    init_price;

    constructor(private alertCtrl: AlertController, public navCtrl: NavController, public actionSheetCtrl: ActionSheetController, public modalCtrl: ModalController, public storage: Storage, public events: Events) {
        this.init_price = 0;
        this.storage.get('budget').then((v) => {
            if (v && this.tot_budget != v){
                this.tot_budget = v;
            }
        });

        this.loadData();

        this.storage.get('currency').then((v) => {
            if(v) this.display_currency = v;
        });

        events.subscribe('update:currency', (c) => {
            this.display_currency = c;
        });

        events.subscribe('change_segment', (v) => {
            this.expenses_type = this.getSwitchType(v);
        });

        events.subscribe('total_expenses', (v) => {
            this.tot_expenses = v.toFixed(2);
        });

        events.subscribe('refreshSegment', (expenses) => {
            this.refreshSegment(expenses);
        });        

        events.subscribe('newphotoFlag', (v) => {
            this.newphotoFlag = v;
        });       

        events.subscribe('reload:home', (k, v) => {
            if(k == "tot_budget"){
                this.tot_budget = v;
            }
        });

        events.subscribe('reload:expenses', (v) => {
            this.oriList = v;
            this.expensesList = v.sort(function(a, b) {  return b.id - a.id; });
            this.resetSegment();
            for (var i = 0 ; i < this.expensesList.length ; i++ ){
                this.expensesList[i].timeago = this.timeSince(this.expensesList[i].datetime);
                this.setSegment(this.expensesList[i].freq);
            }
            this.showSegment = this.getSegmentStatus();               
        });

    }

    loadData(){
        this.storage.get('expensesList').then((expensesList) => {
            // this part is the slowest......
            // see if can preload.
            
            if (expensesList){
                this.expensesList = expensesList.sort(function(a, b) {  return b.id - a.id; });
                this.oriList = expensesList;
                this.resetSegment();
                for (var i = 0 ; i < this.expensesList.length ; i++ ){
                    this.expensesList[i].timeago = this.timeSince(this.expensesList[i].datetime);
                    this.setSegment(this.expensesList[i].freq);
                }
            }
            else{
                this.storage.set('expensesList', []);
                this.expensesList = [];
            }
            this.showSegment = this.getSegmentStatus();
            this.events.publish('reload:home','expensesList',this.expensesList);
        });

        this.storage.get('newphotoFlag').then((v) => {
            this.newphotoFlag = v;
        });


    }
    setSegment(freq){
        if (freq == 0) this.onetime += 1;
        else if (freq == 1) this.reserved += 1;
        else this.recurring += 1;
    }
    resetSegment(){
        this.onetime = 0;
        this.recurring = 0;
        this.reserved = 0;
        this.showSegment = 0;        
    }
    getSegment(freq){
        if (freq == 0) return this.onetime;
        else if (freq == 1) return this.reserved;
        else return this.recurring;
    }
    getSegmentStatus(){
        var x = 0;
        if (this.onetime) x += 1;
        if (this.reserved) x += 1;
        if (this.recurring) x += 1;
        return x;
    }

    presentActionSheet(expenses) {
        const actionSheet = this.actionSheetCtrl.create({
            title: 'Action',
            buttons: [
            {
                text: 'Edit',
                handler: () => {
                    let selected_id = expenses.id;
                    this.gotoManage(selected_id);
                }
            },
            {
                text: 'Delete',
                role: 'destructive',
                handler: () => {
                    let index = this.expensesList.indexOf(expenses);
                    this.expensesList.splice(index,1);
                    this.storage.set('expensesList', this.expensesList);
                    this.events.publish('reload:home','expensesList',this.expensesList);
                    this.events.publish('reload:expenses',this.expensesList);

                    if (!this.getSegment(expenses.freq)){
                        for(var i = 0; i < this.freqMap.length; i++){
                            if(this.getSegment(i)){
                                this.expenses_type = this.getSwitchType(i);
                                break;
                            }
                        }

                        this.showSegment = this.getSegmentStatus();
                    }
                }
            },
            {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                }
            }
            ]
        });

        actionSheet.present();
    }

    changeSwitchType(type){
        this.expenses_type = type;
    }

    gotoManage(selected_id) {
        this.events.publish('gotoManage', {'selected_id': selected_id, 'expensesList': this.oriList, 'camOn': this.newphotoFlag, 'init_price': this.init_price});
    }

    refreshSegment(expenses){
        if (!this.getSegment(expenses.freq)){
            for(var i = 0; i < this.freqMap.length; i++){
                if(this.getSegment(i)){
                    this.expenses_type = this.getSwitchType(i);
                    break;
                }
            }

            this.showSegment = this.getSegmentStatus();
        }        
    }

    expenses_found(){
        if (this.expensesList)
            return this.expensesList.length;
        else
            return 0;
    }

    timeSince(oridate) {
        var now = +new Date();
        var d = +new Date(oridate.replace(" ","T"));

        var seconds = Math.floor((now - d) / 1000);

        var interval = Math.floor(seconds / 31536000);

        interval = Math.floor(seconds / 3600);
        if (interval >= 24) 
            return oridate.split(' ')[0];

        if (interval >= 1) 
            return interval + " h";
        
        interval = Math.floor(seconds / 60);
        if (interval >= 1) 
            return interval + " m";

        return seconds + " s";
    }

    doRefresh(refresher) {
        console.log('Begin async operation', refresher);

        setTimeout(() => {
            this.loadData();
            refresher.complete();
        }, 1000);
    }

    getSwitchType(freq){
        if (freq == '0') return 'onetime';
        if (freq == '1') return 'reserved';
        return 'recurring';
    }

    quickAdd(claim){
        let title = 'Add expenses';
        let placeholder = '';
        let value = '';

        if (claim){
            title = "Claim reserved fund";
            placeholder = claim.amount;
            value = claim.amount;
        }

        let prompt = this.alertCtrl.create({
            title: title,
            message: "How much is the expenses?",
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
                        this.init_price = data.price;
                        this.gotoManage('-1');
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

        // Add new expenses
        var newExpenses = {
            'id': Math.round((new Date()).getTime() / 1000),
            'name': expenses.name,
            'amount': Number(price),
            'freq': 0,
            'freq_start': new Date().toISOString().slice(0, 19).replace('T',' '),
            'freq_end': new Date().toISOString().slice(0, 19).replace('T',' '),
            'datetime': new Date().toISOString().slice(0, 19).replace('T',' '),
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

        this.events.publish('reload:home','expensesList',this.expensesList);
        this.events.publish('change_segment', newExpenses.freq);
        this.storage.set('expensesList', this.expensesList);
        this.events.publish('reload:expenses', this.expensesList);
    }

    findIndex(find_id){
        for (var i = 0, len = this.expensesList.length; i < len; i++) {
            if (this.expensesList[i].id == find_id){
                return i;
            }
        }
        return -1;
    }

    notReserved(expenses){
        if(expenses.freq != 1){
            this.gotoManage(expenses.id);
        }
        else{
            this.presentClaimOption(expenses);
        }
    }

    presentClaimOption(expenses){
        const actionSheet = this.actionSheetCtrl.create({
            title: 'Action',
            buttons: [
            {
                text: 'Edit',
                handler: () => {
                    this.gotoManage(expenses.id);
                }
            },
            {
                text: 'Claim',
                handler: () => {
                    let claim = expenses;
                    this.quickAdd(claim);
                }
            },
            {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                }
            }
            ]
        });

        actionSheet.present();
    }

    getDefaultThumbnail(name, type){
        
        if(type==1 && name=="General") return "assets/imgs/icons/reserved.png";
        if(type > 1) return "assets/imgs/icons/recurring.png";

        if (name == "General") return "assets/imgs/icons/general.png";
        if (name == "Food") return "assets/imgs/icons/food.png";
        if (name == "Transport") return "assets/imgs/icons/transport.png";
        if (name == "Shopping") return "assets/imgs/icons/buy.png";
        if (name == "Stay") return "assets/imgs/icons/stay.png";
        if (name == "Relax") return "assets/imgs/icons/relax.png";
        if (name == "Souvenir") return "assets/imgs/icons/souvenir.png";
        if (name == "Other") return "assets/imgs/icons/other.png";
        
        return 0;
    }    
}
