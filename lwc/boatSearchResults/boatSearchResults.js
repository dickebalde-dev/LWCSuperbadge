import { api, LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';//subscribe, unsubscribe, APPLICATION_SCOPE, 
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { refreshApex } from '@salesforce/apex';
import BoatMap from 'c/boatMap';
import BoatMC from '@salesforce/messageChannel/BoatMessageChannel__c';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';
export default class BoatSearchResults extends LightningElement {
    @api selectedBoatId;
    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text', editable: true },
        { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
        { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
        { label: 'Description', fieldName: 'Description__c', type: 'text', editable: true },
    ];
    @api boatTypeId = '';
    @track draftValues = [];
    boats = {data:[]};
    rowOffset = 0;
    isLoading = false;
    
    // wired message context
    @wire(MessageContext)
    messageContext;
    // wired getBoats method 
    @wire(getBoats, {boatTypeId:'$boatTypeId'})
    wiredBoats(result) {
        if(result.data){
            this.boats = result;
        }
        if(result.error){
            const event = new ShowToastEvent({
                title: ERROR_TITLE,
                message: error.message,
                variant: SUCCESS_VARIANT
            });
            this.dispatchEvent(event);
        }
    }
    
    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api searchBoats(boatTypeId) {
        this.notifyLoading(true);
        this.boatTypeId = boatTypeId;
        this.notifyLoading(false);
    }
    
    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    @api async refresh() {
        this.notifyLoading(true);
        refreshApex(this.boats);
        this.notifyLoading(false);
        // getBoats({boatTypeId:'$boatTypeId'})
        // .then((result) => {
            
        //     // this.boats.data = result;
            
        // }).catch((err) => {
        //     const event = new ShowToastEvent({
        //         title: ERROR_TITLE,
        //         message: err.message,
        //         variant: ERROR_VARIANT
        //     });
        //     this.dispatchEvent(event);
        // });
    }
    
    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId);
    }
    
    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) { 
        // explicitly pass boatId to the parameter recordId
        publish(this.messageContext, BoatMC, { recordId : boatId });
    }
    
    // The handleSave method must save the changes in the Boat Editor
    // passing the updated fields from draftValues to the 
    // Apex method updateBoatList(Object data).
    // Show a toast message with the title
    // clear lightning-datatable draft values
    handleSave(event) {
        // notify loading
        const updatedFields = event.detail.draftValues;
        // Update the records via Apex
        updateBoatList({data: updatedFields})
        .then(() => {
            refreshApex(this.boats);
            const event = new ShowToastEvent({
                title: SUCCESS_TITLE,
                message: MESSAGE_SHIP_IT,
                variant: SUCCESS_VARIANT
            });
            this.dispatchEvent(event);
        })
        .catch(error => {
            const event = new ShowToastEvent({
                title: ERROR_TITLE,
                message: error.message,
                variant: ERROR_VARIANT
            });
            this.dispatchEvent(event);
        })
        .finally(() => {
            this.draftValues = [];
        });
    }
    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) {
        if(isLoading){
            this.isLoading = true;
            this.dispatchEvent(new CustomEvent('loading'));
        }
        else{
            this.dispatchEvent(CustomEvent('doneloading'));
            this.isLoading = false;
        }
    }
}