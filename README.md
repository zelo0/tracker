# 소개
제품의 가격 통계를 볼 수 있는 서비스
![image](https://user-images.githubusercontent.com/86035717/224535414-22308e29-dd13-4bf6-acb3-d1f7e0cc3677.png)


<br/><br/>

# 주요 라이브러리
## 프론트엔드
- React
- Next.js
- Ant design
- Chart.js

## 데이터베이스
- firebase (firestore, storage)

<br/><br/>

# 도입
## Static generation
이 프로젝트는 Incremental static generation을 채택했습니다.<br>
이유는 다음과 같습니다
- 무료 데이터베이스이기 때문에 최대한 트래픽을 아끼고자 했습니다. firestore의 하루 read 할당량은 5만 건입니다
- 제품 상세 페이지의 핵심 기능인 2년 치 가격 통계를 보여주기 위해 데이터베이스에 많은 요청을 보냅닌다. 많은 요청은 데이터베이스 가격 정책이 신경 쓰이기도 하고, 로딩 시간이 깁니다. 
- 한 번 빌드된 페이지는 가격이 새로 등록되지 않는 이상 내용이 바뀔 필요가 없습니다. 가격 등록이 잦을 것으로는 예상되지 않습니다.
- SEO를 고려하면 CSR보다는 SSR이나 SSG이 적합했습니다.

 다이나믹 경로에 대응되는 페이지의 getStaticPaths()에서 path를 지정해주지 않고, 페이지에 대한 첫 요청이 들어왔을 때 빌드되게 했습니다. 이후 같은 페이지 요청이 들어왔을 때는 빌드된 페이지를 빠르게 보여줍니다. 
<br><br>
 이후에 가격이 새로 등록될 시 해당 제품 페이지와 인덱스 페이지를 next.js의 revalidate()를 사용하여 재빌드해줍니다.


<br/><br/>

# 성능 최적화
- state를 관리하는 중간 컴포넌트 
- React.memo로 props가 같으면 re render되지 않게 하기
- set state에서 제공하는 콜백 함수를 사용해서 의미 상 같은 state로 변경 요청 시 re render 피하기
### Search 관련 state를 모달 컴포넌트에서 관리하지 않고 ProductSearch 컴포넌트에서 관리
<br>

### React.memo로 카카오맵 컴포넌트를 감싸 re render 예방
```js
export default React.memo(forwardRef<MapRef, Props>(KakaoMap))
```
<br>

###  setPlace 호출 시 콜백 함수를 사용하여 이전과 place id가 다를 때만 무한스크롤을 초기화
```js
const onChangePlace = useCallback(
    (newPlace: Place) => {
      setPlace((prevPlace) => {
        console.log('prevPlace', prevPlace);
        if (prevPlace?.id === newPlace.id) {
          return prevPlace;
        } else {
          setData([]);
          lastData.current = undefined;
          hasMore.current = true;
          return newPlace;
        }
      });
    },
    []
  );
```
<br>

<br><br>


# 실행 방법

## 개발 모드 실행

```bash
npm run dev
# or
yarn dev
```

## 빌드
```bash
npm run build
# or 
yarn build
```

## 빌드 결과 실행
```bash
npm run start 
# or
yarn start
```
