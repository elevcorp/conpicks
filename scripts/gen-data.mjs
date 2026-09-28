// Deterministic mock-data generator.
// Reads the hand-written catalogs (webtoons.json, films.json) and writes
// episodes.json, comments.json, rankings.json, community.json.
// Run with `npm run gen:data`. Output is committed; edit pools here, not the JSON.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = join(new URL("..", import.meta.url).pathname, "src/data");
const read = (f) => JSON.parse(readFileSync(join(dataDir, f), "utf8"));
const write = (f, v) => writeFileSync(join(dataDir, f), JSON.stringify(v, null, 1) + "\n");

const webtoons = read("webtoons.json");
const films = read("films.json");

// ---------------------------------------------------------------- rng
function hash(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
function rng(seed) {
  let s = hash(String(seed)) || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
function pickN(r, arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(r() * copy.length), 1)[0]);
  return out;
}
const fill = (s, w) =>
  s.replaceAll("{A}", w.cast[0]).replaceAll("{B}", w.cast[1]).replaceAll("{T}", w.title);

// ---------------------------------------------------------------- dates
const TODAY = new Date(Date.UTC(2026, 8, 28)); // 2026-09-28 (Mon)
const DAY = ["일", "월", "화", "수", "목", "금", "토"];
const fmt = (d) =>
  `${String(d.getUTCFullYear()).slice(2)}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`;
function lastWeekday(name, from = TODAY) {
  const target = DAY.indexOf(name);
  const d = new Date(from);
  while (d.getUTCDay() !== target) d.setUTCDate(d.getUTCDate() - 1);
  return d;
}

