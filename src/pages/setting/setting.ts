import { Component } from '@angular/core';
import { NavParams, ViewController, AlertController } from 'ionic-angular';
import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { SocialSharing } from '@ionic-native/social-sharing';

import { DateService } from '../../service/date';
import { FirebaseService } from '../../service/firebasedb';

@Component({
    selector: 'page-setting',
    templateUrl: 'setting.html',
})

export class SettingPage {
    items: string[];
    budget: number;
    currency: string;
    duration;
    tripStart;
    tripEnd;
    saveimageFlag: boolean;
    editFlag: boolean;
    newphotoFlag: boolean;
    enablePhotoFlag: boolean;
    maxDate;
    promoPaid: number;

    constructor(public socialSharing: SocialSharing, public firebaseStorage: FirebaseService, public dateLib: DateService, public events: Events, public params: NavParams, public viewCtrl: ViewController, public navCtrl: NavController, private alertCtrl: AlertController) {
        this.budget = this.params.get('init_budget');

        // Force reset
        // this.firebaseStorage.set('promoPaid', 0);

        this.promoPaid = 0;

        this.items = ['$', '¥', '€', '£', '฿'];
        this.currency = '$';

        this.maxDate = this.dateLib.addDay(new Date(), 180);
        this.maxDate = this.dateLib.dateToString(this.maxDate);

        // If no budget passed in, check if database has the value.
        if (this.budget == 0){
            this.firebaseStorage.get('budget', (err, snap) => {
                let v = snap.val();
                if(v) this.budget = v;
            });
        }

        this.firebaseStorage.get('promoPaid', (err, snap) => {
            let v = snap.val();
            if (v) this.promoPaid = v;
        });

        this.firebaseStorage.get('currency', (err, snap) => {
            let v = snap.val();
            if(v) this.currency = v;
        });

        this.firebaseStorage.get('duration', (err, snap) => {
            let v = snap.val();

            if (v){
                this.duration = v.split(" ~ ");
                this.tripStart = this.duration[0];
                this.tripEnd = this.duration[1];
            }
            else{
                this.tripStart = this.dateLib.dateToString(new Date());
                this.tripEnd = this.dateLib.addDay(new Date(), 6);
                this.tripEnd = this.dateLib.dateToString(this.tripEnd);
            }
        });

        this.firebaseStorage.get('saveimageFlag', (err, snap) => {
            let v = snap.val();
            if(v) this.saveimageFlag = v;
        });    
        this.firebaseStorage.get('editFlag', (err, snap) => {
            let v = snap.val();
            if(v) this.editFlag = v;
        }); 
        this.firebaseStorage.get('newphotoFlag', (err, snap) => {
            let v = snap.val();
            if(v) this.newphotoFlag = v;
        });       
        this.firebaseStorage.get('enablePhotoFlag', (err, snap) => {
            let v = snap.val();
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
        //this.firebaseStorage.clear();
        this.clearAll()
        this.dismiss()
    }

    clearAll(){
        this.firebaseStorage.set('budget', 0);
        this.firebaseStorage.set('currency', '$');
        this.firebaseStorage.set('duration', '');
        this.firebaseStorage.set('saveimageFlag', false);
        this.firebaseStorage.set('editFlag', false);
        this.firebaseStorage.set('newphotoFlag', false);
        this.firebaseStorage.set('enablePhotoFlag', false);
        this.firebaseStorage.set('expensesList', []);

        this.events.publish('reload:expenses', []);        
        this.events.publish('expenses:total_expenses', 0);
        this.events.publish('app:reload', []);

        this.events.publish('reload:home', 'tot_budget', 0);
        this.events.publish('reload:home', 'duration', '');
        this.events.publish('reload:home', 'expensesList', []);

        this.events.publish('update:currency', '$');
        this.events.publish('saveimageFlag', false);
        this.events.publish('editFlag', false);
        this.events.publish('newphotoFlag', false);
        this.events.publish('enablePhotoFlag', false);        
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

    validateDate(field: string){
        if (this.tripStart <= this.tripEnd) return;

        if (field == "start"){
            this.tripEnd = this.dateLib.addDay(new Date(this.tripStart), 3);
            this.tripEnd = this.dateLib.dateToString(this.tripEnd);            
        }
        if (field == "end"){
            this.tripStart = this.tripEnd;
        }
    }

    // facebookShare() {
    //     this.socialSharing.shareVia("facebook", "Baajet App - Track your travelling budget free and easy! #baajet #travelling", "", "https://i.imgur.com/twGB1DD.jpg", "https://baajetapp.com").then(() => {
    //         setTimeout(function () {
    //             alert("Thank you for helping us grow. Enjoy ad-free experience in your following session!");
    //             this.firebaseStorage.set('promoPaid', 1);
    //         }, 3000);
    //     }).catch(() => {
    //         console.error("shareViaTwitter: failed");
    //     });
    // }

    twitterShare() {
        this.socialSharing.shareViaTwitter("Baajet App - Track your travelling budget free and easy! #baajet #travelling", "https://i.imgur.com/twGB1DD.jpg", "https://baajetapp.com").then(() => {
            this.firebaseStorage.set('promoPaid', 1);
            setTimeout(function () { 
                alert("Thank you for helping us grow. Enjoy ad-free experience in your following session!");                                
             }, 3000);
        }).catch(() => {
            console.error("shareViaTwitter: failed");
        });
    }

    // instaShare() {
    //     this.instagram.share('https://i.imgur.com/twGB1DD.jpg', 'Baajet App - Track your travelling budget free and easy! https://baajetapp.com #baajet #travelling')
    //         .then(() => setTimeout(function () {
    //             alert("Thank you for helping us grow. Enjoy ad-free experience in your following session!");
    //             this.firebaseStorage.set('promoPaid', 1);
    //         }, 3000))
    //         .catch((error: any) => alert(error));
    // }    

    submitForm() {
        let duration = this.tripStart + ' ~ ' + this.tripEnd;
        let budget = Number(this.budget);

        if(this.budget <= 0 || typeof this.budget == 'undefined'){
            alert('We need a valid budget please..!');
        }
        else if (this.tripStart > this.tripEnd){
            alert('Why is the start date bigger than end date? :(');
        }
        else{
            this.firebaseStorage.set('budget', budget);
            this.firebaseStorage.set('currency', this.currency);
            this.firebaseStorage.set('duration', duration);
            this.firebaseStorage.set('saveimageFlag', this.saveimageFlag);
            this.firebaseStorage.set('editFlag', this.editFlag);
            this.firebaseStorage.set('newphotoFlag', this.newphotoFlag);
            this.firebaseStorage.set('enablePhotoFlag', this.enablePhotoFlag);

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