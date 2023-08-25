"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountsWithRoles = void 0;
const client_sso_1 = require("@aws-sdk/client-sso");
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
function getAccountsWithRoles(accessToken, region) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new client_sso_1.SSOClient({ region: region !== null && region !== void 0 ? region : process.env.AWS_REGION });
        const accounts = yield getAccounts(accessToken, client);
        const accountRoles = [];
        for (const account of accounts) {
            const roles = yield getRolesForAccount(account.accountId || "", accessToken, client);
            accountRoles.push({
                accountId: account.accountId || "",
                accountName: account.accountName || "",
                roles
            });
            yield sleep(500);
        }
        return accountRoles;
    });
}
exports.getAccountsWithRoles = getAccountsWithRoles;
function getAccounts(accessToken, client) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const accountInfos = [];
            let nextToken;
            do {
                const command = new client_sso_1.ListAccountsCommand({ accessToken, nextToken });
                const response = yield client.send(command);
                if (response.accountList) {
                    accountInfos.push(...response.accountList);
                }
                nextToken = response.nextToken;
            } while (nextToken);
            if (accountInfos.length > 0) {
                return accountInfos;
            }
            console.log("Warning. No accounts found which are assigned to you. Contact your administrator.");
            process.exit(1);
        }
        catch (error) {
            console.log("Error getting accounts.");
            process.exit(1);
        }
    });
}
function getRolesForAccount(account, accessToken, client) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const roleList = [];
            let nextToken;
            do {
                const command = new client_sso_1.ListAccountRolesCommand({ accessToken, accountId: account, nextToken });
                const response = yield client.send(command);
                if (response.roleList) {
                    roleList.push(...response.roleList);
                }
                nextToken = response.nextToken;
            } while (nextToken);
            const roles = [];
            if (roleList.length > 0) {
                roleList.forEach(role => {
                    if (role.roleName) {
                        roles.push(role.roleName);
                    }
                });
                return roles;
            }
            console.log("No IAM roles found for assigned accounts. Contact your administrator.");
            process.exit(1);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("429")) {
                    console.log("Error getting roles. Too many requests against AWS SSO API. Please try again later.");
                }
                else {
                    console.log("Error getting roles. " + error.message);
                }
            }
            process.exit(1);
        }
    });
}
//# sourceMappingURL=sso.js.map