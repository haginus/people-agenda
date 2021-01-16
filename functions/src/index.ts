import * as functions from 'firebase-functions';
import * as firebase from 'firebase-admin';

firebase.initializeApp();

export const updateCategoryCount = functions.firestore.document("people/{personId}").onWrite((change, context) => {
    const oldData = change.before.data();
    const newData = change.after.data();
    const db = firebase.firestore();
    const increment = firebase.firestore.FieldValue.increment(1);
    const decrement = firebase.firestore.FieldValue.increment(-1);
    const batch = db.batch();
    let toIncrement : string[] = [];
    let toDecrement : string[] = [];
    if(oldData === undefined && newData !== undefined) { // create
        toIncrement = newData.categoryId;
    } else if(newData === undefined && oldData !== undefined) { // delete
        toDecrement = oldData.categoryId;
    } else if(newData !== undefined && oldData !== undefined) { // edit
        toIncrement = (newData.categoryId as string[]).filter(cat => !oldData.categoryId.includes(cat)); // find categories that are not in old data
        toDecrement = (oldData.categoryId as string[]).filter(cat => !newData.categoryId.includes(cat)); // find old data categories that are not in new data
    }
    toIncrement.forEach(categoryId => {
        const ref = db.doc("categories/" + categoryId);
        batch.update(ref, { peopleCount: increment });
    });
    toDecrement.forEach(categoryId => {
        const ref = db.doc("categories/" + categoryId);
        batch.update(ref, { peopleCount: decrement });
    });
    return batch.commit();
});
