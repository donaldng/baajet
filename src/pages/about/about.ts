import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ActionSheetController } from 'ionic-angular'
import { ModalController } from 'ionic-angular';
import { ManagePage } from '../manage/manage';
import { Storage } from '@ionic/storage';

@Component({
    selector: 'page-about',
    templateUrl: 'about.html'
})
export class AboutPage {
    expensesList;
    display_currency;
    oriList;
    freqMap;
    runningId;

    constructor(public navCtrl: NavController, public actionSheetCtrl: ActionSheetController, public modalCtrl: ModalController, public storage: Storage) {
        this.display_currency = '$';
        this.expensesList = [];
        this.freqMap = ['One time','Reserved fund','Daily','Weekly','Monthly'];
        this.loadData();
        this.reload_currency();
        setInterval(this.reload_currency.bind(this), 1000);
    }
    
    reload_currency(){
        this.storage.get('currency').then((currency) => {
            if (currency){
                if(this.display_currency != currency)
                    this.display_currency = currency;
            }
        });
    }

    loadData(){
        this.storage.get('expensesList').then((expensesList) => {
            if (expensesList){
                this.expensesList = expensesList.sort(function(a, b) {  return b.id - a.id; });
                this.oriList = expensesList;
                for (var i = 0 ; i < this.expensesList.length ; i++ ){
                    this.expensesList[i].datetime = this.timeSince(this.expensesList[i].datetime);
                }
            }
            else{
                this.storage.set('expensesList', []);
                this.expensesList = [];
            }
        });
        this.findRunningId();
    }

    presentActionSheet(theItem) {
        const actionSheet = this.actionSheetCtrl.create({
            title: 'Action',
            buttons: [
            {
                text: 'Edit',
                handler: () => {
                    let id = theItem.id;
                    this.gotoManage(id, this.oriList);
                }
            },
            {
                text: 'Delete',
                role: 'destructive',
                handler: () => {
                    let index = this.expensesList.indexOf(theItem);
                    this.expensesList.splice(index,1);
                    this.storage.set('expensesList', this.expensesList);
                    this.storage.set('reload_home', 1);
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

    gotoManage(id, list) {
        let modal = this.modalCtrl.create(ManagePage, {'id': id, 'expensesList':list, 'runningId': this.runningId});
        modal.onDidDismiss(data => {
            this.loadData();
            this.storage.set('reload_home', 1);        
        });

        modal.present();
    }

    checklist(){
        if (this.expensesList)
            return this.expensesList.length;
        else
            return 0;
    }

    timeSince(oridate) {

        var date = new Date(oridate.replace(" ","T"));

        var seconds = Math.floor((new Date() - date) / 1000);
        var interval = Math.floor(seconds / 31536000);

        interval = Math.floor(seconds / 3600);
        if (interval > 1) return interval + " hours";
        
        interval = Math.floor(seconds / 60);
        if (interval > 1) return interval + " minutes";

        return oridate;
    }


    findRunningId(){
        this.storage.get('expensesList').then((l) => {
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
        });
    }   
}
