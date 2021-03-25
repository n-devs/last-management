const admin = require("firebase-admin");
const firebase = require("firebase");


require('firebase/auth');

const ServiceAccountKeyBlackboardAdmin = require("../config/ServiceAccountKeyBlackboardAdmin.json");
const ServiceAccountKeyBlackboard = require("../config/ServiceAccountKeyBlackboard.json");

async function connectService() {
    return await new Promise((resolve, reject) => {

        if (!admin.apps.length) {

            admin.initializeApp({
                credential: admin.credential.cert(ServiceAccountKeyBlackboardAdmin),
                databaseURL: "https://to-do-list-94aba-default-rtdb.firebaseio.com"
            });
        }

        if (!firebase.apps.length) {
            firebase.initializeApp({
                ...ServiceAccountKeyBlackboard
            });
        }

        resolve({
            admin: admin,
            firebase: firebase
        })

    })
}

module.exports = connectService