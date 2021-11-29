import { LightningElement, wire } from 'lwc';
import { reduceErrors } from 'c/ldsUtils';
import FIRSTNAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LASTNAME_FIELD from '@salesforce/schema/Contact.LastName';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import getContacts from '@salesforce/apex/ContactController.getContacts';
const COLUMNS = [
    { label: 'First Name', fieldName: FIRSTNAME_FIELD.fieldApiName, type: 'text' },
    { label: 'Last Name', fieldName: LASTNAME_FIELD.fieldApiName, type: 'currency' },
    { label: 'Emal', fieldName: EMAIL_FIELD.fieldApiName, type: 'text' }
];

export default class ContactList extends LightningElement {
    colomns = COLUMNS;
    contacts = [];
    errors;
    @wire(getContacts)
    wiredContacts({data, error}){
        if(error){
            this.errors = reduceErrors(error);
        }
        else{
            this.contacts = data;
        }
    }

    get errors(){
        return reduceErrors(this.errors);
    }
}