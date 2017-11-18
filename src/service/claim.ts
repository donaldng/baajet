import {Injectable} from "@angular/core";

@Injectable()
export class ClaimService {
    constructor() {

    }

    claimExpenses(expenses, price){
        let index = this.findIndex(expenses.id);

        // Validate
        if (price > expenses.amount){
            alert('You cannot claim more than your reserved fund, my good sir!');
            return;
        }
        else if (price < 0){
            alert('I cannot process negative number, baaaaa...');
            return;
        }

        // Remove amount from claim
        expenses.amount = expenses.amount - price;
        this.expensesList[index] = expenses;

        let tmpImage = 0;
        if (typeof expenses.tmpImage != 'undefined') tmpImage = expenses.tmpImage;

        let thumbnail = 0;
        if (typeof expenses.thumbnail != 'undefined') thumbnail = expenses.thumbnail;

        // Add new expenses
        var newExpenses = {
            'id': Math.round((new Date()).getTime() / 1000),
            'name': expenses.name,
            'amount': Number(price),
            'freq': 0,
            'freq_start': new Date().toISOString().slice(0, 19).replace('T',' '),
            'freq_end': new Date().toISOString().slice(0, 19).replace('T',' '),
            'datetime': new Date().toISOString().slice(0, 19).replace('T',' '),
            'image': tmpImage,
            'thumbnail': thumbnail,
            'todays': true
        };
        this.expensesList.push(newExpenses);

        // Delete claim if depleted
        if (expenses.amount <= 0){
            let index = this.expensesList.indexOf(expenses);
            this.expensesList.splice(index,1);
        }

        this.events.publish('reload:home','expensesList',this.expensesList);
        this.events.publish('change_segment', newExpenses.freq);
        this.storage.set('expensesList', this.expensesList);
        this.events.publish('reload:expenses', this.expensesList);
    }

    findIndex(find_id){
        for (var i = 0, len = this.expensesList.length; i < len; i++) {
            if (this.expensesList[i].id == find_id){
                return i;
            }
        }
        return -1;
    }
}
