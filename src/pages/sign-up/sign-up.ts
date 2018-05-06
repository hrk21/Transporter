import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ToastController, Platform, LoadingController, Loading } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, AbstractControl, } from '@angular/forms';
import { File } from '@ionic-native/file';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import { HomePage } from '../home/home';
declare var cordova: any;
import { FCM } from '@ionic-native/fcm';
/**
 * Generated class for the SignUpPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html',
})
export class SignUpPage {
  id: number;
  loading: Loading;
  lastImage1: string = null;
  lastImage2: string = null;
  lastImage3: string = null;
  submitAttempted: Boolean;
  data: FormGroup;
  Name: AbstractControl;
  Email: AbstractControl;
  CNIC: AbstractControl;
  Phone: AbstractControl;
  Address: AbstractControl;
  CarRegistrationNo: AbstractControl;
  Password: AbstractControl;
  Date: AbstractControl;
  Month: AbstractControl;
  Year: AbstractControl;
  Gender: AbstractControl;
  Token: any;
  constructor(public navCtrl: NavController,
    private camera: Camera,
    private transfer: FileTransfer,
    private file: File,
    private filePath: FilePath,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public platform: Platform,
    public loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController,
    public http: Http,
    public storage: Storage,
    private fcm: FCM) {
      //formbuilder used for error checking and validation of data at client side
    this.data = this.formBuilder.group({
      lastImage1: ['', Validators.required],
      lastImage2: ['', Validators.required],
      lastImage3: ['', Validators.required],
      Name: ['', Validators.required],
      Email: ['', Validators.compose([Validators.required, Validators.email])],
      CNIC: ['', Validators.compose([Validators.required, Validators.pattern('^[0-9+]{5}-[0-9+]{7}-[0-9]{1}$')])],
      Phone: ['', Validators.compose([Validators.required, Validators.pattern('03[0-9]{9}$')])],
      Address: ['', Validators.required],
      CarRegistrationNo: ['', Validators.compose([Validators.required, Validators.pattern('^[A-Z]{3}(( ([0]{1}[7-9]{1}|[1]{1}[0-9]{1})[A,B]{0,1} | ))[0-9]{1,4}$')])],
      Password: ['', Validators.compose([Validators.required, Validators.pattern('^.{6,15}$')])],
      Date: ['date', Validators.compose([Validators.required, Validators.pattern('^((?!date).)*$')])],
      Month: ['month', Validators.compose([Validators.required, Validators.pattern('^((?!month).)*$')])],
      Year: ['year', Validators.compose([Validators.required, Validators.pattern('^((?!year).)*$')])],
      Gender: ['gender', Validators.compose([Validators.required, Validators.pattern('^((?!gender).)*$')])],
    });
    //bind the variables to input elements in the form making error checking and data access easier
    this.Name = this.data.controls['Name'];
    this.Email = this.data.controls['Email'];
    this.CNIC = this.data.controls['CNIC'];
    this.Phone = this.data.controls['Phone'];
    this.Address = this.data.controls['Address'];
    this.CarRegistrationNo = this.data.controls['CarRegistrationNo'];
    this.Password = this.data.controls['Password'];
    this.submitAttempted = false;
    this.Date = this.data.controls['Date'];
    this.Month = this.data.controls['Month'];
    this.Year = this.data.controls['Year'];
    this.Gender = this.data.controls['Gender'];
  }

  logForm() {//fucntion called when user tries to register with the server
    this.submitAttempted = true;//set true for error checking after user has entered all information
    //error checking for all fields in the signup form
    if (this.Name.hasError('required')) {
      this.presentErrorAlert("Some values have been entered Incorectyl");
      return;
    }
    else if (this.Email.hasError('required') || this.Email.hasError('email')) {
      console.log("Email error");
      this.presentErrorAlert("Some values have been entered Incorectyl");
      return;
    }
    else if (this.CNIC.hasError('required') || this.CNIC.hasError('pattern')) {
      console.log("CNIC error");
      this.presentErrorAlert("Some values have been entered Incorectyl");
      return;
    }
    else if (this.Phone.hasError('required') || this.Phone.hasError('pattern')) {
      console.log("Phone number error");
      this.presentErrorAlert("Some values have been entered Incorectyl");
      return;
    }
    else if (this.CarRegistrationNo.hasError('required') || this.CarRegistrationNo.hasError('pattern')) {
      console.log("Car registration error");
      this.presentErrorAlert("Some values have been entered Incorectyl");
      return;
    }
    else if (this.Password.hasError('required') || this.Password.hasError('pattern')) {
      console.log("Passworderror");
      this.presentErrorAlert("Some values have been entered Incorectyl");
      return;
    }
    else if (this.Date.hasError('required') || this.Month.hasError('required') || this.Year.hasError('required')) {
      console.log(" Date Month Year error");
      this.presentErrorAlert("Some values have been entered Incorectyl");
      return;
    }
    else if (this.Gender.hasError('required')) {
      console.log("Gender error");
      this.presentErrorAlert("Some values have been entered Incorectyl");
      return;
    }
    this.loading = this.loadingCtrl.create({
      content: 'Creating Profile...',
    });
    this.loading.present();//show loading that request has been sent and response is bieng awaited for


    // this.fcm.getToken().then(token=>{
    //   this.Token=token;
    // })
    let Userdata = {
      'ID': 0,
      'Name': this.Name.value,
      'Email': this.Email.value,
      'CNIC': this.CNIC.value,
      'Phone': this.Phone.value,
      'Address': this.Address.value,
      'CarRegistrationNo': this.CarRegistrationNo.value,
      'Password': this.Password.value,
      'Date': this.Date.value,
      'Month': this.Month.value,
      'Year': this.Year.value,
      'Gender': this.Gender.value,
      'Clearence Due': 0,
      'Rating': 0,
      'ActivePackages': 0,
      'CancelledPackages': 0.0,
      //'Token':this.Token,
    };

    this.http.post('http://localhost:5000/signup', JSON.stringify(Userdata)).map(res => res.json()).subscribe(data => {
      let responseData = data;
      console.log(responseData.Error);
      this.loading.dismissAll();
      if (responseData.Error != "none") {
        this.presentErrorAlert(responseData.Error);
      }
      else {//if account creation successfull store these value in local storage as they will be required by the application
        this.storage.set('Name', this.Name.value);
        this.storage.set('Email', this.Email.value);
        this.storage.set('Password', this.Password.value)
        this.storage.set('ID', this.id);
        this.storage.set('Rating', 0);
        this.openPage(HomePage);
      }
    },
      err => {
        console.log('error');
      });




    /*  if(this.lastImage1 ==null){
        let alert = this.alertCtrl.create({
          title: 'Profile Image Missing',
          subTitle: 'Please upload the required image',
          buttons: ['Dismiss']
        });
        
        alert.present();            
        return;
      }
  
      if( this.lastImage2==null){
        let alert = this.alertCtrl.create({
          title: 'Liscence Image Missing',
          subTitle: 'Please upload the required image',
          buttons: ['Dismiss']  
        });
        alert.present();
        return;
      }
      if( this.lastImage3==null){
        let alert = this.alertCtrl.create({
          title: 'Vehicle Registration Image Missing',
          subTitle: 'Please upload all required image',
          buttons: ['Dismiss']
        });
        alert.present();
        return;
      }
      //ALL things are now set just need to send data to the back end check for valid!!!/
      */
  }
  openPage(page) {//if account creation successfull open the home page
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.navCtrl.setRoot(page);
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad SignUpPage');
  }


  //________________________________________________________CODE FOR CAMERA PHOTOES____________________________________
  public presentActionSheet(id) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY, id);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA, id);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }
  public takePicture(sourceType, id) {
    // Create options for the Camera Dialog
    var options = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    // Get the data of an image
    this.camera.getPicture(options).then((imagePath) => {
      // Special handling for Android library
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName(), id);
          });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName(), id);
      }
    }, (err) => {
      this.presentErrorAlert('Error while selecting image.');
    });
  }

  private createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }
  // Copy the image to a local folder
  private copyFileToLocalDir(namePath, currentName, newFileName, id) {
    this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
      switch (id) {
        case 1:
          this.lastImage1 = newFileName;
          break;
        case 2:
          this.lastImage2 = newFileName;
          break;
        case 3:
          this.lastImage3 = newFileName;
          break;
      }
    }, error => {
      this.presentErrorAlert('Error while storing file.');
    });
  }

  presentErrorAlert(text) {
    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: text,
      buttons: ['Dismiss']
    });
    alert.present();
  }
  // Always get the accurate path to your apps folder
  public pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return cordova.file.dataDirectory + img;
    }
  }
  imageupload() {

  }
  //__________________________________________________________________________________________________________________

  //upload images to server
  public uploadImage(image) {
    // Destination URL
    var url = "http://localhost:5000/signup";
    // File for Upload
    var targetPath = this.pathForImage(image);
    // File name only
    var filename = image;

    var options = {
      fileKey: "file",
      fileName: filename,
      chunkedMode: false,
      mimeType: "multipart/form-data",
      params: { 'fileName': filename }
    };

    const fileTransfer: FileTransferObject = this.transfer.create();

    this.loading = this.loadingCtrl.create({
      content: 'Uploading...',
    });
    this.loading.present();

    // Use the FileTransfer to upload the image
    fileTransfer.upload(targetPath, url, options).then(data => {
      this.loading.dismissAll()
      this.presentErrorAlert('Image succesful uploaded.');
    }, err => {
      this.loading.dismissAll()
      this.presentErrorAlert('Error while uploading file.');
    });
  }

}
