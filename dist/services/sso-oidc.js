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
exports.getSsoDetails = void 0;
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const HOME_DIR = os.homedir();
/**
 * Retrieves AWS SSO session details
 */
function getSsoDetails() {
    return __awaiter(this, void 0, void 0, function* () {
        const credentialsDir = `${HOME_DIR}/.aws/sso/cache`;
        let ssoDetails;
        try {
            const credentialsArray = yield loadCredentialFiles(credentialsDir);
            const activeCredentials = getActiveCredentials(credentialsArray);
            const { accessToken, region, startUrl } = activeCredentials;
            if (!accessToken || !region || !startUrl) {
                throw new Error("No valid credentials found");
            }
            ssoDetails = {
                accessToken,
                region,
                startUrl
            };
        }
        catch (error) {
            console.log("Error getting credentials. Please run 'aws sso login' first.");
            process.exit(1);
        }
        return ssoDetails;
    });
}
exports.getSsoDetails = getSsoDetails;
/**
 * Loads all credential files from the given directory
 * @param credentialsDir the directory to load the credentials from
 * @returns an array of credentials
 */
function loadCredentialFiles(credentialsDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const credentials = [];
        try {
            fs.accessSync(credentialsDir, fs.constants.F_OK);
            const files = fs.readdirSync(credentialsDir);
            const jsonFiles = files.filter((file) => path.extname(file).toLowerCase() === ".json");
            for (const file of jsonFiles) {
                const filePath = path.join(credentialsDir, file);
                const jsonData = fs.readFileSync(filePath, "utf8");
                const parsedData = JSON.parse(jsonData);
                credentials.push(parsedData);
            }
            if (credentials.length === 0) {
                throw new Error("No credentials found");
            }
        }
        catch (error) {
            console.error("Error loading credentials");
            throw error;
        }
        return credentials;
    });
}
/**
 * Retrieves a valid & non-expired credentials file
 * @param {OidcCredentials} credentialFiles
 * @returns the token
 */
function getActiveCredentials(credentialFiles) {
    const found = credentialFiles.find((credentialFile) => {
        const expiresAt = new Date(credentialFile.expiresAt).getTime();
        if (expiresAt > Date.now()) {
            return credentialFile.accessToken;
        }
    });
    if (found && found.accessToken) {
        return found;
    }
    throw new Error("No valid access token found");
}
//# sourceMappingURL=sso-oidc.js.map