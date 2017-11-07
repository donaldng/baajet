import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { ExpensesPage } from '../expenses/expenses';
import { ManagePage } from '../manage/manage';

import { Events } from 'ionic-angular';
import { ModalController, NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
    templateUrl: 'tabs.html'
})
export class TabsPage {

    tab1Root = HomePage;
    tab2Root = ExpensesPage;
    expensesList = [];
    camOn = 0;
    selected_id;

    constructor(public events: Events, public modalCtrl: ModalController, public navCtrl: NavController, public storage: Storage) {
        
        events.subscribe('reload:home', (k, v) => {
            if (k == 'expensesList') this.expensesList = v;
        });

        events.subscribe('gotoManage', (v) => {
            this.selected_id = v.selected_id;
            this.camOn = 0;

            if (v.camOn) this.camOn = v.camOn;

            if (this.selected_id == -1 && this.expensesList.length == 0){
                this.storage.get('expensesList').then((expensesList) => {
                    this.expensesList = expensesList;
                    this.runModal();
                });
            }
            else{
                this.runModal();
            }

        });  

        events.subscribe('reload:expenses', (v) => {
            this.expensesList = v;     
        });

    }

    runModal(){
        let modal = this.modalCtrl.create(ManagePage, {'selected_id': this.selected_id, 'expensesList': this.expensesList, 'camOn': this.camOn});
        modal.onDidDismiss(data => {
        });
        modal.present();        
    }

}
