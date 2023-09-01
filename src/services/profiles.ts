import * as os from "os";
import * as fs from "fs";
import { AccountRoles } from "../types/sso";

const HOME_DIR = os.homedir();

export function   generateProfiles(ssoRegion: string, startUrl: string, accountRoles: AccountRoles[], profileRegion: string, defaultRole: string, ssoSessionName?: string) {
  let profiles = getSessionProfile(ssoRegion, startUrl, ssoSessionName);
  accountRoles.forEach(accountRole => {
    profiles += getAssumeProfile(accountRole, profileRegion, defaultRole, ssoSessionName) + "\n";
  });
  return profiles;
}

function getSessionProfile(region: string, startUrl: string, ssoSessionName?: string) {
  const sessionName = ssoSessionName || "sso";
  let sessionProfile = `[sso-session ${sessionName}]\n`;
  sessionProfile += `sso_start_url=${startUrl}\n`;
  sessionProfile += `sso_region=${region}\n`;
  sessionProfile += "sso_registration_scopes=sso:account:access\n\n";
  sessionProfile += "[default]\n";
  sessionProfile += `sso_session=${sessionName}\n\n`;
  return sessionProfile;
}

function getAssumeProfile(accountRoles: AccountRoles, profileRegion: string, defaultRole: string, ssoSessionName?: string) {
  if (!(accountRoles.roles.find(role => role.toLowerCase().includes(defaultRole.toLowerCase())))) {
    console.log(`Default role ${defaultRole} not found in account ${accountRoles.accountName}. Exiting...`);
    process.exit(1);
  }
  return accountRoles.roles.map(role => {
    let assumeProfile: string;
    const rolePrefix = role.toLocaleLowerCase().match(/(.*?)(?=role)/);
    if (role.toLocaleLowerCase() === defaultRole.toLocaleLowerCase()) {
      assumeProfile = `[profile ${accountRoles.accountName}]\n`;
    } else {
      assumeProfile = `[profile ${accountRoles.accountName}-${rolePrefix ? rolePrefix[1] : role.toLocaleLowerCase()}]\n`;
    }
    assumeProfile += `sso_session=${ssoSessionName || "sso"}\n`;
    assumeProfile += `sso_account_id=${accountRoles.accountId}\n`;
    assumeProfile += `sso_role_name=${role}\n`;
    assumeProfile += `region=${profileRegion}\n`;
    assumeProfile += "output=json\n"
    assumeProfile += "cli_pager=cat\n"
    return assumeProfile;
  }).join("\n");
}

export function populateAwsConfigFile(profiles: string) {
  const configFile = `${HOME_DIR}/.aws/config`;
  const bakFile = `${HOME_DIR}/.aws/config.${Date.now()}`;
  fs.renameSync(configFile, bakFile);
  console.log(`💾 Backed up existing config file to ${bakFile}.\n`);
  try {
    fs.writeFileSync(configFile, profiles, { encoding: "utf8" });
    console.log(`✅ Successfully populated config file ${configFile}.`);
  } catch (error) {
    console.log("❌ Error populating config file.");
    process.exit(1);
  }
}