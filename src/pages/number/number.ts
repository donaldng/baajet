import { Component } from '@angular/core';
import { NavParams, ViewController, Events } from 'ionic-angular';


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
    from;

    constructor(public viewCtrl: ViewController, public params: NavParams, public events: Events) {
        this.firsttime = 0;
        this.claim = 0;

        this.title = this.params.get('title');
        this.placeholder = this.params.get('placeholder');
        this.message = this.params.get('message');
        this.value = this.params.get('value');
        this.from = this.params.get('from');

        if (this.params.get('claim')) this.claim = this.params.get('claim');
        if (this.params.get('firsttime')) this.firsttime = this.params.get('firsttime');
    }
    submit(){
        let data = {
            'value': this.value,
            'claim': this.claim,
            'firsttime': this.firsttime
        }

        // open new model before dismissal
        if (!this.claim){
            if (this.from == 'home') this.events.publish('dismiss:home', data);
            else if (this.from == 'expenses') this.events.publish('dismiss:expenses', data);
        }

        this.viewCtrl.dismiss(data);
    }
    dismiss() {
        this.value = '';
        this.viewCtrl.dismiss();
    }
}