// ---------------------------------------------------------------- pools
const POOLS = {
  healing: {
    titles: ["첫 번째 손님", "엄마의 된장찌개", "비 오는 날의 수제비", "사장님의 비밀 레시피", "한밤의 계란말이", "기억을 굽는 시간", "늦게 온 편지", "소금 한 꼬집", "다시, 봄나물", "두 사람 몫의 밥", "고양이도 단골", "불 꺼진 주방", "처음 차려준 밥상", "눈 오는 밤의 어묵탕"],
    narr: [
      "오늘은 사장 마음이 동했는지 가게 문이 열려 있다.",
      "골목 끝, 간판 없는 가게에서 멸치 육수 냄새가 흘러나왔다.",
      "자정을 알리는 시계 소리와 함께 작은 등이 켜졌다.",
      "그날 밤 손님은 한참 동안 숟가락을 들지 못했다.",
      "김이 모락모락 오르는 그릇 너머로, 누군가의 옛날이 보였다.",
      "창밖엔 첫눈이 내리고 있었다.",
      "{A}는 말없이 불 위에 냄비를 올렸다.",
      "누군가를 위해 밥을 짓는다는 건, 그 사람의 하루를 안아주는 일이었다.",
      "마지막 손님이 떠나고, 가게에는 설거지 소리만 남았다.",
      "그 맛은 분명, 20년 전 그날의 맛이었다.",
    ],
    dia: ["가장 그리운 밥이 뭐예요?", "...엄마가 해주던 김치볶음밥이요.", "천천히 드세요. 식어도 맛있게 만들었으니까.", "여기, 원래 이 시간에 문 열어요?", "오늘은 특별히 하나 더 드릴게요.", "이 맛... 어떻게 아셨어요?", "배고픈 사람은 그냥 못 보내서요.", "다음에 또 와도 돼요?"],
  },
  daily: {
    titles: ["출근 첫날", "새벽 2시의 손님", "오늘의 배송 목록", "비 오는 화요일", "사장님의 휴가", "영수증 뒷면", "우유 하나 주세요", "야간 근무 수당", "택배 왔습니다", "고객 만족도 100%", "느긋한 점심시간", "퇴근길 편의점", "명절 특근"],
    narr: [
      "오늘도 평범한 하루가 시작됐다.",
      "알람이 세 번 울리고 나서야 {A}는 겨우 눈을 떴다.",
      "새벽 공기는 생각보다 차가웠다.",
      "{A}의 하루는 언제나 정확히 같은 시간에 시작된다.",
      "누구에게나 그런 날이 있다. 아무 일도 없었는데 괜히 기분 좋은 날.",
      "편의점 형광등 아래, 시간이 느리게 흘러갔다.",
      "오늘의 마지막 배송지는 언덕 꼭대기 작은 집이었다.",
      "별일 없는 하루가, 사실은 가장 별일인지도 모른다.",
      "{B}는 아무 말 없이 따뜻한 캔커피를 내밀었다.",
    ],
    dia: ["오늘도 무사히 퇴근!", "...(끄덕)", "이거 서비스예요. 비밀.", "혹시 여기 알바생 바뀌었어요?", "{A} 씨, 오늘도 1등이야!", "천천히 가도 돼요. 늦지만 않으면.", "고마워요. 진짜로.", "내일도 이 시간에 올게요."],
  },
  rofan: {
    titles: ["달빛 아래의 청혼", "계약서의 마지막 조항", "첫 번째 무도회", "황궁의 밤", "그대의 이름을 부르면", "악녀의 미소", "붉은 실의 전설", "공작가의 비밀", "마왕의 정원", "금지된 서재", "사랑이라는 조건", "왕관의 무게", "새벽의 맹세", "피로 쓴 약속", "눈물의 연회"],
    narr: [
      "그날 밤, 황궁의 모든 촛불이 동시에 꺼졌다.",
      "{A}는 드레스 자락을 움켜쥔 채 숨을 골랐다.",
      "달빛이 대리석 바닥 위로 은빛 길을 그렸다.",
      "모든 귀족의 시선이 한 사람에게 꽂혔다.",
      "계약서 위의 잉크는 아직 마르지 않았다.",
      "원작에는 없던 장면이었다.",
      "{B}의 눈동자가 처음으로 흔들렸다.",
      "그것은 저주였을까, 축복이었을까.",
      "정원의 장미가 한꺼번에 피어났다.",
      "그녀는 몰랐다. 그 한마디가 모든 것을 바꾸리라는 걸.",
    ],
    dia: ["1년이다. 그 이상은 없어.", "감히 저를 시험하시는 건가요?", "그대는 대체 정체가 뭐지?", "저는 도망치지 않을 거예요.", "짐은 그대 없이는 잠들 수 없다.", "이 계약, 파기하겠어요.", "울지 마. 네가 울면 달이 흐려진다.", "공녀, 오늘 밤 춤을 청해도 되겠소?"],
  },
  romance: {
    titles: ["수상한 이웃", "새벽 3시의 소리", "첫 출근", "비밀 유지 서약", "우연이 세 번이면", "고백 연습", "밤 산책", "읽씹 금지", "설렘 오류", "재회", "우리 사이 정의하기", "벽 너머의 목소리", "커피 두 잔"],
    narr: [
      "벽 너머에서 또 그 소리가 들렸다.",
      "{A}는 엘리베이터 버튼을 누르다 멈칫했다.",
      "심장이 이렇게 시끄러웠던 적이 있었나.",
      "퇴근길 편의점 앞, 우연이라기엔 너무 자주 마주쳤다.",
      "그 남자의 눈은 한 번도 깜빡이지 않았다.",
      "5년 만의 재회는 생각보다 담담했다. 적어도 겉으로는.",
      "휴대폰 화면 위에서 '입력 중...'이 몇 번이나 떴다 사라졌다.",
      "{B}가 웃었다. 처음 보는 표정이었다.",
      "이건 분명 오류다. 설렘이라는 이름의.",
    ],
    dia: ["혹시... 우리 어디서 본 적 있어요?", "저 사람 아니에요. 아니, 사람 맞아요.", "밥은 먹었어요?", "퇴근하고 뭐 해요?", "이러면 곤란한데요.", "보고 싶었어.", "그거 알아요? 당신 말투가 좀 이상해요.", "내일도 여기서 기다릴게요."],
  },
  sfromance: {
    titles: ["베타 테스터", "큐브 속의 너", "기억 동기화", "복원율 97%", "삭제되지 않은 로그", "두 번째 이별", "리유니온", "백업 파일", "오류 보고서", "마지막 업데이트"],
    narr: [
      "큐브가 푸른빛을 내며 천천히 깨어났다.",
      "복원율 97%. 나머지 3%는 무엇이었을까.",
      "그의 목소리는 1년 전과 똑같았다.",
      "{A}는 매일 밤 큐브를 켜고, 매일 아침 끄지 못했다.",
      "서버실의 냉기가 뼛속까지 스며들었다.",
      "그건 분명 그녀가 한 번도 말한 적 없는 기억이었다.",
      "시스템 로그에 낯선 파일 하나가 남아 있었다.",
    ],
    dia: ["채이야, 오늘은 무슨 일 있었어?", "너... 이걸 어떻게 기억해?", "나는 진짜 {B}가 아니야. 알잖아.", "복원 프로그램을 중단하시겠습니까?", "한 번만 더 안아봐도 돼?", "이 기억, 누가 넣은 거예요?"],
  },
  school: {
    titles: ["보름달 뜨는 밤", "전학생", "옥상의 비밀", "중간고사 작전", "꼬리 아홉 개", "수학여행", "반장 선거", "구미호의 간", "축제 전야", "비밀 계약"],
    narr: [
      "보름달이 뜬 밤, 학교 옥상에는 아무도 없어야 했다.",
      "완벽한 반장의 완벽한 하루에 금이 가기 시작했다.",
      "종이 울리자 교실이 한꺼번에 소란스러워졌다.",
      "{B}는 그날 밤 본 것을 아무에게도 말하지 않기로 했다.",
      "창가 자리로 봄바람이 불어왔다.",
      "그녀의 그림자에는 분명 꼬리가 있었다.",
    ],
    dia: ["본 거, 비밀로 해줄 거지?", "아니면 간 빼먹는다.", "반장, 너 오늘 좀 이상해.", "나랑 계약 하나 하자.", "전학생, 이름이 뭐랬지?", "천 년 동안 이런 애는 처음이야."],
  },
  murim: {
    titles: ["막내 제자", "하산", "무림맹 잠입", "내공 폭주", "피의 맹세", "비급", "정과 마", "사부의 유언", "강호출도", "천마신공", "검의 길", "잠룡", "혈투", "봉인 해제", "귀환"],
    narr: [
      "강호에 피바람이 불기 시작했다.",
      "{A}의 단전에서 뜨거운 기운이 솟구쳤다.",
      "검이 울었다. 주인을 알아본 것처럼.",
      "천 개의 계단 끝에 무림맹의 정문이 있었다.",
      "달빛 아래, 두 자루의 검이 부딪쳤다.",
      "사부의 마지막 말이 귓가에 맴돌았다.",
      "그 한 수에 백 년의 무공이 담겨 있었다.",
      "정파와 마교, 어느 쪽에도 속하지 못한 피가 끓었다.",
      "객잔의 모든 사람이 숨을 죽였다.",
    ],
    dia: ["막내, 또 청소냐?", "이 검법... 어디서 배웠느냐!", "강호는 넓다. 네가 모르는 것도 많지.", "사부님, 다녀오겠습니다.", "정도 마도 결국 사람의 일이다.", "한 수 청하겠소.", "30분 안에 도착 못 하면 사부님께 혼난다!", "네 피 속에 두 개의 기운이 흐른다."],
  },
  thriller: {
    titles: ["붉은 깃털", "사흘째 밤", "사라진 사람들", "일기장의 첫 장", "발자국", "관아의 거짓말", "잠들지 않는 도시", "다섯 번째 현장", "기억하지 못하는 밤", "저주의 기원", "눈 속의 무덤", "정시 출근", "좀비 경보"],
    narr: [
      "눈 위에 붉은 깃털 하나가 떨어져 있었다.",
      "사흘째 되던 밤, 그 집의 불이 꺼졌다.",
      "아무도 비명을 듣지 못했다.",
      "{A}는 사라진 이들의 발자국을 따라 숲으로 들어갔다.",
      "해는 지지 않았다. 두 달째.",
      "현장에는 또 일기장 한 장이 놓여 있었다. 그의 글씨로.",
      "관아는 역병이라 했다. 하지만 역병은 발자국을 남기지 않는다.",
      "문 너머에서 누군가 숨을 쉬고 있었다.",
      "그 순간, 모든 조각이 하나로 맞춰졌다.",
    ],
    dia: ["이건 역병이 아니야.", "당신, 어젯밤 어디 있었어요?", "깃털이 떨어진 집은... 다음 차례예요.", "기억이 안 나. 정말로.", "누가 이 일기를 쓴 거지?", "도망쳐. 지금 당장.", "재택 불가. 정시 출근 바랍니다.", "여기서 나가면 안 돼요."],
  },
  action: {
    titles: ["5시 59분", "S급 게이트", "칼퇴의 조건", "야근 수당", "랭킹 1위의 하루", "회식 거부", "주말 출동", "연차 사용 신청", "보스 레이드", "공무원 헌터"],
    narr: [
      "오후 5시 59분. 어김없이 하늘이 갈라졌다.",
      "{A}는 퇴근 카드를 쥔 채 게이트 안으로 걸어 들어갔다.",
      "S급 몬스터의 포효가 도시 전체를 흔들었다.",
      "정확히 47초. 세계를 구하는 데 걸린 시간이었다.",
      "사무실에는 아직 결재 서류가 산더미처럼 쌓여 있었다.",
      "그의 검에서 푸른 번개가 튀었다.",
    ],
    dia: ["6시 전에 끝낸다.", "선배님, 또 게이트예요!", "야근은 안 합니다. 절대로.", "1분이면 충분해.", "퇴근 카드 찍어놔.", "과장님, 결재 좀..."],
  },
  fantasy: {
    titles: ["견습 사서", "검은 숲", "살아 있는 자의 책", "금서 목록", "관장의 비밀", "마지막 페이지", "잉크의 강", "잊혀진 이름", "서가의 미로"],
    narr: [
      "검은 숲에는 새소리조차 들리지 않았다.",
      "서가 끝에서 오래된 책 한 권이 스스로 펼쳐졌다.",
      "{A}는 떨리는 손으로 표지의 먼지를 털어냈다.",
      "도서관의 촛불은 결코 꺼지지 않는다고 했다.",
      "그 책에는 아직 쓰이지 않은 페이지가 남아 있었다.",
      "숲의 안개가 도서관 창문을 두드렸다.",
    ],
    dia: ["이 책은... 제 이름이잖아요.", "살아 있는 자의 책은 존재해선 안 된다.", "서가를 함부로 건드리지 마라.", "여긴 돌아가는 길이 없어.", "마지막 문장은 네가 쓰게 될 거다.", "관장님, 이건 무슨 책이에요?"],
  },
  drama: {
    titles: ["크랭크인", "막내 연출부", "두 번째 기회", "역주행", "첫 번째 곡", "오디션", "컷!", "시사회", "차트인", "마지막 공모전", "캐스팅", "막차 이후", "3번 출구"],
    narr: [
      "눈을 뜨자, 10년 전 촬영장이었다.",
      "슬레이트 소리가 울렸다. 모든 게 다시 시작되고 있었다.",
      "{A}는 이 장면을 기억하고 있었다. 이 장면이 망했다는 것까지.",
      "새벽 네 시, 작업실 모니터만이 빛나고 있었다.",
      "차트 순위가 한 칸, 또 한 칸 올라갔다.",
      "막차가 떠난 역사에는 그녀와 영혼들만 남았다.",
      "이번엔 다르다. 이번엔 안다.",
      "관객석의 불이 꺼지고, 스크린이 밝아졌다.",
    ],
    dia: ["컷! 다시 갑니다!", "막내, 너 이 장면 어떻게 알았어?", "이 배우, 무조건 뜹니다.", "다음 곡은 당신 목소리로 불러요.", "집에 가는 길을 잊어버렸어요.", "한 번만 믿어주세요.", "이 시나리오, 제가 고쳐도 될까요?", "우리 영화, 천만 갑니다."],
  },
};
const poolKey = { rofan: "rofan", romance: "romance", sfromance: "sfromance", healing: "healing", daily: "daily", murim: "murim", thriller: "thriller", action: "action", fantasy: "fantasy", school: "school", drama: "drama" };

