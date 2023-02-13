import { database } from 'firebase.config.js';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, DocumentData, doc, collectionGroup, getDoc, runTransaction } from 'firebase/firestore';
import { PriceForm, PriceUpload, ProductForm, ProductUplaod, ProductUploads, StatisticUpload } from './types';
import type { DefaultSession } from 'next-auth'
import { randomUUID } from 'crypto';


// collections
const productsRef = collection(database, 'products');

// functions
export async function addProduct(data: ProductForm, user: DefaultSession["user"]) {
  return addDoc(productsRef, {
    ...data, 
    user,
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

export async function getRecentFivePrices() {
  try {
    const pricesCollections = collectionGroup(database, 'prices');
    const q = query(pricesCollections, orderBy('date', 'desc'), limit(5));
    const data = await getDocs(q);
    return await Promise.all(
      data.docs.map(async (document: DocumentData) => {
        const productDocRef = doc(database, 'products', document.data().goodId);
        const productDoc = await getDoc(productDocRef);
        if (!productDoc.exists()) {
          return null;
        } 
        return {
          id: document.id,
          goodName: productDoc.data().goodName,
          entpId: document.data().entpId,
          goodId: document.data().goodId,
          goodPrice: document.data().goodPrice,
          date: document.data().date.toDate().toLocaleDateString(),
        };
      })
    );

  } catch(e) {
    console.error(e);
  }
}

// 그 날짜의 통계 같이 업데이트
export async function addPrice(data: PriceForm, user: DefaultSession["user"]) {
  const today = new Date();
  const statDoc = doc(database, `products/${data.goodId}/statistics`, today.toUTCString());
  const priceDoc = doc(database, `products/${data.goodId}/prices`, randomUUID());

  await runTransaction(database, async (transaction) => {
    // 가격 통계 업데이트
    const statSnap = await transaction.get(statDoc);
    let minPrice = data.goodPrice;
    let maxPrice = data.goodPrice; 
    if (statSnap.exists()) {
      minPrice = Math.min(statSnap.data().minPrice, data.goodPrice);
      maxPrice = Math.max(statSnap.data().maxPrice, data.goodPrice);
    }

    transaction.set(statDoc, {
      goodId: data.goodId,
      date: today,
      minPrice,
      maxPrice
    } as StatisticUpload)

    // 가격 데이터 추가 
    transaction.set(priceDoc, {
      ...data,
      date: today,
    } as PriceUpload);

  }).catch((e) => console.error(e));
}