"use strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import express from "express";
import cookieParser from 'cookie-parser';
import { cors, commonHeaders, handleErrorsDecorator, handleErrors } from "@ejfdelgado/ejflab-back/srv/Network.mjs";
import { MainHandler } from "@ejfdelgado/ejflab-back/srv/MainHandler.mjs";
import { checkAuthenticated, checkAuthenticatedSilent } from "@ejfdelgado/ejflab-back/srv/common/FirebasConfig.mjs";
import https from 'https'
import http from 'http'
import compression from 'compression';
import { Server } from "socket.io";
import { EmailHandler } from "@ejfdelgado/ejflab-back/srv/EmailHandler.mjs";
import { SocketIOCall } from "@ejfdelgado/ejflab-back/srv/SocketIOCall.mjs";

import { MyConstants } from "@ejfdelgado/ejflab-common/src/MyConstants.js";
import { FeedbackSrv } from "./srv/FeedbackSrv.mjs";

// Overwrite constants
MyConstants.overwriteEnvVariables();

const options = {}
let httpSrv = http;
if (process.env.USE_SECURE == "yes") {
    console.log("Using secure server...");
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    options.key = fs.readFileSync(path.join(__dirname, "cert/star_xx_com.key"));
    options.cert = fs.readFileSync(path.join(__dirname, "cert/star_xx_com.pem"));
    options.minVersion = "TLSv1.3"; //Try 1.3 or 1.2
    httpSrv = https;
}

const app = express();
const httpServer = httpSrv.createServer(options, app);
//const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    connectionStateRecovery: {
        // the backup duration of the sessions and the packets
        maxDisconnectionDuration: 2 * 60 * 1000,
        // whether to skip middlewares upon successful recovery
        skipMiddlewares: true,
    },
    cors: {
        //origin: "http://localhost:4200",
        origin: "*",
        methods: ["GET", "POST", "DELETE"],
    }
});

app.use(cors);
app.use(cookieParser());
app.use(compression());
//app.use(compression({ level: 0 })); 
/*
app.use(bodyParser.urlencoded({extended: true}));
*/
//app.use(bodyParser.raw());
app.use(MainHandler.addGetUrl);
app.use('/assets', express.static('src/assets', {
    etag: false,
    maxAge: '' + (1000 * 60 * 60 * 24)
}));

app.post("/srv/email/send", [commonHeaders, checkAuthenticatedSilent, express.json(), handleErrorsDecorator(EmailHandler.send)]);

// Configure api
FeedbackSrv.configure(app);

app.use("/", handleErrorsDecorator(MainHandler.handle));// Esto solo funciona sin el npm run angular

io.on('connection', SocketIOCall.handle(io));

// fuser 8081/tcp
// fuser -k 8081/tcp
const PORT = process.env.PORT || 8081;
httpServer.listen(PORT, () => {
    console.log(
        `App listening on http://localhost:${PORT} Press Ctrl+C to quit.`
    );
});

export default app;
