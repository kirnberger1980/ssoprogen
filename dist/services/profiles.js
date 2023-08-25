"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.populateAwsConfigFile = exports.generateProfiles = void 0;
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const HOME_DIR = os.homedir();
function generateProfiles(ssoRegion, startUrl, accountRoles, profileRegion, defaultRole, ssoSessionName) {
    let profiles = getSessionProfile(ssoRegion, startUrl, ssoSessionName);
    accountRoles.forEach(accountRole => {
        profiles += getAssumeProfile(accountRole, profileRegion, defaultRole, ssoSessionName) + "\n";
    });
    return profiles;
}
exports.generateProfiles = generateProfiles;
function getSessionProfile(region, startUrl, ssoSessionName) {
    const sessionName = ssoSessionName || "sso";
    let sessionProfile = `[sso-session ${sessionName}]\n`;
    sessionProfile += `sso_start_url=${startUrl}\n`;
    sessionProfile += `sso_region=${region}\n`;
    sessionProfile += "sso_registration_scopes=sso:account:access\n\n";
    sessionProfile += "[default]\n";
    sessionProfile += `sso_session=${sessionName}\n\n`;
    return sessionProfile;
}
function getAssumeProfile(accountRoles, profileRegion, defaultRole, ssoSessionName) {
    if (!(accountRoles.roles.find(role => role.toLowerCase().includes(defaultRole.toLowerCase())))) {
        console.log(`Default role ${defaultRole} not found in account ${accountRoles.accountName}. Exiting...`);
        process.exit(1);
    }
    return accountRoles.roles.map(role => {
        let assumeProfile;
        const rolePrefix = role.toLocaleLowerCase().match(/(.*?)(?=role)/);
        if (role.toLocaleLowerCase() === defaultRole.toLocaleLowerCase()) {
            assumeProfile = `[profile ${accountRoles.accountName}]\n`;
        }
        else {
            assumeProfile = `[profile ${accountRoles.accountName}-${rolePrefix ? rolePrefix[1] : role.toLocaleLowerCase()}]\n`;
        }
        assumeProfile += `sso_session=${ssoSessionName || "sso"}\n`;
        assumeProfile += `sso_account_id=${accountRoles.accountId}\n`;
        assumeProfile += `sso_role_name=${role}\n`;
        assumeProfile += `region=${profileRegion}\n`;
        assumeProfile += "output=json\n";
        assumeProfile += "cli_pager=cat\n";
        return assumeProfile;
    }).join("\n");
}
function populateAwsConfigFile(profiles) {
    const configFile = `${HOME_DIR}/.aws/config`;
    try {
        fs.writeFileSync(configFile, profiles, { encoding: "utf8" });
        console.log(`Successfully populated config file ${configFile}.`);
    }
    catch (error) {
        console.log("Error populating config file.");
        process.exit(1);
    }
}
exports.populateAwsConfigFile = populateAwsConfigFile;
//# sourceMappingURL=profiles.js.map