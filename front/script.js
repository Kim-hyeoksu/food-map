var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
var options = { //지도를 생성할 때 필요한 기본 옵션
	center: new kakao.maps.LatLng(37.33651018282669, 127.25238114684662), //지도의 중심좌표.
	level: 3 //지도의 레벨(확대, 축소 정도)
};

var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
var mapTypeControl = new kakao.maps.MapTypeControl();

// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
// kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

//2. 더미데이터 준비하기

const dataSet = [
	{
		title: '49포차',
		address: '경기도 용인시 처인구 모현면 왕산리 494-11번지 KR 생삼겹 1층',
		url: '',
		category: '술집'
	},
	{
		title: '호가',
		address: '경기도 용인시 처인구 모현읍 백옥대로2384번길 21-8',
		url: '',
		category: '구이'
	},
	{
		title: '엄마손칼국수',
		address: '경기도 용인시 처인구 모현면 왕산리 794-10',
		url: '',
		category: '분식'
	},
]

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

function getContent(data) {
	//인포윈도우 가공하기
	return `
	<div class="infowindow">
    <div class="infowindow-img-container">
      <img src="https://img.hankyung.com/photo/202109/01.27608010.1-1200x.jpg" class="infowindow-img">
    </div>
    <div class="infowindow-body">
      <h5 class="infowindow-title">${data.title}</h5>
      <p class="infowindow-address">${data.address}</p>
      <a href="${data.url}" class="infowindow-btn" target="_blank">사이트 이동</a>

    </div>
  </div>
	`
}
async function setMap(dataSet) {
	//마커 생성하기
	for (var i = 0; i < dataSet.length; i++) {
		//마커를 생성합니다
		let coords = await getCoordsByAddress(dataSet[i].address)
		var marker = new kakao.maps.Marker({
			map: map, // 마커를 표시할 지도
			position: coords, // 마커를 표시할 위치
		});

		markerArray.push(marker)

		// 마커에 표시할 인포윈도우를 생성합니다 
    var infowindow = new kakao.maps.InfoWindow({
			content: getContent(dataSet[i]) // 인포윈도우에 표시할 내용
		});
		infowindowArray.push(infowindow)

		// 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
		// 이벤트 리스너로는 클로저를 만들어 등록합니다 
		// for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
		kakao.maps.event.addListener(marker, 'click', makeOverListener(map, marker, infowindow, coords));
		kakao.maps.event.addListener(map, 'click', makeOutListener(infowindow));
	};   
}

//주소 좌표 변환 함수
function getCoordsByAddress(address) {
	return new Promise((resolve, reject) => {
		geocoder.addressSearch(address, function(result, status) {
			// 정상적으로 검색이 완료됐으면 
			if (status === kakao.maps.services.Status.OK) {
				var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
				console.log(coords)
				resolve(coords)
				return
			} 
			reject(new Error("getCoordsByAddress Error: not valid Address"))
		});    
	})
}

//인포윈도우를 표시하는 클로저를 만드는 함수
//1. 클릭시 다른 인포윈도우 닫기
//2. 클릭한 곳으로 지도 중심 옮기기
function makeOverListener(map, marker, infowindow, coords) {
	return function () {
		//1. 클릭시 다른 인포윈도우 닫기
		closeInfoWindow();
		infowindow.open(map, marker)
		//2. 클릭한 곳으로 지도 중심 옮기기
		coords.Ma += 0.001
		map.panTo(coords)
	}
}

let infowindowArray = []

function closeInfoWindow() {
	for (let infowindow of infowindowArray) {
		infowindow.close()
	}
}
//인포윈도우를 닫는 함수
function makeOutListener(infowindow) {
	return function() {
		infowindow.close()
	}
}
setMap(dataSet)

//5.카테고리 분류

//카테고리
const categoryMap = {
	korea: '한식',
	china: '중식',
	japan: '일식',
	america: '양식',
	wheat: '분식',
	meat: '구이',
	sushi: '회/초밥',
	bar: '술집'
}
const categoryList = document.querySelector(".category-list")
categoryList.addEventListener('click', categoryHandler)

function categoryHandler(event) {
	const categoryId = event.target.id
	const category = categoryMap[categoryId]

	//데이터 분류
	let categorizedDataSet = []
	for (let data of dataSet) {
		if (data.category === category) {
			categorizedDataSet.push(data)
		}
	}
	//기존 마커 삭제
	closeMarker()
	//기존 인포윈도우 닫기
	closeInfoWindow()

	setMap(categorizedDataSet)
}

let markerArray = []
function closeMarker() {
	for (marker of markerArray) {
		marker.setMap(null)
	}
}