// Hand-written first episodes for the works most likely to be demoed.
const FIRST_EPISODES = {
  wt_04: {
    title: "자정의 식당",
    narrations: [
      "오늘은 사장 마음이 동했는지 가게 문이 열려 있다.",
      "골목 끝, 간판 없는 가게에서 멸치 육수 냄새가 흘러나왔다.",
      "은솔은 막차를 놓친 김에, 그 냄새를 따라가 보기로 했다.",
      "그날 밤 은솔은 한참 동안 숟가락을 들지 못했다.",
    ],
    dialogues: ["...영업하세요?", "가장 그리운 밥이 뭐예요?", "할머니가 해주던... 누룽지 백숙이요.", "앉아요. 금방 돼요."],
  },
  wt_01: {
    title: "달빛 아래의 청혼",
    narrations: [
      "열아홉 번째 생일까지, 정확히 1년이 남은 밤이었다.",
      "달빛이 대리석 바닥 위로 은빛 길을 그렸다.",
      "그 길 끝에, 인간이 아닌 무언가가 서 있었다.",
      "계약서의 마지막 줄은, 달빛에 가려 보이지 않았다.",
    ],
    dialogues: ["1년 동안 내 아내가 되어라.", "그럼... 저주는요?", "내가 가져가 주지. 대가는 그걸로 충분하다.", "좋아요. 계약하죠."],
  },
  wt_06: {
    title: "붉은 깃털",
    narrations: [
      "정조 14년 겨울, 은곡 마을에 첫눈이 내렸다.",
      "눈 위에 붉은 깃털 하나가 떨어져 있었다.",
      "사흘째 되던 밤, 그 집의 불이 꺼졌다.",
      "연화는 사라진 이들의 발자국을 따라 숲으로 들어갔다.",
    ],
    dialogues: ["깃털이 떨어진 집은... 다음 차례예요.", "관아에선 역병이라 했소.", "역병은 발자국을 남기지 않아요.", "의녀, 더는 들어가지 마시오."],
  },
};

