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
    tot_budget = 0;
    init_price = 0;

    constructor(public events: Events, public modalCtrl: ModalController, public navCtrl: NavController, public storage: Storage) {
        this.storage.get('budget').then((v) => {
            if (v && this.tot_budget != v){
                this.tot_budget = v;
            }
        });
                
        events.subscribe('reload:home', (k, v) => {
            if (k == 'expensesList') this.expensesList = v;
            else if(k == "tot_budget"){
                this.tot_budget = v;
            }
        });

        events.subscribe('gotoManage', (v) => {
            this.selected_id = v.selected_id;
            this.camOn = 0;
            this.init_price = 0;

            if (v.camOn) this.camOn = v.camOn;
            if (v.init_price) this.init_price = v.init_price;

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
        let modal = this.modalCtrl.create(ManagePage, {'selected_id': this.selected_id, 'expensesList': this.expensesList, 'camOn': this.camOn, 'init_price': this.init_price});
        modal.onDidDismiss(data => {
        });
        modal.present();        
    }

}
