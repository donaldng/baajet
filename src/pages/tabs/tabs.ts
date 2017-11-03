import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { ExpensesPage } from '../expenses/expenses';
import { ManagePage } from '../manage/manage';

import { Events } from 'ionic-angular';
import { ModalController } from 'ionic-angular';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = ExpensesPage;

  constructor(public events: Events, public modalCtrl: ModalController) {
        events.subscribe('gotoManage', (v) => {
            var expensesList = v.expensesList;
            var selected_id = v.selected_id;

            let modal = this.modalCtrl.create(ManagePage, {'selected_id': selected_id, 'expensesList': expensesList});
            modal.present();

        });    
  }

}
