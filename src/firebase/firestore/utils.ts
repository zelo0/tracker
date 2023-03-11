import { database } from 'firebase.config.js';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, DocumentData, doc, collectionGroup, getDoc, runTransaction, where, startAfter, QueryDocumentSnapshot } from 'firebase/firestore';
import { PlaceResponse, Price, PriceForm, PriceUpload, Product, ProductForm, ProductUplaod, ProductUploads, StatisticUpload } from './types';
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
      const placesRef = collection(database, "places");
      const q = query(placesRef, where("road_address_name", "==", data.place.road_address_name));
      const placeSnap = await getDocs(q);

      if (placeSnap.empty) {
      // 해당 장소가 등록되어 있지 않으면
      /* TODO: 필오할 지 고민 */
        transaction.set(
          doc(database, `places/${data.place.id}`),
          {
            x: Number(data.place.x),
            y: Number(data.place.y),
            place_name: data.place.place_name,
            road_address_name: data.place.road_address_name,
          }
        );
        placeId = data.place.id;
      } else {
        placeId = placeSnap.docs[0].id;
      }

      // 제품의 place 컬렉션에도 place 등록
      transaction.set(
        doc(database, `products/${data.goodId}/places/${placeId}`),
        {
          x: Number(data.place.x),
          y: Number(data.place.y),
          place_name: data.place.place_name,
        }
      )
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

async function getMinMaxPriceBetweenRange(goodId: string, fromDate: Date, toDate: Date) {
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

/* 2년 치 한 달 단위 최저, 최고가 */
export async function getMinMaxPriceForTwoYears(id: string) {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  let curMonth = new Date(startOfThisMonth.getTime());
  curMonth.setMonth(startOfThisMonth.getDate() - 12 * 2);

  let startTimeCursor, endTimeCursor; 
  let minMaxPriceForMonth = [];
  while (curMonth.getTime() < now.getTime()) {
    startTimeCursor = curMonth.getTime();
    curMonth.setMonth(curMonth.getMonth() + 1);
    // 다음 달 첫 날 
    endTimeCursor = curMonth.getTime();

    const result = await getMinMaxPriceBetweenRange(id, new Date(startTimeCursor), new Date(endTimeCursor));

    const minPrice = result.minPrice;
    const maxPrice = result.maxPrice;
    
    const displayDate = new Date(startTimeCursor);
    minMaxPriceForMonth.push({
      date: `${displayDate.getFullYear()}.${displayDate.getMonth() + 1}`,
      minPrice,
      maxPrice
    });
  }

  return minMaxPriceForMonth;
}

export async function getPricesPaginationByPlace(productId: String, placeId: String, start?: QueryDocumentSnapshot) {
  const q = 
    start 
    ? 
    query(
      collection(database, `products/${productId}/prices`),
      where("placeId", "==",  placeId),
      orderBy("date", "desc"),
      startAfter(start), 
      limit(10)
    )
    :
    query(
      collection(database, `products/${productId}/prices`),
      where("placeId", "==",  placeId),
      orderBy("date", "desc"),
      limit(10)
    );

  const snapshot = await getDocs(q)
  return { 
    data: snapshot.docs.map((snap) => {
      return Object.assign(snap.data(), {
        id: snap.id,
        date: snap.data().date.toDate().toLocaleDateString(),
      }) as Price
    }),
    lastDoc: snapshot.docs.at(-1)
  }
}

export async function getPricesPaginationByDate(productId: string, date: string, start?: QueryDocumentSnapshot) {
  let fromDate = new Date(date);
  let toDate = new Date(fromDate);
  toDate.setDate(toDate.getDate()  + 1);

  const q = 
    start 
    ? 
    query(
      collection(database, `products/${productId}/prices`),
      where("date", ">=",  fromDate),
      where("date", "<", toDate),
      startAfter(start), 
      limit(10)
    )
    :
    query(
      collection(database, `products/${productId}/prices`),
      where("date", ">=",  fromDate),
      where("date", "<", toDate),
      limit(10)
    );

  const snapshot = await getDocs(q)
  return { 
    data: snapshot.docs.map((snap) => {
      return Object.assign(snap.data(), {
        id: snap.id,
        date: snap.data().date.toDate().toLocaleDateString(),
      }) as Price
    }),
    lastDoc: snapshot.docs.at(-1)
  }
}

/* 한 달 치 하루 단위 최저, 최고가 */
export async function getMinMaxPriceForOneMonth(id: string, tilMonth: string) {
  let splitYearMonth = tilMonth.split('.');

  const startOfDate = new Date(Number(splitYearMonth[0].trim()), Number(splitYearMonth[1].trim()) - 1, 1, 0, 0, 0);
  const startOfNextMonth = new Date(startOfDate)
  startOfNextMonth.setMonth(startOfDate.getMonth() + 1)


  let startTimeCursor, endTimeCursor; 
  let minMaxPriceForMonth = [];
  while (startOfDate.getTime() < startOfNextMonth.getTime()) {
    startTimeCursor = startOfDate.getTime();
    startOfDate.setDate(startOfDate.getDate() + 1);
    // 다음 달 첫 날 
    endTimeCursor = startOfDate.getTime();

    const result = await getMinMaxPriceBetweenRange(id, new Date(startTimeCursor), new Date(endTimeCursor));

    const minPrice = result.minPrice;
    const maxPrice = result.maxPrice;
    
    const displayDate = new Date(startTimeCursor);
    minMaxPriceForMonth.push({
      date: `${displayDate.getFullYear()}.${displayDate.getMonth() + 1}.${displayDate.getDate()}`,
      minPrice,
      maxPrice
    });
  }

  return minMaxPriceForMonth;
}


/* 인덱스에서 보여줄 특정 제품들 */
export async function getPromotions() {
  const snapshot = await getDocs(collection(database, 'promotions'));
  return snapshot.docs.map(doc => {
    return doc.data();
  })
}