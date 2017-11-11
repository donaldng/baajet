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

    expenses_found(){
        console.log('expenses_found');
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
        console.log(freq);
        if (freq == '0') return 'onetime';
        if (freq == '1') return 'reserved';
        return 'recurring';
    }

    quickAdd(){
        let prompt = this.alertCtrl.create({
            title: 'Add expenses',
            message: "How much is the expenses?",
            inputs: [
            {
                name: 'price',
                placeholder: '',
                type: 'number'
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
                    this.init_price = data.price;
                    this.gotoManage('-1');
                }
            }
            ]
        });
        prompt.present();
    }

    findRunningId(){
        var l = this.expensesList;
        var id = 0;
        var return_id = 0;

        if (l){
            for (var i = 0 ; i < l.length; i++ ){
                if (l[i].name.indexOf('Expenses #') >= 0){
                    id = l[i].name.split('#')[1];

                    if (!isNaN(id) && id > return_id){
                        return_id = id;
                    }
                }
            }
        }

        this.runningId = Number(return_id) + 1;        
    }  

    getDefaultThumbnail(name, type){
        
        if(type==1) return "assets/imgs/icons/reserved.png";
        if(type > 1) return "assets/imgs/icons/recurring.png";

        if (name == "General") return "assets/imgs/icons/general.png";
        if (name == "Food") return "assets/imgs/icons/food.png";
        if (name == "Transport") return "assets/imgs/icons/transport.png";
        if (name == "Shopping") return "assets/imgs/icons/buy.png";
        if (name == "Relax") return "assets/imgs/icons/relax.png";
        if (name == "Souvenir") return "assets/imgs/icons/souvenir.png";
        if (name == "Other") return "assets/imgs/icons/other.png";
        
        return 0;
    }    
}
