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

    constructor(public navCtrl: NavController, public actionSheetCtrl: ActionSheetController, public modalCtrl: ModalController, public storage: Storage) {
        this.display_currency = '$';
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
        }
        else{
            this.storage.set('expensesList', []);
        }
    });
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
    let modal = this.modalCtrl.create(ManagePage, {'id': id, 'expensesList':list});
    modal.onDidDismiss(data => {
        this.loadData();
        this.storage.set('reload_home', 1);        
    });

    modal.present();
}
}
