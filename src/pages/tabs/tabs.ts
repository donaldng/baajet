import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { ExpensesPage } from '../expenses/expenses';
import { ManagePage } from '../manage/manage';

import { Events } from 'ionic-angular';
import { ModalController, NavController } from 'ionic-angular';

@Component({
    templateUrl: 'tabs.html'
})
export class TabsPage {

    tab1Root = HomePage;
    tab2Root = ExpensesPage;
    expensesList;

    constructor(public events: Events, public modalCtrl: ModalController, public navCtrl: NavController) {
        events.subscribe('gotoManage', (v) => {
            var selected_id = v.selected_id;
            var camOn = 0;

            if (v.camOn) camOn = v.camOn;


            let modal = this.modalCtrl.create(ManagePage, {'selected_id': selected_id, 'expensesList': this.expensesList, 'camOn': camOn});
            modal.onDidDismiss(data => {
            });
            modal.present();

        });  

        events.subscribe('reload:expenses', (v) => {
            this.expensesList = v;     
        });

    }

}