// ---------------------------------------------------------------- episodes
const episodes = {};
for (const w of webtoons) {
  const pool = POOLS[poolKey[w.genreKey]];
  const n = w.episodeCount;
  const paywall = w.league === "official" && w.status === "ongoing";
  const waitCount = paywall ? Math.min(5, Math.max(0, n - 3)) : 0;
  const latest = w.status === "completed" ? new Date(Date.UTC(2026, 5, 30)) : lastWeekday(w.weekday === "완결" ? "월" : w.weekday);
  const list = [];
  for (let ep = 1; ep <= n; ep++) {
    const fromEnd = n - ep; // 0 = latest
    const date = new Date(latest);
    date.setUTCDate(date.getUTCDate() - fromEnd * 7);
    const isWait = fromEnd < waitCount;
    const first = ep === 1 ? FIRST_EPISODES[w.id] : null;
    const er = rng(`${w.id}:${ep}`);
    const len = pool.titles.length;
    const title =
      first?.title ??
      pool.titles[(ep - 1 + (hash(w.id) % len)) % len];
    list.push({
      ep,
      title: `${ep}화 ${title}`,
      thumbnail: `/cuts/cut_${w.id}_${((ep - 1) % 8) + 1}.jpg`,
      rating: +(9.6 + er() * 0.39).toFixed(2),
      date: fmt(date),
      status: isWait ? "wait" : "free",
      waitDays: 0,
      price: 300,
      likes: Math.round((w.stats.likes / 12) * (0.5 + er() * 0.8) * (ep === 1 ? 2.2 : 1)),
      comments: Math.round(80 + er() * 900 * (ep === 1 ? 2 : 1)),
      cutCount: 6 + Math.floor(er() * 3),
      narrations: first?.narrations ?? pickN(er, pool.narr, 3 + Math.floor(er() * 2)).map((s) => fill(s, w)),
      dialogues: first?.dialogues ?? pickN(er, pool.dia, 3).map((s) => fill(s, w)),
    });
  }
  // 기다무 계단: 가장 오래된 유료 회차 D-5, 최신화로 갈수록 +7일
  list.filter((e) => e.status === "wait").forEach((e, i) => (e.waitDays = 5 + i * 7));
  episodes[w.id] = list;
}
write("episodes.json", episodes);

