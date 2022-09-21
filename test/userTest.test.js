/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const request = require("supertest");
const { sequelize } = require("../db");
const should = require("should");
const testData = require("./userTestData.js");
const app = require("../app");

beforeAll(async () => {
  await sequelize.sync();
});

// post/api/users 테스트
describe("POST api/users는", () => {
  describe("성공 시 ", () => {
    test("상태코드 201과 생성된 userId 반환한다.", (done) => {
      request(app)
        .post("/api/users")
        .send(testData.userInfo)
        .expect(201)
        .end((err, res) => {
          res.body.should.instanceof(Object);
          done();
        });
    });
  });

  describe("실패 시 ", () => {
    test("이미 존재하는 email의 경우 400으로 응답한다.", (done) => {
      request(app)
        .post("/api/users")
        .send(testData.conflictUserInfo)
        .expect(400)
        .end(() => {
          done();
        });
    });
    test("요청데이터에 빈값이 있을 경우 400으로 응답한다.", (done) => {
      request(app)
        .post("/api/users")
        .send(testData.nullInfo)
        .expect(400)
        .end(() => {
          done();
        });
    });
    test("nick의 길이가 15 이상일 경우 400으로 응답한다.", (done) => {
      request(app)
        .post("/api/users")
        .send(testData.nickTooLongInfo)
        .expect(400)
        .end(() => {
          done();
        });
    });
    test("email의 길이가 25 이상일 경우 400으로 응답한다.", (done) => {
      request(app)
        .post("/api/users")
        .send(testData.emailTooLongInfo)
        .expect(400)
        .end(() => {
          done();
        });
    });
    test("email 형식이 아닐 경우 400으로 응답한다.", (done) => {
      request(app)
        .post("/api/users")
        .send(testData.wrongEmailInfo)
        .expect(400)
        .end(() => {
          done();
        });
    });
    test("password의 길이가 8 ~ 16, 숫자, 대소문자, 특수문자를 포함하지 않는 경우 400으로 응답한다.", (done) => {
      request(app)
        .post("/api/users")
        .send(testData.wrongPasswordInfo)
        .expect(400)
        .end(() => {
          done();
        });
    });
  });
});

// get/api/users/:userId 테스트
describe("GET api/users/:userId는", () => {
  describe("성공 시 ", () => {
    test("상태코드 200과 유저의 보스레이드 기록을 반환한다.", (done) => {
      request(app)
        .get("/api/users/:k5yHK7ckWyFMD0clH_re3")
        .expect(200)
        .end((err, res) => {
          console.log(res.body);
          res.body.should.instanceof(Object);
          done();
        });
    });
  });

  describe("실패 시 ", () => {
    test("userId를 입력하지 않은 경우 400으로 응답한다.", (done) => {
      request(app)
        .get("/api/users")
        .expect(400)
        .end(() => {
          done();
        });
    });
    test("userId의 길이가 50 이상이면 400으로 응답한다.", (done) => {
      request(app)
        .get(`/api/users/:${testData.userIdTooLong}`)
        .expect(400)
        .end(() => {
          done();
        });
    });
  });
});

afterAll(async () => {
  await sequelize.sync({ force: true });
});
