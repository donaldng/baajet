import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'page-manage',
    templateUrl: 'manage.html',
})

export class ManagePage {
    expensesList;
    expenses;
    pageName;
    id;
    color;
    promise;

constructor( public params: NavParams, public viewCtrl: ViewController, public storage: Storage, public navCtrl: NavController ) {
    this.id = this.params.get('id');
    this.expensesList = this.params.get('expensesList');

    if(this.id == '-1'){
        console.log("add new expenses");
        this.expenses = {name: '', amount: '', freq: ''};
        this.pageName = "Add expenses";
        this.color = "primary";
    }
    else{
        console.log('edit old expenses');
        let index = this.findIndex(this.id);

        this.expenses = this.expensesList[index];
        console.log(this.expenses);
        this.pageName = "Edit expenses";
        this.color = "secondary";
    }
}

findIndex(find_id){
    for (var i = 0, len = this.expensesList.length; i < len; i++) {
        if (this.expensesList[i].id == find_id){
            console.log('found', this.expensesList[i]);
            return i;
        }
    }
    return -1;
}

submitForm() {
    var changes = {
                    'id': this.expenses.id,
                    'name':this.expenses.name,
                    'amount': this.expenses.amount,
                    'freq': this.expenses.freq,
                    'datetime': this.expenses.datetime
                };
    this.storage.get('expensesList').then((expensesList) => {
        if (expensesList){
            this.expensesList = expensesList;
    
            if (this.id == "-1"){
                changes['id'] = Math.round((new Date()).getTime() / 1000);
                changes['datetime'] = new Date().toISOString().slice(0, 19).replace('T',' ');

                this.expensesList.push(changes);
            }
            else{

                let index = this.findIndex(this.id);
                console.log(changes);
                this.expensesList[index] = changes;
                console.log(this.expensesList);

            }

            this.storage.set('expensesList', this.expensesList);
            this.dismiss(1);              
        }
    });    
  
}

dismiss(status) {
    this.viewCtrl.dismiss(status);
}
}
