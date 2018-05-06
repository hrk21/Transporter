import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PackagedetailPage } from '../packagedetail/packagedetail';
import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ActionSheetController, AlertController, App, LoadingController, Platform, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';

declare var google: any;
declare var MarkerClusterer: any;
/**
 * Generated class for the EnroutePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-enroute',
  templateUrl: 'enroute.html',
})
export class EnroutePage {

  ionViewDidLoad() {
    console.log('ionViewDidLoad EnroutePage');
  }

  openPackageDetailsPage(i: any) {
    this.navCtrl.push(PackagedetailPage, this.responseDataEnroute[i]);
  }
  @ViewChild('mapEnroute') mapElement: ElementRef;

  @ViewChild('searchbar', { read: ElementRef }) searchbar: ElementRef;
  addressElement: HTMLInputElement = null;
  @ViewChild('searchbar1', { read: ElementRef }) searchbar1: ElementRef;
  addressElement1: HTMLInputElement = null;
  Source: any = null;
  Destination: any = null;
  MyLocation: any;
  responseDataEnroute = [];
  listSearch: string = '';

  map: any;
  marker: any;
  loading: any;
  search: boolean = false;
  error: any;
  switch: string = "map";
  rad: any;
  regionals: any = [];
  currentregional: any;

  constructor(
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public app: App,
    public navCtrl: NavController,
    public zone: NgZone,
    public platform: Platform,
    public alertCtrl: AlertController,
    public storage: Storage,
    public actionSheetCtrl: ActionSheetController,
    public geolocation: Geolocation,
    public http: Http,
  ) {
    this.platform.ready().then(() => this.loadMaps());

  }



  loadMaps() {
    if (!!google) {
      this.initializeMap();
      this.initAutocomplete();
    } else {
      this.errorAlert('Error', 'Something went wrong with the Internet Connection. Please check your Internet.')
    }
  }

  errorAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: data => {
            this.loadMaps();
          }
        }
      ]
    });
    alert.present();
  }

  mapsSearchBar(ev: any) {
    // set input to the value of the searchbar
    //this.search = ev.target.value;
    //    console.log(ev);
    const autocomplete = new google.maps.places.Autocomplete(ev);
    autocomplete.bindTo('bounds', this.map);
    return new Observable((sub: any) => {
      google.maps.event.addListener(autocomplete, 'place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          sub.error({
            message: 'Autocomplete returned place with no geometry'
          });
        } else {
          sub.next(place.geometry.location);
          sub.complete();
        }
      });
    });
  }

  initAutocomplete(): void {

    this.addressElement1 = this.searchbar1.nativeElement.querySelector('.searchbar-input');
    this.createAutocomplete(this.addressElement1).subscribe((location) => {
      console.log('First Search', location);
      this.Source = new google.maps.LatLng(location.lat(), location.lng());
      let options = {
        center: location,
        zoom: 13
      };
      this.map.setOptions(options);
      this.addMarker(location, "Searched");

    });




    this.addressElement = this.searchbar.nativeElement.querySelector('.searchbar-input');
    this.createAutocomplete(this.addressElement).subscribe((location) => {
      console.log('Second Search', location);
      this.Destination = new google.maps.LatLng(location.lat(), location.lng());
      let options = {
        center: location,
        zoom: 13
      };
      this.map.setOptions(options);
      this.addMarker(location, "Searched");
    });
  }

  findPath() {
    let directionsService = new google.maps.DirectionsService;
    let directionsDisplay = new google.maps.DirectionsRenderer;
    this.loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Reloading...',
    });
    this.map = new google.maps.Map(document.getElementById('mapEnroute'), {
      zoom: 9,
      center: { lat: 31.4826352, lng: 74.0712721 }
    });
    directionsDisplay.setMap(this.map);
    directionsService.route({
      origin: this.Source,
      destination: this.Destination,
      travelMode: 'DRIVING'
    }, function (response, status) {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
    let cityCircle1 = new google.maps.Circle({
      strokeColor: '#033860',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#2a4255',
      fillOpacity: 0.35,
      map: this.map,
      center: this.Destination,
      radius: 2000,
    });
    let cityCircle2 = new google.maps.Circle({
      strokeColor: '#033860',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#2a4255',
      fillOpacity: 0.35,
      map: this.map,
      center: this.Source,
      radius: 2000,
    });

    //this.loading.present();
    this.rad = 2000;
    let Src = JSON.parse(JSON.stringify(this.Source));
    let Des = JSON.parse(JSON.stringify(this.Destination));
    let SourceLat = Src["lat"];
    let SourceLng = Src["lng"];
    let DestinationLat = Des["lat"];
    let DestinationLng = Des["lng"];
    this.responseDataEnroute = [];
    this.http.get('http://localhost:5000/enroutepackages?SourceLat=' + SourceLat + '&SourceLng=' + SourceLng +
      '&DestinationLat=' + DestinationLat + '&DestinationLng=' + DestinationLng + '&Radius=' + this.rad).map(res => res.json()).subscribe(response => {
        response.content.map(item => {
          this.responseDataEnroute.push(item);
          let myPos = new google.maps.LatLng(Number(item['SourceLatitude']), Number(item['SourceLongitude']));
          this.addPackageMarker(myPos, this.responseDataEnroute.indexOf(item), item['PackageName']);
        });
      },
        err => {
          console.log('error');
        });
    //this.loading.dismiss();
  }

  createAutocomplete(addressEl: HTMLInputElement): Observable<any> {


    const autocomplete = new google.maps.places.Autocomplete(addressEl);
    autocomplete.bindTo('bounds', this.map);
    return new Observable((sub: any) => {
      google.maps.event.addListener(autocomplete, 'place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          sub.error({
            message: 'Autocomplete returned place with no geometry'
          });
        } else {
          //console.log('Search', place.geometry.locat;
          console.log('Search Lat', place.geometry.location.lat());
          console.log('Search Lng', place.geometry.location.lng());
          sub.next(place.geometry.location);
          //sub.complete();
        }
      });
    });
  }

  initializeMap() {
    this.zone.run(() => {
      var mapEle = this.mapElement.nativeElement;
      this.map = new google.maps.Map(mapEle, {
        zoom: 12,
        center: { lat: 31.4826352, lng: 74.0712721 },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        // styles: [{ "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#dedede" }, { "lightness": 21 }] }, { "elementType": "labels.text.stroke", "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }] }, { "elementType": "labels.text.fill", "stylers": [{ "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 }] }, { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#f2f2f2" }, { "lightness": 19 }] }, { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#fefefe" }, { "lightness": 20 }] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#fefefe" }, { "lightness": 17 }, { "weight": 1.2 }] }],
        disableDoubleClickZoom: false,
        disableDefaultUI: true,
        zoomControl: true,
        scaleControl: true,
      });
      this.getCurrentPosition();

    });
  }

  //Center zoom
  //http://stackoverflow.com/questions/19304574/center-set-zoom-of-map-to-cover-all-visible-markers
  // bounceMap(markers) {
  //   let bounds = new google.maps.LatLngBounds();

  //   for (var i = 0; i < markers.length; i++) {
  //     bounds.extend(markers[i].getPosition());
  //   }

  //   this.map.fitBounds(bounds);
  // }

  // resizeMap() {
  //   setTimeout(() => {
  //     google.maps.event.trigger(this.map, 'resize');
  //   }, 200);
  // }

  /*
    getCurrentPositionfromStorage(markers) {
      this.storage.get('lastLocation').then((result) => {
        if (result) {
          let myPos = new google.maps.LatLng(result.lat, result.long);
          this.map.setOptions({
            center: myPos,
            zoom: 16
          });
          let marker = this.addMarker(myPos, "My last saved Location: " + result.location);
  
          markers.push(marker);
          this.bounceMap(markers);
  
          this.resizeMap();
        }
      });
    }
  */

  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  // go show currrent location
  getCurrentPosition() {
    this.loading = this.loadingCtrl.create({
      content: 'Searching Location ...'
    });
    //this.loading.present();

    let locationOptions = { timeout: 10000 };
    this.geolocation.getCurrentPosition(locationOptions).then(
      (position) => {
        console.log(position.coords.latitude, position.coords.longitude);
        let myPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        let options = {
          center: myPos,
          zoom: 12

        };
        this.map.setOptions(options);
        this.addMarker(myPos, "I am Here!");
        //this.loading.dismiss();
      }),
      (error) => {
        //     this.loading.dismiss().then(() => {
        //     this.showToast('Location not found. Please enable your GPS!');
        //     this.loading.dismiss();
        //     console.log(error);
        //   });
        console.log(error);
      }

  }

  // toggleSearch() {
  //   if (this.search) {
  //     this.search = false;
  //   } else {
  //     this.search = true;
  //   }
  // }

  addMarker(position, content) {
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: position
    });

    this.addInfoWindow(marker, content);
    return marker;
  }

  addInfoWindow(marker, content) {
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);

    });
  }
  viewPlace(id) {
    console.log('Clicked Marker', id);
  }

  addPackageMarker(position, index, content) {
    let image = "assets/icon/package.png";
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: position,
      title: "hello",
      icon: image,
    });
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });
    infoWindow.open(this.map, marker);

    this.addPackageMarkerEvent(marker, index);
    return marker;
  }
  addPackageMarkerEvent(marker, index) {

    google.maps.event.addListener(marker, 'click', () => {

      this.openPackageDetailsPage(index);
    });
  }

}
