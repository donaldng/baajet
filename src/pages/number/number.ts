import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';


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

    constructor(public viewCtrl: ViewController, public params: NavParams) {
        this.firsttime = 0;
        this.claim = 0;

        this.title = this.params.get('title');
        this.placeholder = this.params.get('placeholder');
        this.message = this.params.get('message');
        this.value = this.params.get('value');

        if (this.params.get('claim')) this.claim = this.params.get('claim');
        if (this.params.get('firsttime')) this.firsttime = this.params.get('firsttime');
    }
    submit(){
        let data = {
            'value': this.value,
            'claim': this.claim,
            'firsttime': this.firsttime
        }
        this.viewCtrl.dismiss(data);        
    }
    dismiss() {
        this.value = '';
        this.viewCtrl.dismiss();
    }
}