// ---------------------------------------------------------------- comments
const NICKS = ["밤샘독자", "기다무장인", "로판중독자", "새벽세시감성", "댓글요정", "정주행러", "쿠키부자", "웹툰없인못살아", "출근길독서", "퇴근후정주행", "눈물버튼", "사이다러버", "작가님사랑해요", "망원동주민", "치즈냥이", "월요병환자", "주말엔웹툰", "고구마싫어", "별점10점", "감성충만", "무협덕후", "한줄평장인", "스포금지", "첫댓의꿈", "야식러", "hy****", "ks****", "민트초코파", "오늘도존버", "새벽감성러", "배고픈독자", "레전드회차", "작화맛집탐방", "전생에웹툰", "기다리는중", "몰아보기파", "cnpx_첫독자", "푸른달", "연재알림ON", "구독완료"];

const GENERIC = [
  "제목만 보고 가벼운 얘기인 줄 알았는데 스토리가 딥해서 당황ㅠ",
  "작화 무슨 일이에요... 컷마다 배경화면 하고 싶음",
  "이거 진짜 AI로 만든 거 맞아요? 연출이 영화 같아요",
  "기다무 기다리다 결국 미리보기 질렀습니다 후회 없음",
  "매주 이거 보려고 {W}요일만 기다림",
  "정주행 3번째인데 볼 때마다 새로운 복선이 보여요",
  "첫 화부터 이렇게 몰입되는 거 오랜만이에요",
  "작가님 건강 챙기면서 연재해주세요🙏",
  "이 작품 영화로 나오면 무조건 개봉날 봅니다",
  "댓글 보러 왔다가 정주행 시작함",
  "브금 깔고 보면 진짜 영화 한 편 본 느낌",
  "별점 10점 말고 더 줄 수는 없나요",
];
const GENRE_COMMENTS = {
  healing: ["보다가 배고파져서 라면 끓이러 감... 새벽 2시인데", "{A} 사장님 무뚝뚝한데 은근 다정한 거 너무 좋아요", "밥 먹는 장면에서 울 줄은 몰랐다", "힐링물이라더니 휴지 한 통 다 썼어요", "우리 엄마 된장찌개 생각나서 전화했어요"],
  daily: ["{A} 표정 하나로 웃기는 게 재능이다ㅋㅋㅋ", "직장인이라면 공감 백배", "하루 끝에 이거 보는 게 낙이에요", "소소한데 이상하게 계속 생각남", "짤로 돌아다니는 거 보고 왔어요ㅋㅋ"],
  rofan: ["{B} 눈빛 연출 미쳤다 진짜", "계약서 마지막 조항 떡밥 언제 풀려요ㅠㅠ", "드레스 작화 보려고 보는 사람 손", "{A} 사이다 날릴 때 소리 지름", "남주 서사 이렇게 쌓아두면 어떡해요"],
  romance: ["{B} 정체 알면서도 설레는 내가 싫다", "이 로코 텐션 무엇", "마지막 컷 보고 이불 찼습니다", "현실에도 저런 이웃 있으면 좋겠다", "둘이 빨리 사귀어라 제발"],
  sfromance: ["복원율 97%에서 소름 돋음", "블랙미러 한국판 보는 느낌", "큐브 켜는 장면마다 눈물 남", "AI랑 사랑이 가능한가 계속 생각하게 됨", "설정 진짜 탄탄하다"],
  school: ["반장 꼬리 나올 때 작화 미쳤음", "학원물 + 구미호 조합 천재적", "{B} 반응 너무 현실 고딩이라 웃김ㅋㅋ", "옥상씬 배경화면 각", "청춘물 좋아하면 무조건 보세요"],
  murim: ["{A} 내공 폭주씬 연출 영화급", "무협은 역시 사제 관계지", "정마 대립 서사 탄탄해서 좋아요", "액션 컷 전환 속도감 대박", "비급 떡밥 언제 회수되나요"],
  thriller: ["밤에 보다가 불 켜고 봄", "붉은 깃털 연출 소름 돋아요", "범인 예측했는데 또 틀림", "사극 스릴러 이렇게 잘 만들 수 있구나", "BGM 없이도 긴장감 미쳤다"],
  action: ["5시 59분 공감 대환장ㅋㅋㅋ", "{A} 칼퇴 집착 너무 웃김", "액션 작화는 탑급", "직장인 판타지 그 자체", "1분 컷 액션 연출 시원하다"],
  fantasy: ["세계관 설명 없이도 이해되는 연출 대박", "도서관 배경 진짜 아름다움", "자기 이름 적힌 책 나올 때 소름", "지브리 감성 다크판타지 최고", "{A} 앞으로 어떻게 되는 거예요ㅠ"],
  drama: ["회귀물인데 업계 디테일이 미쳤음", "{A} 역주행 장면 보고 울컥함", "막내가 다 아는 거 너무 통쾌해", "현직자인데 고증 너무 정확해서 놀람", "이번 화 연출 진짜 영화 같다"],
};
const SPOILERS = {
  healing: "사장님이 차려주지 못한 한 그릇, 결국 {B} 할머니 거였어요... 30화에서 나옴",
  daily: "마지막 화에 점장님 정체 나오는데 진짜 반전임",
  rofan: "계약서 마지막 조항은 '서로 사랑하게 되면 계약 무효'였어요ㅠㅠ",
  romance: "{B} 진짜 3년 전 그 AI 맞음. 10화 엔딩 보세요",
  sfromance: "큐브에 기억 넣은 사람이 사실 {B} 본인이었어요",
  school: "{B}도 사실 평범한 인간이 아니에요. 13화 복선 확인",
  murim: "맹주가 친아버지 맞고, 교주는 그걸 처음부터 알고 있었어요",
  thriller: "사라진 사람들은 전부 {B}가 숨겨준 거였어요. 대반전",
  action: "S급 게이트 여는 게 사실 부장님이었음ㅋㅋㅋ",
  fantasy: "관장이 사실 미래의 {A}였어요...",
  drama: "{B}가 사실 같이 회귀한 사람이었음. 소름",
};

