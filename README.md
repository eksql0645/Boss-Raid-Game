# 목차
[BossRaid Game Service](#-BossRaid-Game-Service)

[요구사항 분석](#-요구사항-분석)

[모델링](#-모델링)

[API 문서](#-API-문서)

[테스트 케이스](#-테스트-케이스)

[컨벤션](#-컨벤션)

[디렉토리 구조](#-디렉토리-구조)

[패키지](#-패키지)

[기술 스택](#-기술-스택)

[문제 해결 과정](#-문제-해결-과정)

# 🚩 BossRaid Game Service

보스레이드 게임 서비스입니다.

## ✔ 간단 기능 설명

- 유저 생성이 가능합니다.
- 유저의 보스레이드 참여기록 및 점수를 조회할 수 있습니다.
- 보스레이드 전체 랭킹 및 유저의 랭킹 조회가 가능합니다.
- 보스레이드 시작 전 보스레이드 입장 여부를 확인할 수 있습니다.
- 보스레이드는 한 명의 유저만 참여가능합니다.
- 레벨에 따른 보스레이드 참가가 가능합니다.
- 제한시간 3분 초과 시 보스레이드가 종료됩니다.
- 보스레이드 정상 종료 시 레벨에 따른 점수가 유저의 totalScore에 누적됩니다.

# ✅ 요구사항 분석

- URI는 api/users와 api/bossraids로 나누었습니다.
- 모든 id는 nanoid를 사용하였습니다.
- 레디스에 연결 후, 필요한 레디스 데이터들을 미리 초기화하도록 구현했습니다.

## ✔ 유저 생성

1. 유저 생성 시 제공된 API문서에는 req.body에 아무것도 보내지 않았지만, 게임 특성 상 닉네임, 이메일, 비밀번호가 필요하다고 생각하여 추가했습니다.
2. 비밀번호는 bcrypt를 통해 해쉬화하여 보안을 강화하였고, validator로 특수문자, 숫자, 영문과 글자수 제한을 두었습니다.
3. 이메일을 통해 가입 이력을 확인하여 중복 가입을 방지하였습니다.
4. totalScore는 default값으로 0을 설정해두었고 보스레이드 게임 정상 종료 시 값이 누적됩니다.
5. 유저가 생성되면 nanoid로 만들어진 userId를 반환합니다.
 
## ✔ 유저의 보스레이드 기록 조회 (유저 조회)

1. user와 bossRaidHistory 모델 간의 일대다 관계를 설정하였습니다.
2. user모델에서 totalScore를 가져오고, 관계쿼리를 사용해 bossRaidHistory모델에서 유저의 보스레이드 기록을 가져왔습니다.

## ✔ 랭킹 조회

1. user모델의 totalScore를 DENSE_RANK함수를 사용하여 내림차순 정렬해서 전체랭킹을 조회하였습니다.
2. 랭킹이 실시간 업뎃이 아닌 특정 시간 간격을 두고 업데이트가 된다고 해석하였기 때문에 전체랭킹의 경우 DB에서 조회 및 레디스에 캐싱하도록 구현하여 DB를 통해 조회하는 횟수를 줄이고, 빠른 조회가 가능하도록 하였습니다.
3. 랭킹조회 요청이 들어오면 먼저 레디스에 캐싱된 데이터가 있는지 확인하고 없다면 DB조회하는 방식의 cache aside pattern으로 구현하기 위해 레디스에 저장한 데이터에 12시간 캐싱 기간을 설정하였습니다. 
4. 개개인의 랭킹은 다르기 때문에 개인랭킹은 DB를 통해 조회하고, 전체랭킹과 개인랭킹을 합쳐서 응답으로 보내도록 구현하였습니다. 
5. 이렇게 구현할 경우 개인랭킹과 전체랭킹 사이의 차이가 발생하여 유저에게 전체랭킹은 12시간 간격으로 업데이트된다는 알림말을 제공해야 합니다.
6. 전체랭킹, 개인랭킹 요청 시 랭킹리스트가 나오지 않는다면, 서버에러라고 생각하여 서버에러 커스텀 메세지와 보안을 위해 500 대신 400에러를 보내도록 했습니다. 

## ✔ 보스레이드 상태 조회

1. 보스레이드 상태조회만 하고 게임 시작을 하지 않을 수도 있다고 생각하여 몇 명의 유저든 동시에 상태 조회가 가능하다고 생각하였습니다.
2. 따라서 이부분에 동시성 제어를 하지는 않았습니다.
3. 만약 누군가가 게임을 시작한다면 canEnter를 false로 수정하도록 구현하였습니다.
4. 상태 조회의 경우, 시작과 종료에 따라 데이터가 빈번하게 수정 및 조회되어 Redis에 저장하였습니다.

## ✔ 보스레이드 시작

1. 보스레이드 시작 전 canEnter가 false인지 확인 후 true일 경우 게임을 시작합니다.
2. 게임 시작 전 userId를 통해 존재하는 유저인지, 요청된 level과 일치하는 level이 존재하는지 확인합니다.
3. enterTime은 moment.js를 통해 시작 기준으로 시간을 지정합니다.
4. 보스레이드 시작 시 한명의 유저가 시작요청을 했을 경우, 다른 유저가 요청하지 못하도록 Redis의 watch함수를 사용하여 요청 시 변경되는 데이터의 키에 동시성 제어 처리를 하였습니다.
5. 정상 시작이 되면 isEntered: true와 raidRecordId를 응답으로 보냅니다.

## ✔ 보스레이드 종료

1. 종료된 보스레이드에 중복 요청을 할 수 있기 때문에 raidRecordId로 종료된 보스레이드인지 확인 후 레디스에 저장된 데이터를 리셋하였습니다. 
2. 요청정보와 입장한 보스레이드 정보(userId, raidRecordId)와 일치하는지 확인 후 예외처리하였습니다.
3. moment.js로 endTime과 enterTime의 차이를 구하고 그 시간이 제한시간을 초과한다면 예외처리 하였습니다. 예외처리 후 보스레이드가 종료되도록 레디스에 저장된 데이터를 리셋했습니다.
4. 보스레이드가 정상종료된다면 유저의 totalScore에 점수를 누적시키고 보스레이드의 데이터를 리셋하였습니다.

## ✔ validator / error middleware / errorCodes
1) API 중 요청 데이터를 가진 경우 validator를 통해 유효성 검사를 진행하였습니다.
2) 모든 API는 에러를 던지면 error middleware가 받아서 처리를 합니다.
3) errorCodes로 각각의 에러에 맞게 에러 메세지를 커스텀했습니다.

# 🛠 모델링

**user**

| 필드명 | 데이터 타입 | 설명 |
| --- | --- | --- |
| id | varchar | PK |
| nick | varchar | 닉네임 |
| email | varchar | 이메일 |
| password | varchar | 비밀번호 |
| totalScore | varchar | 보스레이드 총 점수 |

**bossRaidHistory**

| 필드명 | 데이터 타입 | 설명 |
| --- | --- | --- |
| raidRecordId | varchar | PK |
| score | int | 점수 |
| enterTime | varchar | 시작시간 |
| endTime | varchar | 종료시간 |
| userId | varchar | FK |

**Redis**

| 필드명 | 데이터 타입 | 설명 |
| --- | --- | --- |
| bossraidId | varchar | PK |
| limitSeconds | int | 제한시간 |
| level | int | 레벨 |
| score | int | 점수 |

| 필드명 | 데이터 타입 | 설명 |
| --- | --- | --- |
| canEnter | boolean | 입장가능여부 |
| enteredUserId | varchar | 입장한 유저 id |

## ✏ ERD
![image](https://user-images.githubusercontent.com/80232260/191547002-4df9f3dc-bae7-4cca-a325-be3d5430447e.png)

# 📑 API 문서
npm start 후 http://localhost:8080/api-docs

혹은
[swagge PDF 문서](https://github.com/eksql0645/Boss-Raid-Game/files/9618105/screencapture-localhost-8080-api-docs-2022-09-20-21_16_22.pdf)

# 📜 테스트 케이스
- 유닛테스트는 jest / 통합 테스트는 superTest로 진행하였습니다.

![image](https://user-images.githubusercontent.com/80232260/191554992-b0d5d116-4181-4e30-b317-8555eb50a3c3.png)

![image](https://user-images.githubusercontent.com/80232260/191555031-b185c7c7-3162-424d-b258-2a441b0676da.png)

![image](https://user-images.githubusercontent.com/80232260/191555327-e686a555-5f85-4228-a2a2-5d794f585bd5.png)

![image](https://user-images.githubusercontent.com/80232260/191555084-e47ec8e6-e47d-41ce-9d1e-4315926464c5.png)


# 💡 컨벤션

### ✔ camelCase / PascalCase

- **파일, 생성자, 변수, 메서드명**은 **camelCase**를 사용합니다.
- **클래스명**은 **PascalCase**를 사용합니다.

### ✔ Lint 규칙

| 들여쓰기 2칸 | 탭 사용 x |
| --- | --- |
| double quote 사용. | commonJS 사용 |
| 마지막 콤마 사용 | 한줄 최대 글자수: 80 |
| var는 사용하지 않습니다. | 세미 콜론 사용을 허용합니다. |

### ✔ branch명

- 대문자 금지 / 언더바 금지
- ‘-’ 사용
- 초기 설정은 master 브랜치에 설정
    - 초기설정에는 패키지 설치 / DB 설정 / 폴더구조까지 포함합니다.
- 브랜치 나누기 전에 이슈 생성하기
- 구현할 기능별/ 문서 / 테스트 별로 브랜치 나누기

| 기능  | 브랜치명 |
| --- | --- |
| 유저 생성  | feature/create-user |
| 유저 조회 | feature/get-user |
| 보스레이드 상태 조회 | feature/get-bossraid |
| 보스레이드 시작 (기록 생성) | feature/create-bossraid-record |
| 보스레이드 종료 | feature/set-bossraid |
| 랭킹 조회 | feature/get-ranking |
| 리팩토링 | feature/refactoring |
| 테스트 | feature/test |

### ✔ Issue 템플릿

Issue 제목
(브랜치명) | (이슈 간략 설명) / feature/create-user | create user

Issue 내용
```text
### Issue 타입(하나 이상의 Issue 타입을 선택해주세요)
-[] 기능 추가
-[] 기능 삭제
-[] 버그 수정
-[] 의존성, 환경 변수, 빌드 관련 코드 업데이트
-[] 테스트 추가
-[] 리팩토링

### 상세 내용
ex) Github 소셜 로그인 기능이 필요합니다.

### 참고 사항
```

### ✔ Git commit

![image](https://user-images.githubusercontent.com/80232260/188366205-84d8a796-3c51-4eb0-bb29-3a61c96bb047.png)

[깃 커밋 컨벤션 참고 사이트](https://overcome-the-limits.tistory.com/entry/협업-협업을-위한-기본적인-git-커밋컨벤션-설정하기)

# 🗂 폴더 구조

1) 기본적인 폴더구조는 routers - services - models로 3-Layer architecture화하였습니다.
2) db - models: 시퀄라이즈 모델링과 db 설정파일로 구성되었습니다.
3) middlewares: validator와 error middleware, redis로 구성되었습니다.
4) utils: errorCodes와 기능별로 모듈화한 함수들로 구성되었습니다.

```
├─db
│  └─models
├─middlewares
│  └─validator
├─models
├─routers
├─services
├─test
└─utils
```

# ⚙ 패키지

```json
{
  "name": "boss-raid-game",
  "version": "1.0.0",
  "description": "보스레이드 게임 서비스입니다.",
  "main": "server.js",
  "scripts": {
    "test": "jest",
    "start": "nodemon server.js"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/eksql0645/Boss-Raid-Game.git"
  },
  "author": "JKS",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/eksql0645/Boss-Raid-Game/issues"
  },
  "homepage": "https://github.com/eksql0645/Boss-Raid-Game#readme",
  "dependencies": {
    "bcrypt": "^5.0.1",
    "cors": "^2.8.5",
    "express": "^4.18.1",
    "express-validator": "^6.14.2",
    "moment": "^2.29.4",
    "morgan": "^1.10.0",
    "mysql2": "^2.3.3",
    "nanoid": "^3.3.4",
    "redis": "^4.3.1",
    "request-promise": "^4.2.6",
    "sequelize": "^6.21.4"
  },
  "devDependencies": {
    "@babel/eslint-parser": "^7.18.9",
    "dotenv": "^16.0.2",
    "eslint": "^8.23.0",
    "eslint-config-prettier": "^8.5.0",
    "eslint-plugin-prettier": "^4.2.1",
    "jest": "^29.0.3",
    "nodemon": "^2.0.19",
    "prettier": "^2.7.1",
    "sequelize-cli": "^6.4.1",
    "should": "^13.2.3",
    "supertest": "^6.2.4",
    "swagger-jsdoc": "^6.2.5",
    "swagger-ui-express": "^4.5.0"
  }
}

```

# ⚡ 기술 스택
<img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white"> <img src="https://img.shields.io/badge/express-FCC624?style=for-the-badge&logo=express&logoColor=white"> <img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
<img src="https://img.shields.io/badge/git-F05032?style=for-the-badge&logo=git&logoColor=white"> <img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white"> <img src="https://img.shields.io/badge/Sequelize-007396?style=for-the-badge&logo=Sequelize&logoColor=white">
<img src="https://img.shields.io/badge/Swagger-61DAFB?style=for-the-badge&logo=Swagger&logoColor=white"> <img src="https://img.shields.io/badge/Jest-181717?style=for-the-badge&logo=Jest&logoColor=white">

# ✋ 문제 해결 과정
1️⃣ 랭킹쿼리

랭킹쿼리에서 겪은 문제는 rank를 어떻게 0번부터 시작하는지였습니다. 구글링을 통해 변수를 사용하는 방법이 있었는데 다양하게 시도해보았지만 계속 에러가 나서 결국엔 적용하지 못했습니다. 랭킹은 DENSE_RANK()를 사용해서 같은 점수를 가진 유저는 동일한 랭킹번호를 갖도록 설정하였습니다. 처음에는 전체랭킹조회를 하고 같은 메서드에서 userId를 통해 유저 랭킹을 조회했는데 cache asdie 패턴을 적용하면서 생각해보니 레디스에 DB 조회를 한 값이 저장되버리면 전체조회는 동일해도 되지만 유저랭킹조회도 그대로 저장이 되버려서 유저가 바뀌더라도 값은 동일하다는 문제가 생겼습니다. cache aside는 단건조회에는 좋지 않고 다수의 조회 요청이 있을 때 사용하는 것이 장점인데, 이 경우 랭킹조회는 여러명의 유저가 같은 데이터를 조회하기 때문에 다수의 조회라고 생각했지만 유저조회의 경우는 유저 당 자신의 랭킹을 한번 조회하는 것이기 때문에 단건의 가깝다고 생각했습니다. 그리고 유저들의 개인 랭킹을 전부 레디스에 저장할 수는 없다고 생각하여 유저랭킹조회 메서드를 따로 만들어서 분리시킨 후 라우터에서 합쳐서 응답을 보냈습니다. 또한, cache aside 패턴 적용을 위해 레디스에 저장한 전체랭킹데이터에 12시간의 만료기간을 설정했고 get 요청이 들어왔을 때, 레디스에 전체랭킹데이터가 있는지 확인한 후 없다면 DB조회를 통해 레디스에 데이터를 업데이트하도록 했습니다. 원래는 배치프로세스를 사용할 예정이었지만 레디스에서 캐싱 기간을 설정하는 함수가 있어서 간단하게 해결되었습니다.

2️⃣ Redis

Redis를 처음 사용해보았기 때문에 사소한 문제들을 해결하느라 적용하는데 시간이 많이 걸렸습니다. 처음 설계 단계에서 어떤 데이터를 레디스에 저장할지에 대해서도 많은 고민이 있었습니다. 레디스에는 보스레이드 데이터와 입장가능 여부 데이터를 저장하였는데, 보스레이드 시작 전 상태조회를 할 때마다 DB에 요청하는 것보단 레디스를 통하는 것이 더 빠른 응답이 가능하다고 생각하였습니다. 한편으로는 게임의 이벤트성을 고려해서 레벨에 따른 스코어, 제한시간 변화, 추가 레벨, 경험치 두배, 추가 보스레이드 등이 업데이트될 가능성이 있다고 생각하는데 이벤트라는 것 자체가 기간제이고 데이터가 자주 변하지 않는다면 DB에 넣는 것이 맞지만 현재는 보스레이드가 하나여서 레디스에 저장해도 무관할 듯 하였고, 게임의 정보를 DB에 저장한 후 특정 시간마다 레디스에 캐싱하고 유저들은 레디스를 통해 게임데이터를 가져오면 더 빠른 로딩이 가능할 것 같아 보스레이드 데이터도 레디스에 저장하였습니다.

3️⃣ 동시성 이슈

레디스는 하나의 메모리이기 때문에 공유자원이라고 볼 수 있는데 이걸 여러명이 접근하면 동시성 오류가 생길 수 있기 때문에 레디스를 사용하는 API 중 어느 부분이 동시성 제한이 필요한지 생각하는데 많은 시간을 할애했습니다. 가장 유력했던 건 보스레이드 시작이었고 그다음은 보스레이드 상태조회였는데 위에도 언급했듯이 상태조회를 한다고 시작을 하는 것은 아니라고 생각하였고 상태조회는 get요청(읽기)이기 때문에 동시에 하여도 문제가 없다고 생각했습니다. 따라서, 둘 다 상태조회에서 true를 받더라도 누군가 먼저 시작요청을 했을 때, lock을 건다면 다음 유저는 시작요청을 하지 못할 것이고, 만약, lock을 걸지 않는다면 다음 요청을 한 유저도 canEnter를 true로 받았기 때문에 시작요청을 할 수 있다고 판단하여 이부분에서 lock을 걸도록 구현하였습니다.

🔆 이번 프로젝트를 통해 Redis를 사용해보고 동시성, 배치프로세스, 다양한 쿼리, jest에 대해 학습할 수 있었고, 생소한 게임 개발을 하면서 복잡하기도 하지만 새롭게 배워나가는 과정이 흥미로웠습니다.
