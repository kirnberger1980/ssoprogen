#! /usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const sso_oidc_1 = require("./services/sso-oidc");
const figlet = __importStar(require("figlet"));
const sso_1 = require("./services/sso");
const profiles_1 = require("./services/profiles");
console.log(chalk_1.default.cyan(figlet.textSync("SSO Profile Generator")));
const program = new commander_1.Command();
program
    .version("Version " + chalk_1.default.green("1.0.0"), "--version")
    .description("A CLI for generating Configuration File with AWS SSO Profiles for AWS CLI etc. based on AWS SSO.")
    .option("-c, --create", "Print a configuration File with AWS SSO Profiles for AWS CLI.")
    .option("-p, --populate", "Populate a configuration File with AWS SSO Profiles for AWS CLI in ~/.aws/config.")
    .option("-r <region>, --region <region>", "The region to use for the configuration file. Defaults to SSO Region.")
    .option("-n <name>,--sso-session-name <name>", "The SSO Session Name to use for the configuration file. Defaults to sso.")
    .option("-d <defaultRole>,--default-role <defaultRole>", "The default role to use for the configuration file. The role name will not be appended in the profile name.")
    .parse(process.argv);
// load arguments
const options = program.opts();
if (options.create || options.populate) {
    (0, sso_oidc_1.getSsoDetails)().then((ssoDetails) => {
        const profileRegion = options.r || ssoDetails.region;
        if (!profileRegion) {
            console.log("No region provided. Please provide a region with -r or --region or set env $AWS_REGION.");
            process.exit(1);
        }
        (0, sso_1.getAccountsWithRoles)(ssoDetails.accessToken, profileRegion).then((accountsWithRoles) => {
            const profiles = (0, profiles_1.generateProfiles)(ssoDetails.region, ssoDetails.startUrl, accountsWithRoles, profileRegion, options.d || "", options.n);
            if (options.create) {
                console.log(profiles);
            }
            else {
                (0, profiles_1.populateAwsConfigFile)(profiles);
            }
        });
    });
}
//# sourceMappingURL=index.js.map