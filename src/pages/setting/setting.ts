import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'page-setting',
    templateUrl: 'setting.html',
})

export class SettingPage {
    items;
    budget;
    currency;

    constructor( public params: NavParams, public viewCtrl: ViewController, public storage: Storage, public navCtrl: NavController ) {
        this.items = ['$', '¥', '€', '£', '฿'];
        this.budget = this.params.get('budget');
        this.currency = this.params.get('currency');
    }

    submitForm() {
        this.storage.set('budget', this.budget);
        this.storage.set('currency', this.currency);
        this.dismiss();
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}