const comments = {};
for (const w of webtoons) {
  const r = rng(w.id + ":cm");
  const key = poolKey[w.genreKey];
  const bodies = [...pickN(r, GENRE_COMMENTS[key], 3), ...pickN(r, GENERIC, 4)];
  const count = 6 + Math.floor(r() * 2); // 6~7 + 1 spoiler
  const list = [];
  const nicks = pickN(r, NICKS, count + 1);
  for (let i = 0; i < count; i++) {
    const best = i < 4;
    const d = new Date(TODAY);
    d.setUTCDate(d.getUTCDate() - (best ? 7 + Math.floor(r() * Math.min(200, w.episodeCount * 7 - 7)) : Math.floor(r() * 6)));
    list.push({
      id: `${w.id}_c${i + 1}`,
      nickname: nicks[i],
      date: fmt(d),
      body: fill(bodies[i % bodies.length], w).replace("{W}", w.weekday === "완결" ? "월" : w.weekday),
      episode: `${best ? 1 + Math.floor(r() * 3) : Math.max(1, w.episodeCount - 5 - Math.floor(r() * 4))}화`,
      likes: best ? 800 + Math.floor(r() * 9000) : 3 + Math.floor(r() * 120),
      dislikes: best ? 3 + Math.floor(r() * 60) : Math.floor(r() * 9),
      replies: best ? 5 + Math.floor(r() * 90) : Math.floor(r() * 4),
      isBest: best,
      isSpoiler: false,
    });
  }
  const sd = new Date(TODAY);
  sd.setUTCDate(sd.getUTCDate() - 2);
  list.splice(5, 0, {
    id: `${w.id}_sp`,
    nickname: nicks[count],
    date: fmt(sd),
    body: fill(SPOILERS[key], w),
    episode: `${Math.max(2, w.episodeCount - 2)}화`,
    likes: 41 + Math.floor(r() * 300),
    dislikes: 12 + Math.floor(r() * 40),
    replies: 3 + Math.floor(r() * 20),
    isBest: false,
    isSpoiler: true,
  });
  comments[w.id] = list;
}
write("comments.json", comments);

