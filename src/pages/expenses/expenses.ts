import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ActionSheetController } from 'ionic-angular'
import { ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';

@Component({
    selector: 'page-expenses',
    templateUrl: 'expenses.html'
})

export class ExpensesPage {
    expensesList;
    display_currency;
    oriList;
    freqMap;
    runningId;

    constructor(public navCtrl: NavController, public actionSheetCtrl: ActionSheetController, public modalCtrl: ModalController, public storage: Storage, public events: Events) {
        this.display_currency = '$';
        this.expensesList = [];
        this.freqMap = ['One time','Reserved fund','Daily','Weekly','Monthly'];
        this.loadData();

        events.subscribe('update:currency', (c) => {
            this.display_currency = c;
        });

        events.subscribe('reload:expenses', (v) => {
            this.oriList = v;
            this.expensesList = v.sort(function(a, b) {  return b.id - a.id; });
            for (var i = 0 ; i < this.expensesList.length ; i++ ){
                this.expensesList[i].timeago = this.timeSince(this.expensesList[i].datetime);
            }            
        });
    }

    loadData(){
        this.storage.get('expensesList').then((expensesList) => {
            if (expensesList){
                this.expensesList = expensesList.sort(function(a, b) {  return b.id - a.id; });
                this.oriList = expensesList;
                for (var i = 0 ; i < this.expensesList.length ; i++ ){
                    this.expensesList[i].timeago = this.timeSince(this.expensesList[i].datetime);
                }
            }
            else{
                this.storage.set('expensesList', []);
                this.expensesList = [];
            }

            this.events.publish('reload:home','expensesList',this.expensesList);
        });
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

    gotoManage(selected_id) {
        this.events.publish('gotoManage', {'selected_id': selected_id, 'expensesList': this.oriList});
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
            return oridate;

        if (interval >= 1) 
            return interval + " hours";
        
        interval = Math.floor(seconds / 60);
        if (interval >= 1) 
            return interval + " minutes";

        return seconds + " seconds";
    }

    doRefresh(refresher) {
        console.log('Begin async operation', refresher);

        setTimeout(() => {
            this.loadData();
            refresher.complete();
        }, 1000);
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
}
