import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { NavController, Platform, ToastController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Events } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';

declare var cordova: any;

@Component({
    selector: 'page-manage',
    templateUrl: 'manage.html',
})

export class ManagePage {
    expensesList;
    expenses;
    pageName;
    selected_id;
    default_placeholder;
    freq;
    tripStart;
    tripEnd;
    selected_freq;
    tmpImage;
    lastImage;

    constructor( public params: NavParams, public viewCtrl: ViewController, public storage: Storage, public navCtrl: NavController, private camera: Camera, public events: Events, public toastCtrl: ToastController, public platform: Platform, private file: File, private filePath: FilePath) {
        this.selected_id = this.params.get('selected_id');
        this.expensesList = this.params.get('expensesList');
        
        this.default_placeholder = 'Expenses #';

        this.tmpImage = 0;
        this.selected_freq = 0;

        this.storage.get('duration').then((v) => {
            if (v){
                var duration = v.split(" ~ ");
                this.tripStart = duration[0];
                this.tripEnd = duration[1];
            }
            else{
                this.tripStart = new Date().toISOString().slice(0, 19);
                var tripEnd = new Date();
                tripEnd.setDate(tripEnd.getDate() + 7);
                this.tripEnd = tripEnd.toISOString().slice(0, 19);
            }

            if (this.selected_id == '-1'){
                this.expenses.freq_start = this.tripStart;
                this.expenses.freq_end = this.tripEnd;            
            }
        });

        if(this.selected_id == '-1'){
            this.expenses = {name: '', amount: '', freq: ''};
            this.pageName = "Add expenses";
            this.expenses.freq = 0;
        }

        if(this.selected_id != '-1'){
            let index = this.findIndex(this.selected_id);

            this.expenses = this.expensesList[index];
            this.selected_freq = this.expenses.freq;
            this.tmpImage = this.expenses.image;
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
    chooseImage(){
            var options = {
                sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
                destinationType: this.camera.DestinationType.FILE_URI
            };
            this.camera.getPicture(options).then((imagePath) => {
                alert(imagePath);
                if (this.platform.is('android')) {
                    this.filePath.resolveNativePath(imagePath)
                    .then(filePath => {
                        let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
                        let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
                        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
                        alert('123');
                    });
                } else {
                    var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
                    var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
                    this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
                    alert('456');
                }

                this.tmpImage = this.pathForImage(this.lastImage);
                alert(this.tmpImage);
            }, (err) => {
            });
    }
    private createFileName() {
        var d = new Date(),
        n = d.getTime(),
        newFileName =  n + ".png";
        alert('createFIleName',newFileName);
        return newFileName;
    }

    private presentToast(text) {
        let toast = this.toastCtrl.create({
            message: text,
            duration: 3000,
            position: 'top'
        });
        toast.present();
    }

    // Always get the accurate path to your apps folder
    public pathForImage(img) {
        if (img === null) {
            return '';
        } else {
            alert('pathForImage',cordova.file.dataDirectory + img);

            return cordova.file.dataDirectory + img;
        }
    }

    private copyFileToLocalDir(namePath, currentName, newFileName) {
        this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
            alert('copyFileToLocalDir', newFileName);
            this.lastImage = newFileName;
        }, error => {
            this.presentToast('Error while storing file.');
        });
    }

    captureImage(){
        const options: CameraOptions = {
            quality: 100,
            targetWidth: 1000,
            targetHeight: 1000,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.PNG,
            mediaType: this.camera.MediaType.PICTURE,
            correctOrientation: true
        }

        this.camera.getPicture(options).then((imageData) => {
            // imageData is either a base64 encoded string or a file URI
            // If it's base64:
            this.tmpImage = 'data:image/jpeg;base64,' + imageData;
        }, (err) => {
            // Handle error
        });

    }

    submitForm() {
        var name = this.default_placeholder;

        if (this.expenses.name.trim() != "") name = this.expenses.name.trim(); 
        if (this.expenses.freq_start.trim()  == "") this.expenses.freq_start = new Date().toISOString().slice(0, 19).replace('T',' ');
        if (this.expenses.freq_end.trim()  == "") this.expenses.freq_end = new Date().toISOString().slice(0, 19).replace('T',' ');

        var changes = {
            'id': this.expenses.id,
            'name':name,
            'amount': Number(this.expenses.amount),
            'freq': this.expenses.freq,
            'freq_start': this.expenses.freq_start,
            'freq_end': this.expenses.freq_end,
            'datetime': this.expenses.datetime,
            'image': this.tmpImage
        };

        if (this.selected_id == "-1"){
            changes['id'] = Math.round((new Date()).getTime() / 1000);
            changes['datetime'] = new Date().toISOString().slice(0, 19).replace('T',' ');
            if (this.expensesList)
                this.expensesList.push(changes);
            else
                this.expensesList = [changes];
        }
        else{
            let index = this.findIndex(this.selected_id);
            this.expensesList[index] = changes;
        }

        this.storage.set('expensesList', this.expensesList);
        this.events.publish('reload:expenses', this.expensesList);

        this.dismiss();              
    }
    
    removeImage(){
        this.tmpImage = 0;
    }

    onSelectChange(selectedValue: any){
        this.selected_freq = selectedValue;
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}
