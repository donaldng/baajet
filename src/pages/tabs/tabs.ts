import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { ExpensesPage } from '../expenses/expenses';
import { ManagePage } from '../manage/manage';

import { Events } from 'ionic-angular';
import { ModalController, NavController } from 'ionic-angular';
import { FirebaseService } from '../../service/firebasedb';

@Component({
    templateUrl: 'tabs.html'
})
export class TabsPage {

    tab1Root = HomePage;
    tab2Root = ExpensesPage;
    expensesList: any[] = [];
    camOn: boolean = false;
    selected_id: number;
    tot_budget: number = 0;
    init_price: number = 0;
    segment: number;

    constructor(public events: Events, public firebaseStorage: FirebaseService, public modalCtrl: ModalController, public navCtrl: NavController) {
        this.firebaseStorage.get('budget', (err, snap) => {
            let v = snap.val();
            if (v && this.tot_budget != v){
                this.tot_budget = v;
            }
        });

        this.firebaseStorage.get('expensesList', (err, snap) => {
            let v = snap.val();
            if(v) this.expensesList = v;
        });        

        events.subscribe('reload:home', (k, v) => {
            if (k == 'expensesList') this.expensesList = v;
            else if(k == "tot_budget"){
                this.tot_budget = v;
            }
        });

        events.subscribe('gotoManage', (v) => {
            this.selected_id = v.selected_id;
            this.camOn = false;
            this.segment = 0;
            this.init_price = 0;

            if (v.camOn) this.camOn = v.camOn;
            if (v.init_price) this.init_price = v.init_price;
            if (v.segment){
                if(v.segment == "onetime") this.segment = 0;
                else if(v.segment == "reserved") this.segment = 1;
                else this.segment = 2;
            }
            this.runModal();

        });  

        events.subscribe('reload:expenses', (v) => {
            this.expensesList = v;     
        });

    }

    runModal(){
        let modal = this.modalCtrl.create(ManagePage, { 'selected_id': this.selected_id, 'expensesList': this.expensesList, 'camOn': this.camOn, 'init_price': this.init_price, 'segment': this.segment }, { showBackdrop: false, enableBackdropDismiss: true });
        modal.onDidDismiss(data => {
        });
        modal.present();        
    }

    entersHome(){
        this.events.publish('enter:home');
    }
}
