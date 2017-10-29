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
    default_placeholder;

constructor( public params: NavParams, public viewCtrl: ViewController, public storage: Storage, public navCtrl: NavController ) {
    this.id = this.params.get('id');
    this.expensesList = this.params.get('expensesList');
    this.default_placeholder = 'Expenses #' + this.params.get('runningId');

    if(this.id == '-1'){
        this.expenses = {name: '', amount: '', freq: ''};
        this.pageName = "Add expenses";
        this.expenses.freq = 0;
    }
    else{
        let index = this.findIndex(this.id);

        this.expenses = this.expensesList[index];
        this.pageName = "Edit expenses";
    }
}

findIndex(find_id){
    for (var i = 0, len = this.expensesList.length; i < len; i++) {
        if (this.expensesList[i].id == find_id){
            return i;
        }
    }
    return -1;
}

submitForm() {
    var name = this.default_placeholder;

    if (this.expenses.name.trim() != "") name = this.expenses.name.trim(); 

    var changes = {
                    'id': this.expenses.id,
                    'name':name,
                    'amount': Number(this.expenses.amount),
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
                this.expensesList[index] = changes;
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
