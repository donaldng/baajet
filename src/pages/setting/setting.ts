import { Component } from '@angular/core';
import { NavParams, ViewController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { DateService } from '../../service/date';

@Component({
    selector: 'page-setting',
    templateUrl: 'setting.html',
})

export class SettingPage {
    items;
    budget;
    currency;
    duration;
    tripStart;
    tripEnd;
    saveimageFlag;
    editFlag;
    newphotoFlag;
    enablePhotoFlag;
    maxDate;

    constructor(public dateLib: DateService, public events: Events, public params: NavParams, public viewCtrl: ViewController, public storage: Storage, public navCtrl: NavController, private alertCtrl: AlertController) {
        this.budget = this.params.get('init_budget');        

        this.items = ['$', '¥', '€', '£', '฿'];
        this.currency = '$';

        this.maxDate = this.dateLib.addDay(new Date(), 180);
        this.maxDate = this.dateLib.toString(this.maxDate);

        // If no budget passed in, check if database has the value.
        if (this.budget == 0){
            this.storage.get('budget').then((v) => {
                if(v) this.budget = v;
            });
        }

        this.storage.get('currency').then((v) => {
            if(v) this.currency = v;
        });

        this.storage.get('duration').then((v) => {

            if (v){
                this.duration = v.split(" ~ ");
                this.tripStart = this.duration[0];
                this.tripEnd = this.duration[1];
            }
            else{
                this.tripStart = this.dateLib.toString(new Date());
                this.tripEnd = this.dateLib.addDay(new Date(), 7);
                this.tripEnd = this.dateLib.toString(this.tripEnd);
            }
        });

        this.storage.get('saveimageFlag').then((v) => {
            if(v) this.saveimageFlag = v;
        });    
        this.storage.get('editFlag').then((v) => {
            if(v) this.editFlag = v;
        }); 
        this.storage.get('newphotoFlag').then((v) => {
            if(v) this.newphotoFlag = v;
        });       
        this.storage.get('enablePhotoFlag').then((v) => {
            if(v) this.enablePhotoFlag = v;
        });  
    }

    goHome(){
        this.navCtrl.parent.select(0);
    }
    
    dismiss() {
        this.viewCtrl.dismiss();
    }
    
    resetStorage(){
        //this.storage.clear();
        this.clearAll()

        this.tripStart = this.dateLib.toString(new Date());
        this.tripEnd = this.dateLib.addDay(new Date(), 7);
        this.tripEnd = this.dateLib.toString(this.tripEnd);

        var duration = this.tripStart + ' ~ ' + this.tripEnd;

        this.events.publish('reload:home', 'tot_budget', 0);
        this.events.publish('reload:home', 'duration', duration);
        this.events.publish('reload:expenses', []);
        this.events.publish('app:reload', []);

        this.dismiss()

    }

    clearAll(){
        this.storage.set('budget', 0);
        this.storage.set('currency', '$');
        this.storage.set('duration', '');
        this.storage.set('saveimageFlag', 0);
        this.storage.set('editFlag', 0);
        this.storage.set('newphotoFlag', 0);
        this.storage.set('enablePhotoFlag', 0);
        this.storage.set('expensesList', []);

        this.events.publish('reload:home', 'tot_budget', 0);
        this.events.publish('reload:home', 'duration', '');
        this.events.publish('update:currency', '$');
        this.events.publish('saveimageFlag', 0);
        this.events.publish('editFlag', 0);
        this.events.publish('newphotoFlag', 0);
        this.events.publish('enablePhotoFlag', 0);        
    }

    presentConfirm() {
        let alert = this.alertCtrl.create({
            title: 'Reset',
            message: 'Do you want to reset all your current trips information?',
            buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                }
            },
            {
                text: 'Yes',
                handler: () => {
                    this.resetStorage();
                }
            }
            ]
        });
        alert.present();
    }

    validateDate(field){
        if (this.tripStart <= this.tripEnd) return;

        if (field == "start"){
            this.tripEnd = this.dateLib.addDay(new Date(this.tripStart), 3);
            this.tripEnd = this.dateLib.toString(this.tripEnd);            
        }
        if (field == "end"){
            this.tripStart = this.tripEnd;
        }
    }

    submitForm() {
        var duration = this.tripStart + ' ~ ' + this.tripEnd;
        var budget = Number(this.budget);

        if(this.budget <= 0 || typeof this.budget == 'undefined'){
            alert('We need a valid budget please..!');
        }
        else if (this.tripStart > this.tripEnd){
            alert('Why is the start date bigger than end date? :(');
        }
        else{
            this.storage.set('budget', budget);
            this.storage.set('currency', this.currency);
            this.storage.set('duration', duration);
            this.storage.set('saveimageFlag', this.saveimageFlag);
            this.storage.set('editFlag', this.editFlag);
            this.storage.set('newphotoFlag', this.newphotoFlag);
            this.storage.set('enablePhotoFlag', this.enablePhotoFlag);

            this.events.publish('reload:home', 'tot_budget', budget);
            this.events.publish('reload:home', 'duration', duration);
            this.events.publish('update:currency', this.currency);
            this.events.publish('saveimageFlag', this.saveimageFlag);
            this.events.publish('editFlag', this.editFlag);
            this.events.publish('newphotoFlag', this.newphotoFlag);
            this.events.publish('enablePhotoFlag', this.enablePhotoFlag);

            this.dismiss();
        }
    }
}