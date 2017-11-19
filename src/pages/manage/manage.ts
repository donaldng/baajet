import { Component } from '@angular/core';
import { NavParams, ViewController, ActionSheetController, MenuController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { NavController, Platform, ToastController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Events } from 'ionic-angular';
import { ImageViewerController } from 'ionic-img-viewer';
import { ImageService } from '../../service/image';

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
    thumbnail;
    saveimageFlag = false;
    editFlag = false;
    camOn = false;
    todays_b;
    init_price;
    expenses_cat;
    _imageViewerCtrl: ImageViewerController;
    enablePhotoFlag;
    imageList;
    selected_tn;

    constructor(public menuCtrl: MenuController, public imgLib: ImageService, imageViewerCtrl: ImageViewerController, public actionSheetCtrl: ActionSheetController, public params: NavParams, public viewCtrl: ViewController, public storage: Storage, public navCtrl: NavController, private camera: Camera, public events: Events, public toastCtrl: ToastController, public platform: Platform) {
        this._imageViewerCtrl = imageViewerCtrl;
        this.enablePhotoFlag = 0;
        this.selected_tn = 0;
        this.selected_id = this.params.get('selected_id');
        this.expensesList = this.params.get('expensesList');
        this.camOn = this.params.get('camOn');
        this.init_price = this.params.get('init_price');
        if (this.camOn) this.captureImage();
        this.default_placeholder = 'Expenses #';

        this.tmpImage = 0;
        this.selected_freq = 0;

        this.set_todays_b();

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
            this.expenses = {name: 'General', amount: '', freq: 0};
            if (this.init_price) this.expenses.amount = this.init_price;
            this.pageName = "Add expenses";
            this.expenses.todays = true;
        }
        else{
            let index = this.findIndex(this.selected_id);

            this.expenses = this.expensesList[index];

            this.selected_freq = this.expenses.freq;
            this.tmpImage = this.expenses.image;
            this.pageName = "Manage expenses";
            if (this.selected_freq == 0){
                this.todays_b = this.expenses.freq_start.replace(" ", "T");
                var inputDate = new Date(this.todays_b);
                var todaysDate = new Date();
                this.expenses.todays = false;

                if(this.expenses.thumbnail){
                    this.selected_tn = this.expenses.thumbnail.slice(-5).charAt(0) - 1;
                }

                if(inputDate.setHours(0,0,0,0) == todaysDate.setHours(0,0,0,0)) {
                    this.expenses.todays = true;
                }
            }

        }

        this.storage.get('saveimageFlag').then((v) => {
            if(v) this.saveimageFlag = v;
        });    

        this.storage.get('editFlag').then((v) => {
            if(v) this.editFlag = v;
        });          

        this.storage.get('enablePhotoFlag').then((v) => {
            if(v) this.enablePhotoFlag = v;
        });   

        this.expenses_cat = ['General', 'Food', 'Transport', 'Shopping', 'Stay', 'Relax', 'Souvenir', 'Other'];        
        this.generateImageList(this.expenses.name);

    }

    openMenu() {
        this.menuCtrl.open();
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
                allowEdit: this.editFlag,
                destinationType: this.camera.DestinationType.DATA_URL
            };
            this.camera.getPicture(options).then((imagePath) => {              
                this.tmpImage = 'data:image/jpeg;base64,' + imagePath;
            }, (err) => {
            });
    }

    captureImage(){
        const options: CameraOptions = {
            quality: 100,
            targetWidth: 1000,
            targetHeight: 1000,
            saveToPhotoAlbum: this.saveimageFlag,
            allowEdit: this.editFlag,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.PNG,
            mediaType: this.camera.MediaType.PICTURE,
            correctOrientation: true
        }

        this.camera.getPicture(options).then((imageData) => {

            this.tmpImage = 'data:image/jpeg;base64,' + imageData;
        }, (err) => {
            // Handle error
        });

    }

    setThumbnail(img){
        this.thumbnail = 'data:image/jpeg;base64,' + img;
    }

    set_todays_b(){
        var todays_b = new Date();
        todays_b.setDate(todays_b.getDate() + 1);
        this.todays_b = todays_b.toISOString().slice(0, 19);
    }
    
    submitForm() {
        var name = this.default_placeholder;

        if (this.expenses.name.trim() != "") name = this.expenses.name.trim();

        if (this.expenses.freq_start.trim() == "") this.expenses.freq_start = new Date().toISOString().slice(0, 19).replace('T',' ');
        if (this.expenses.freq_end.trim() == "") this.expenses.freq_end = new Date().toISOString().slice(0, 19).replace('T',' ');
        
        if (this.expenses.freq == 0){
            if(this.expenses.todays){
                this.expenses.freq_start = new Date().toISOString().slice(0, 19).replace('T',' ');
                this.expenses.freq_end = new Date().toISOString().slice(0, 19).replace('T',' ');
            }
            else{
                this.expenses.freq_start = this.todays_b.replace('T',' ');
                this.expenses.freq_end = this.todays_b.replace('T',' ');
            }
        }

        var thumbnail = "assets/imgs/icons/"+name.toLowerCase()+"/" + name.toLowerCase() + "-" + (this.selected_tn + 1) + ".png";
        var image = 0;

        if(this.tmpImage && this.tmpImage!=0 && typeof this.tmpImage != 'undefined'){
            image = this.tmpImage;
        }

        var changes = {
            'id': this.expenses.id,
            'name':name,
            'amount': Number(this.expenses.amount),
            'freq': this.expenses.freq,
            'freq_start': this.expenses.freq_start,
            'freq_end': this.expenses.freq_end,
            'datetime': this.expenses.datetime,
            'image': image,
            'thumbnail': thumbnail,
            'todays': this.expenses.todays,
            'fromReserved': 0
        };

        if (this.selected_id == "-1"){
            changes['id'] = Math.round((new Date()).getTime() / 1000);
            changes['datetime'] = new Date().toISOString().slice(0, 19).replace('T',' ');
            if (this.expensesList)
                this.expensesList.push(changes);
            else
                this.expensesList = [changes];

            this.events.publish('change_segment', changes.freq);
        }
        else{
            let index = this.findIndex(this.selected_id);
            this.expensesList[index] = changes;
        }

        this.storage.set('expensesList', this.expensesList);
        this.events.publish('reload:expenses', this.expensesList);

        this.dismiss();              
    }
    
    deleteRecord(expenses){
        let index = this.expensesList.indexOf(expenses);
        this.expensesList.splice(index,1);
        this.storage.set('expensesList', this.expensesList);
        this.events.publish('reload:home','expensesList',this.expensesList);
        this.events.publish('reload:expenses',this.expensesList);
        this.events.publish('refreshSegment', expenses);

        this.dismiss();
    }

    removeImage(){
        this.tmpImage = 0;
    }

    onSelectChange(selectedValue: any){
        this.selected_freq = selectedValue;
    }

    imageOptions(myImage){
        const actionSheet = this.actionSheetCtrl.create({
            title: 'Action',
            buttons: [
            {
                text: 'View Photo',
                handler: () => {
                    const imageViewer = this._imageViewerCtrl.create(myImage);
                    imageViewer.present();                    
                }
            },
            {
                text: 'Remove Photo',
                handler: () => {
                    this.removeImage();
                }
            },
            {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                }
            }
            ]
        });

        actionSheet.present();
    }

    addMedia() {
        const actionSheet = this.actionSheetCtrl.create({
            title: 'Action',
            buttons: [
            {
                text: 'Take Photo',
                handler: () => {
                    this.captureImage();
                }
            },
            {
                text: 'Photo Gallery',
                handler: () => {
                    this.chooseImage();
                }
            },
            {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                }
            }
            ]
        });

        actionSheet.present();
    }

    generateImageList(name){
        this.imageList = this.imgLib.generateImageList(name);
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}
