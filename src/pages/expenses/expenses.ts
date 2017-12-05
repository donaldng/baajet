import { Component } from '@angular/core';
import { ActionSheetController, NavController, ModalController, Events } from 'ionic-angular'
import { Storage } from '@ionic/storage';
import { ImageService } from '../../service/image';
import { SettingPage } from '../setting/setting';
import { DateService } from '../../service/date';
import { NumberPage } from '../number/number';

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
    baaThumbnail;
    imageList;

    constructor(public dateLib: DateService, public imgLib: ImageService, public navCtrl: NavController, public actionSheetCtrl: ActionSheetController, public modalCtrl: ModalController, public storage: Storage, public events: Events) {
        this.init_price = 0;

        this.baaThumbnail = "assets/imgs/thumbnail-" + this.getRandomInt(1,8) + ".png";

        this.storage.get('budget').then((v) => {
            if (v && this.tot_budget != v){
                this.tot_budget = v;
            }
        });

        this.storage.get('currency').then((v) => {
            if(v) this.display_currency = v;
        });

        events.subscribe('update:currency', (c) => {
            this.display_currency = c;
        });

        events.subscribe('reset:expenses', () => {
            this.loadData();
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

        events.subscribe('return:expensesList', (expensesList) => {
            if(expensesList){
                this.expensesList = expensesList;
                this.processExpensesList(expensesList);
            }
        });

        events.publish('request:expensesList');

        events.subscribe('reload:expenses', (v) => {
            this.oriList = v;
            this.expensesList = v.sort(function(a, b) {  return a.freq - b.freq || b.id - a.id; });
            this.resetSegment();
            for (var i = 0 ; i < this.expensesList.length ; i++ ){
                this.expensesList[i].timeago = this.timeSince(this.expensesList[i].datetime);
                this.setSegment(this.expensesList[i].freq);
            }
            this.showSegment = this.getSegmentStatus();               
        });

        //this.loadData();

    }
    previousDiff(expenses, idx){
        if (idx == 0) return true;

        var prevDate = this.expensesList[idx - 1].datetime;
        var prevFreq = this.expensesList[idx - 1].freq;

        if (expenses.datetime.slice(0,10) != prevDate.slice(0,10) || prevFreq != expenses.freq) return true;

        return false;
    }

    loadData(){
        this.storage.get('expensesList').then((expensesList) => {
            this.processExpensesList(expensesList);                        
        });

        this.storage.get('newphotoFlag').then((v) => {
            this.newphotoFlag = v;
        });
    }

    processExpensesList(expensesList){
        let available_dates = [];

        if (expensesList){
            this.expensesList = expensesList.sort(function(a, b) {  return a.freq - b.freq || b.id - a.id; });
            this.oriList = expensesList;
            this.resetSegment();
            for (var i = 0 ; i < this.expensesList.length ; i++ ){
                this.expensesList[i].timeago = this.timeSince(this.expensesList[i].datetime);
                this.setSegment(this.expensesList[i].freq);
                available_dates.push(this.daySince(this.expensesList[i].datetime));
            }

            this.events.publish('filter:dates', available_dates); 
        }
        else{
            this.storage.set('expensesList', []);
            this.expensesList = [];
        }

        this.showSegment = this.getSegmentStatus();
        this.events.publish('reload:home', 'expensesList', this.oriList);
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
        this.events.publish('gotoManage', {'selected_id': selected_id, 'expensesList': this.oriList, 'camOn': this.newphotoFlag, 'init_price': this.init_price, 'segment': this.expenses_type});
    }
    getFreqText(expenses){
        if (expenses.freq == 2){
            var days = expenses.freq_amt;
            var text = "";

            if (days != 1){
                text = "" + days + " ";
            }

            return "Every " + text + "days";
        }

        return this.freqMap[expenses.freq];

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
            return oridate.split(' ')[1];

        if (interval >= 1) 
            return interval + " h";
        
        interval = Math.floor(seconds / 60);
        if (interval >= 1) 
            return interval + " m";

        return seconds + " s";
    }

    daySince(oridate){
        var today = new Date();
        var createdOn = new Date(oridate.replace(" ","T"));

        var msInDay = 24 * 60 * 60 * 1000;

        createdOn.setHours(0,0,0,0);

        var day = (+today - +createdOn)/msInDay
        var diff = String(day).split('.')[0];

        if(diff == "0") return "Today"
        if (diff == "1") return 'Yesterday';

        return '' + diff + ' days ago';        
    }

    doRefresh(refresher) {
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

    quickAdd(claim) {
        let title = 'Add Expenses';
        let placeholder = '0.00';
        let value = '';

        if (claim) {
            title = "Use fund";
            placeholder = claim.amount;
            value = claim.amount;
        }

        let message = "How much are you spending?";
        let option = {
            'title': title,
            'placeholder': placeholder,
            'value': value,
            'message': message,
            'claim': claim,
            'firsttime': 0
        }

        this.runNumberModal(option);

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

        let image = 0;
        if (typeof expenses.image != 'undefined') image = expenses.image;

        let thumbnail = 0;
        if (typeof expenses.thumbnail != 'undefined') thumbnail = expenses.thumbnail;

        var x = new Date();
        var today = this.dateLib.toString(x).replace('T',' ');


        // Add new expenses
        var newExpenses = {
            'id': Math.round((new Date()).getTime() / 1000),
            'name': expenses.name,
            'amount': Number(price),
            'freq': 0,
            'freq_start': today,
            'freq_end': today,
            'datetime': today,
            'image': image,
            'thumbnail': thumbnail,
            'todays': true,
            'fromReserved': 1
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

    getThumbnailName(name, src){
        var list = this.imgLib.generateImageList(name);
        
        for (var i = 0; i < list.length; i++){
            if(list[i].src == src){
                return list[i].name;
            }
        }
        
        return 'Photo';
    }

    getDefaultThumbnail(x, y){
        return this.imgLib.getDefaultThumbnail(x , y);
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

        return n;
    }  

    gotoSetting(){
        let modal = this.modalCtrl.create(SettingPage, { 'init_budget': 0 }, { showBackdrop: false, enableBackdropDismiss: true });
        modal.present();
    }

    runNumberModal(option) {
        let modal = this.modalCtrl.create(NumberPage, option, {enableBackdropDismiss: false});

        modal.present().then(() => {
            const firstInput: any = document.querySelector('input');
            firstInput.focus();
        });

        modal.onDidDismiss(data => {
            if (!data.claim) {
                this.init_price = data.value;
                this.gotoManage('-1');
            }
            else {
                // If claim direct add one
                this.claimExpenses(data.claim, data.value);
            }
        });
    }    
}