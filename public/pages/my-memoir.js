// ===========================
// 나의 산문집 - 개인 추억 페이지
// ===========================

// 헤더/푸터 로드
async function loadComponents() {
  try {
    const headerRes = await fetch('/component/header-with-back.html');
    const headerHtml = await headerRes.text();
    document.getElementById('header').innerHTML = headerHtml;

    const footerRes = await fetch('/component/footer.html');
    const footerHtml = await footerRes.text();
    document.getElementById('footer').innerHTML = footerHtml;

    // 헤더 초기화
    if (window.initHeader) {
      window.initHeader();
    }
  } catch (error) {
    console.error('컴포넌트 로드 실패:', error);
  }
}

// 날짜 포맷팅
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

// 계절 판별
function getSeason(dateString) {
  const month = new Date(dateString).getMonth() + 1;
  if (month >= 3 && month <= 5) return '봄날의 기억';
  if (month >= 6 && month <= 8) return '여름날의 기억';
  if (month >= 9 && month <= 11) return '가을날의 기억';
  return '겨울날의 기억';
}

// 텍스트 미리보기
function getPreviewText(content, maxLength = 200) {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

// 산문 카드 렌더링
function renderMemoirCard(memoir) {
  const card = document.createElement('article');
  card.className = 'memoir-card';
  card.onclick = () => {
    window.location.href = `/pages/post-detail.html?id=${memoir.id}`;
  };

  const formattedDate = formatDate(memoir.createdAt);
  const season = getSeason(memoir.createdAt);
  const preview = getPreviewText(memoir.content);

  card.innerHTML = `
    <div class="memoir-card-header">
      <span class="memoir-card-date">${formattedDate}</span>
      <span class="memoir-card-season">${season}</span>
    </div>
    <h2 class="memoir-card-title">${memoir.title}</h2>
    <p class="memoir-card-content">${preview}</p>
    <div class="memoir-card-footer">
      <span class="memoir-card-tag">${memoir.tag || '추억'}</span>
      <span>・</span>
      <span>${memoir.author || '나'}</span>
    </div>
  `;

  return card;
}

// 산문 목록 로드
async function loadMemoirs() {
  const listContainer = document.getElementById('memoir-list');
  const emptyState = document.getElementById('memoir-empty');
  const loadingState = document.getElementById('memoir-loading');
  const pageDivider = document.getElementById('page-divider');
  const pageNumber = document.getElementById('page-number');

  // 로딩 표시
  loadingState.style.display = 'block';
  emptyState.style.display = 'none';
  listContainer.innerHTML = '';

  try {
    // TODO: API 호출 (개인 추억만 조회하는 엔드포인트)
    // const response = await fetch('/api/memoirs/my', {
    //   method: 'GET',
    //   credentials: 'include',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // });
    //
    // if (!response.ok) {
    //   throw new Error('추억을 불러오는데 실패했습니다');
    // }
    //
    // const data = await response.json();
    // const memoirs = data.memoirs || [];

    // 임시 더미 데이터
    const memoirs = [
      {
        id: 1,
        title: '벚꽃이 흩날리던 그 거리에서',
        content: '봄바람에 흩날리는 벚꽃잎을 보며 문득 당신이 떠올랐습니다. 우리가 함께 걷던 그 길, 손을 맞잡고 웃음 짓던 그 순간들. 시간이 지나도 여전히 선명한 기억 속에서, 나는 또 한 번 봄을 맞이합니다. 계절은 돌고 돌지만, 그때의 설렘만큼은 영원히 내 안에 남아있을 것 같습니다.',
        author: '나',
        createdAt: '2024-04-15T14:30:00',
        tag: '봄'
      },
      {
        id: 2,
        title: '비 오는 날의 커피 한 잔',
        content: '창밖으로 내리는 빗소리를 들으며 따뜻한 커피 한 잔을 마십니다. 이런 날이면 언제나 조용히 혼자만의 시간을 가지곤 했죠. 아무 생각 없이 멍하니 빗방울이 창을 타고 흘러내리는 것을 바라보는 것만으로도, 마음이 차분해집니다. 어쩌면 이런 소소한 순간들이 진짜 행복인지도 모르겠습니다.',
        author: '나',
        createdAt: '2024-07-22T16:45:00',
        tag: '일상'
      },
      {
        id: 3,
        title: '단풍 든 산길을 걷다',
        content: '온 산이 붉게 물든 가을날, 혼자 산책을 나섰습니다. 발걸음을 옮길 때마다 바스락거리는 낙엽 소리, 맑은 가을 하늘, 그리고 선선한 바람. 모든 것이 완벽했던 그 순간, 나는 깨달았습니다. 특별한 일이 없어도, 이렇게 자연과 함께 호흡하는 것만으로도 충분히 행복할 수 있다는 것을.',
        author: '나',
        createdAt: '2024-10-08T10:20:00',
        tag: '가을'
      },
      {
        id: 4,
        title: '첫눈이 내리던 밤',
        content: '올해의 첫눈을 혼자 맞이했습니다. 고요한 밤, 창밖으로 소복이 쌓이는 눈을 보며 지난 한 해를 돌아봅니다. 웃었던 날도, 울었던 날도 모두 소중한 기억이 되어 가슴속에 자리 잡았습니다. 눈처럼 순수하고 깨끗한 마음으로, 다가오는 새해를 맞이하고 싶습니다.',
        author: '나',
        createdAt: '2024-12-15T23:10:00',
        tag: '겨울'
      },
      {
        id: 5,
        title: '오래된 사진 한 장',
        content: '서랍 속에서 우연히 오래된 사진을 발견했습니다. 어린 시절의 내 모습이 낯설면서도 정겹습니다. 그때는 몰랐던 것들이 이제는 보입니다. 시간이 지나고 나서야 알게 되는 것들, 그리고 영영 잃어버린 것들. 사진 속 나를 보며, 지금의 나는 얼마나 성장했는지 묻게 됩니다.',
        author: '나',
        createdAt: '2024-06-03T19:15:00',
        tag: '회상'
      }
    ];

    // 로딩 숨기기
    loadingState.style.display = 'none';

    // 산문이 없는 경우
    if (memoirs.length === 0) {
      emptyState.style.display = 'block';
      pageDivider.style.display = 'none';
      pageNumber.style.display = 'none';
      return;
    }

    // 산문 렌더링
    memoirs.forEach((memoir, index) => {
      const card = renderMemoirCard(memoir);
      listContainer.appendChild(card);

      // 카드 사이에 구분선 추가 (마지막 제외)
      if (index < memoirs.length - 1) {
        const divider = document.createElement('div');
        divider.className = 'page-divider';
        divider.innerHTML = '<span class="page-divider-text">✦</span>';
        listContainer.appendChild(divider);
      }
    });

    // 페이지 번호 표시
    pageNumber.style.display = 'block';
    document.getElementById('current-page').textContent = '1';

  } catch (error) {
    console.error('추억 로드 실패:', error);
    loadingState.style.display = 'none';
    emptyState.style.display = 'block';

    // 에러 메시지 커스터마이징
    const emptyTitle = document.querySelector('.memoir-empty-title');
    const emptyText = document.querySelector('.memoir-empty-text');
    if (emptyTitle && emptyText) {
      emptyTitle.textContent = '추억을 불러올 수 없습니다';
      emptyText.innerHTML = '잠시 후 다시 시도해주세요<br/><br/>문제가 계속되면 관리자에게 문의해주세요';
    }
  }
}

// 현재 연도 표시
function setCurrentYear() {
  const currentDate = document.getElementById('current-date');
  if (currentDate) {
    const year = new Date().getFullYear();
    currentDate.textContent = year;
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
  await loadComponents();
  setCurrentYear();
  await loadMemoirs();
});
