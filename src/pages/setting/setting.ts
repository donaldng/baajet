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
    duration;

    constructor( public params: NavParams, public viewCtrl: ViewController, public storage: Storage, public navCtrl: NavController ) {
        this.items = ['$', '¥', '€', '£', '฿'];
        this.budget = this.params.get('budget');
        this.currency = this.params.get('currency');
        this.storage.get('duration').then((v) => {
            if (v){
                this.duration = v.split(" ~ ");
                this.tripStart = this.duration[0];
                this.tripEnd = this.duration[1];

                console.log('db');
                console.log(this.tripStart);
                console.log(this.tripEnd);
            }
            else{
                this.tripStart = new Date().toISOString().slice(0, 19);
                this.tripEnd = new Date();
                this.tripEnd.setDate(this.tripEnd.getDate() + 7);
                this.tripEnd = this.tripEnd.toISOString().slice(0, 19);

                console.log('new');
                console.log(this.tripStart);
                console.log(this.tripEnd);

            }
        });
    }

    submitForm() {
        this.storage.set('budget', this.budget);
        this.storage.set('currency', this.currency);
        this.storage.set('duration', this.tripStart + ' ~ ' + this.tripEnd);
        this.storage.set('reload_home', 1);

        this.dismiss();
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}