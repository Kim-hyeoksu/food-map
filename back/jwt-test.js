const jwt = require("jsonwebtoken");

const secret = "this is mt secret"
const token = jwt.sign(
        { userIdx: 100, nickname: "김혁수" }, // payload 정의
        secret // 서버 비밀키
      );

console.log(token);

const verifiedToken = jwt.verify(token, secret)
console.log(verifiedToken)