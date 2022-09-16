const express = require("./config/express");    //config/express.js 
const { logger } = require("./config/winston"); //log 찍기

const port = 3000;
express().listen(port); //express 실행
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);
 