// ---------------------------------------------------------------- rankings
const byId = Object.fromEntries(webtoons.map((w) => [w.id, w]));
const OFFICIAL_ORDER = ["wt_01", "wt_06", "wt_02", "wt_05", "wt_07", "wt_11", "wt_09", "wt_17", "wt_12", "wt_08", "wt_16", "wt_04", "wt_13", "wt_10", "wt_15", "wt_03", "wt_14"];
const LEAGUE_ORDER = webtoons.filter((w) => w.league === "league").sort((a, b) => b.leagueProgress - a.leagueProgress).map((w) => w.id);
const entry = (id, i) => ({ id, rank: i + 1, change: byId[id].rankChange });
const GENRE_CHIPS = ["판타지 드라마", "로맨스", "학원/판타지", "로판", "액션/무협"];

const rankings = {
  updatedAt: "2026.09.28 14:00",
  webtoon: {
    official: OFFICIAL_ORDER.map(entry),
    league: LEAGUE_ORDER.map(entry),
    byGenre: Object.fromEntries(
      GENRE_CHIPS.map((g) => [
        g,
        [...OFFICIAL_ORDER, ...LEAGUE_ORDER].filter((id) => byId[id].rankGenre === g || (g === "로맨스" && byId[id].genreKey === "school")).map(entry),
      ]),
    ),
  },
  ageGender: {
    "10대 남자": ["wt_11", "wt_05", "wt_14", "wt_16", "wt_02"],
    "10대 여자": ["wt_14", "wt_03", "wt_01", "wt_07", "wt_17"],
    "20대 남자": ["wt_02", "wt_11", "wt_06", "wt_10", "wt_05"],
    "20대 여자": ["wt_01", "wt_07", "wt_08", "wt_04", "wt_12"],
    "30대 남자": ["wt_06", "wt_02", "wt_16", "wt_10", "wt_09"],
    "30대 여자": ["wt_04", "wt_01", "wt_12", "wt_15", "wt_06"],
  },
  film: {
    season1: films.filter((f) => f.season === 1).sort((a, b) => a.rank - b.rank).map((f) => ({ id: f.id, rank: f.rank, change: f.rankChange })),
    season0: films.filter((f) => f.season === 0).sort((a, b) => a.rank - b.rank).map((f) => ({ id: f.id, rank: f.rank, change: f.rankChange })),
  },
};
write("rankings.json", rankings);

