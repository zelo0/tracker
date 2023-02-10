import { database } from 'firebase.config.js';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, DocumentData } from 'firebase/firestore';
import { ProductForm } from './types';


// collections
const productsRef = collection(database, 'product');


// functions
export function addProduct(data: ProductForm) {
  return addDoc(productsRef, {
    ...data, 
    updatedTime: serverTimestamp()
  });
}


export function readRecentFiveProducts() {
  try {
    const q = query(productsRef, orderBy("updatedTime", "desc"), limit(5));
    return getDocs(q)
      .then(data => {
        return data.docs.map((doc: DocumentData) => Object.assign({
          id: doc.id,
          ...doc.data(),
        }, {
          updatedTime: doc.data().updatedTime.toDate().toLocaleDateString(),
        }));
      });
  } catch(e) {
    console.error(e);
  }
}

