import { api, LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';

// imports
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
    @api boatTypeId;
    mapMarkers = [];
    isLoading = true;
    isRendered = false;
    @api latitude;
    @api longitude;
    
    // Add the wired method from the Apex Class
    // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
    // Handle the result and calls createMapMarkers
    @wire(getBoatsByLocation,{latitude:'$latitude', longitude:'$longitude', boatTypeId:'$boatTypeId'})
    wiredBoatsJSON({error, data}) {
        if(data){
            this.createMapMarkers(data);
            this.isLoading = false;
        }
        if(error){
            const event = new ShowToastEvent({
                title: ERROR_TITLE,
                message: 'Error loading the component. Check for your internet connexion and permissions and try again !',
                variant: ERROR_VARIANT
            });
            this.dispatchEvent(event);
        }
    }
    
    // Controls the isRendered property
    // Calls getLocationFromBrowser()
    renderedCallback() {
        if(!this.isRendered){
            this.getLocationFromBrowser();
            this.isRendered = true;
        }
    }
    
    // Gets the location from the Browser
    // position => {latitude and longitude}
    getLocationFromBrowser() {
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(position => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
            })
        }
    }
    
    // Creates the map markers
    createMapMarkers(boatData) {
        const newMarkers = boatData.map(boat => {
            return {
                location: {
                    Latitude: boat.Geolocation__Latitude__s,
                    Longitude: boat.Geolocation__Longitude__s
                },
                title : boat.Name
            }
        });
        newMarkers.unshift({
            location: {
                Latitude: this.latitude,
                Longitude: this.longitude
            },
            title : LABEL_YOU_ARE_HERE,
            icon: ICON_STANDARD_USER
        });
        this.mapMarkers = newMarkers;
        this.isLoading = false;
    }
}