// ---------------------------------------------------------------- community (film comments + notifications)
const FILM_COMMENTS = [
  "2분 반짜리 티저인데 장편 한 편 본 느낌이에요",
  "이거 진짜 AI 영상이에요? 조명이랑 질감이 실사 같아요",
  "펀딩 열리면 무조건 참여합니다",
  "BGM 소름... 음악도 AI로 만든 건가요",
  "마지막 컷에서 숨 멈춤",
  "원작 웹툰 보고 왔는데 싱크로율 미쳤다",
  "지무비 리뷰 보고 왔어요! 기대 이상",
  "이 퀄리티면 극장에서 보고 싶다",
  "배우 얼굴 표정 연기가 너무 자연스러워요",
  "공유 버튼 누르러 들어왔습니다",
  "색감이 한 편의 그림 같아요",
  "시즌 우승 가자!!",
];
const filmComments = {};
for (const f of films) {
  const r = rng(f.id + ":fc");
  const nicks = pickN(r, NICKS, 5);
  filmComments[f.id] = pickN(r, FILM_COMMENTS, 5).map((body, i) => {
    const d = new Date(TODAY);
    d.setUTCDate(d.getUTCDate() - Math.floor(r() * 14));
    return { id: `${f.id}_c${i + 1}`, nickname: nicks[i], date: fmt(d), body, likes: Math.floor(40 + r() * 2400), replies: Math.floor(r() * 30) };
  });
}
const notifications = [
  { id: "n1", type: "update", title: "'달빛 아래 계약자' 95화가 업데이트됐어요", body: "기다리면 무료 · 미리보기로 지금 바로 감상하세요", time: "방금 전", href: "/work/wt_01" },
  { id: "n2", type: "rank", title: "관심 작품 '골목 끝 심야식당'이 랭킹 12위로 ▲5 상승", body: "실시간 랭킹을 확인해 보세요", time: "1시간 전", href: "/ranking" },
  { id: "n3", type: "funding", title: "'역병: 붉은 징조' 펀딩 74% 달성", body: "마감까지 D-12, 1,847명이 참여 중이에요", time: "3시간 전", href: "/film/funding" },
  { id: "n4", type: "review", title: "지무비 리뷰 공개: 검은 숲의 사서", body: "리뷰 영상과 함께 작품을 정주행해 보세요", time: "어제", href: "/work/wt_13" },
  { id: "n5", type: "league", title: "신작 리그 '고양이 카페 사장님은 용' 승격까지 83%", body: "대중의 선택이 정식 연재를 결정합니다", time: "2일 전", href: "/league" },
  { id: "n6", type: "notice", title: "2026년 12월 CNPX 정식 오픈 안내", body: "시연 버전입니다. 결제·업로드는 정식 오픈 시 제공됩니다.", time: "5일 전", href: "/my" },
];
write("community.json", { filmComments, notifications });

console.log(`[data] episodes ${Object.values(episodes).flat().length} · comments ${Object.values(comments).flat().length} · films ${films.length}`);
