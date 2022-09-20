// 자주 사용되는 Error Codes의 관리를 위한 파일
module.exports = {
  pageNotFound: "페이지를 찾을 수 없습니다.",
  notUpdate: "수정된 내용이 없습니다.",
  notDelete: "삭제되지 않았습니다.",
  // USER
  canNotFindRecord: "보스레이드 기록이 존재하지 않습니다.",
  canNotFindUser: "존재하지 않는 회원입니다.",
  alreadySignUpEmail: "이미 가입된 이메일입니다.",
  // bossRaid
  canNotFindStatus: "보스레이드 상태를 조회할 수 없습니다.",
  canNotFindLevel: "존재하지 않는 레벨입니다.",
  doNotMatchUser: "보스레이드 진행 중인 유저정보와 일치하지 않습니다.",
  doNotMatchBossRaid: "진행 중인 보스레이드와 일치하지 않습니다.",
  canNotFindEnterData: "진행 중인 보스레이드를 찾을 수 없습니다.",
  timeOver: "제한시간을 초과했습니다.",
  doNotUpdateScore: "점수가 반영되지 않았습니다.",
  failedCreateHistory: "기록이 생성되지 않았습니다.",
  alreadyClosedBossRaid: "이미 종료된 보스레이드입니다.",
  // validator
  required: "필수 값입니다.",
  tooLongString: "요청 데이터가 제한글자수를 넘었습니다.",
  onlyUseInt: "정수만 입력가능합니다.",
  dateFormat: "YYYYMMDD로 입력하세요.",
  serverError: "서버 에러가 발생하였습니다. 잠시 후 시도하여 주세요.",
};
