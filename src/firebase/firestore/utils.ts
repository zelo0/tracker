import { database } from 'firebase.config.js';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, DocumentData, doc, collectionGroup, getDoc, runTransaction, where, Query } from 'firebase/firestore';
import { PriceForm, PriceUpload, Product, ProductForm, ProductUplaod, ProductUploads, StatisticUpload } from './types';
import type { DefaultSession } from 'next-auth'


// collections
const productsRef = collection(database, 'products');

// functions
function guid() {
  function _s4() {
    return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
  }
  return _s4() + _s4() + '-' + _s4() + '-' + _s4() + '-' + _s4() + '-' + _s4() + _s4() + _s4();
}

/* TODO: name 중복 체크 */
export async function addProduct(data: ProductForm, user: DefaultSession["user"]) {
  if (!user) {
    return;
  }

  return addDoc(productsRef, {
    ...data, 
    userEmail: user.email,
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
          // entpId: document.data().entpId,
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
  if (!user) {
    return;
  }

  const today = new Date();
  const statDoc = doc(database, `products/${data.goodId}/statistics`, today.toLocaleDateString());
  /* TODO: uuid 안 쓰고 firestore 고유 id 받기 */
  const priceDoc = doc(database, `products/${data.goodId}/prices`, guid());

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
      maxPrice,
    } as StatisticUpload)


    let placeId;
    // form에 장소 정보가 존재하면
    if (data.place) {
      try {
        const placesRef = collection(database, "places");
        const q = query(placesRef, where("road_address_name", "==", data.place.road_address_name));
        const placeSnap = await getDocs(q);

        if (placeSnap.empty) {
        // 해당 장소가 등록되어 있지 않으면
          let uuid = guid();
          transaction.set(
            doc(database, `places/${uuid}`),
            {
              x: Number(data.place.x),
              y: Number(data.place.y),
              place_name: data.place.place_name,
              road_address_name: data.place.road_address_name,
            }
          );
          placeId = uuid;
        } else {
          placeId = placeSnap.docs[0].id;
        }
      } catch(e) {
        console.error(e);
      }
    }

    
    // 가격 데이터 추가 
    transaction.set(priceDoc, 
      data.place 
      ? 
      {
        goodId: data.goodId,
        goodPrice: data.goodPrice,
        review: data.review,
        placeId,
        date: today,
        userEmail: user.email,
      } as PriceUpload
      : 
      {
        goodId: data.goodId,
        goodPrice: data.goodPrice,
        review: data.review,
        date: today,
        userEmail: user.email,
      } as PriceUpload
    );

  });
}

export async function searchProduct(goodName: string) {
  try {
    const q = query(productsRef, where('goodName', '>=', goodName), where('goodName', '<=', `${goodName}\uf8ff`));
    return getDocs(q)
        .then(data => {
          if (!data) {
            return null;
          }
          return data.docs.map((doc: DocumentData) => ({
            id: doc.id,
            ...doc.data(),
          } as Product));
        });
  } catch(e) {
    console.error(e);
  }
}

export async function getMinMaxPriceBetweenRange(goodId: string, fromDate: Date, toDate: Date) {
  try {
    const statRef = collection(database, `products/${goodId}/statistics`);
    const q = query(statRef, where('date', '>=', fromDate), where('date', '<', toDate));
    return getDocs(q)
      .then(data => data.docs.reduce(
        (acc, cur) => ({               
          minPrice: Math.min(acc.minPrice, cur.data().minPrice),
          maxPrice: Math.max(acc.maxPrice, cur.data().maxPrice),
        }
      ),
        {
          minPrice: Infinity,
          maxPrice: 0,
        }
      ));
  } catch(e) {
    console.error(e);
  }
}

export async function getProductName(goodId: string) {
  try {
    const docRef = doc(database, `products/${goodId}`);
    const data = await getDoc(docRef);
    if (data.exists()) {
      return data.get('goodName');
    }
  } catch(e) {
    console.error(e);
  }
} 