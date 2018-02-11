import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { environment } from '../environments/environment.production';

@Injectable()
export class FirebaseService {

    constructor() {
        firebase.initializeApp(environment.firebase);
    }

    getAll(callback) {
        let userId = 1;

        firebase.database().ref('/userdata/' + userId).on("value", (snapshot) => {
            callback(null, snapshot);
        }, function (error) {
            callback(error);
        });;
    }

    get(keyName: string, callback) {
        let userId = 1;
        
        firebase.database().ref('/userdata/' + userId +  "/" + keyName).on("value", (snapshot) => {
            callback(null, snapshot);
        }, function (error) {
            callback(error);
        });;
    }

    set(keyName: string, value) {
        if (value){
            let userId = 1;

            var data = {};
            data['/userdata/' + userId + '/' + keyName] = value;
            firebase.database().ref().update(data);
            
        }
    }

}
