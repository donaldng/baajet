import { Component } from '@angular/core';
import { NavParams, ViewController, ModalController, Events } from 'ionic-angular';
import { SettingPage } from '../setting/setting';


@Component({
    selector: 'page-number',
    templateUrl: 'number.html',
})

export class NumberPage {
    title;
    placeholder;
    message;
    value;
    claim;
    firsttime;
    newphotoFlag;

    constructor(public modalCtrl: ModalController, public viewCtrl: ViewController, public params: NavParams, public events: Events) {
        this.firsttime = 0;
        this.claim = 0;

        this.title = this.params.get('title');
        this.placeholder = this.params.get('placeholder');
        this.message = this.params.get('message');
        this.value = this.params.get('value');
        this.newphotoFlag = this.params.get('newphotoFlag');

        if (this.params.get('claim')) this.claim = this.params.get('claim');
        if (this.params.get('firsttime')) this.firsttime = this.params.get('firsttime');
    }
    submit(){
        let data = {
            'value': this.value,
            'claim': this.claim,
            'firsttime': this.firsttime
        }

        if (data.firsttime) {
            this.gotoSetting(data.value);
        }
        else if (!data.claim) {
            this.gotoManage(data.value);
        }

        this.viewCtrl.dismiss(data);        
    }

    dismiss() {
        this.value = '';
        this.viewCtrl.dismiss();
    }

    gotoSetting(init_budget) {
        let modal = this.modalCtrl.create(SettingPage, { 'init_budget': init_budget }, { showBackdrop: false, enableBackdropDismiss: true });
        modal.present();
    }

    gotoManage(init_price) {
        this.events.publish('gotoManage', { 'selected_id': -1, 'camOn': this.newphotoFlag, 'init_price': init_price, 'segment': "onetime" });
    }

}