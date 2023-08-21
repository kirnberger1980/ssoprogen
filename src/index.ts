#! /usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { getSsoDetails } from "./services/sso-oidc";
import * as figlet from "figlet";
import { getAccountsWithRoles } from "./services/sso";
import { generateProfiles, populateAwsConfigFile } from "./services/profiles";

console.log(chalk.cyan(figlet.textSync("SSO Profile Generator")));

const program = new Command();

program
  .version("Version " + chalk.green("1.0.0"),"--version")
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
  getSsoDetails().then((ssoDetails) => {
    const profileRegion : string | undefined = options.r || ssoDetails.region;
    if (!profileRegion) {
      console.log("No region provided. Please provide a region with -r or --region or set env $AWS_REGION.");
      process.exit(1);
    }
    getAccountsWithRoles(ssoDetails.accessToken, profileRegion).then((accountsWithRoles) => {
      const profiles = generateProfiles(ssoDetails.region, ssoDetails.startUrl, accountsWithRoles, profileRegion, options.d || "", options.n);
      if (options.create) {
        console.log(profiles);
      } else {
        populateAwsConfigFile(profiles);
      }
    });
  });
}