import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { OidcCredentials, SsoDetails } from "../types/sso-oidc";

const HOME_DIR = os.homedir();

/**
 * Retrieves AWS SSO session details
 */
export async function getSsoDetails() {
  const credentialsDir = `${HOME_DIR}/.aws/sso/cache`;
  let ssoDetails: SsoDetails;
  try {
    const credentialsArray = await loadCredentialFiles(credentialsDir);
    const activeCredentials = getActiveCredentials(credentialsArray);
    const { accessToken, region, startUrl } = activeCredentials;
    if (!accessToken || !region || !startUrl) {
      throw new Error("No valid credentials found");
    }
    ssoDetails = {
      accessToken,
      region,
      startUrl
    }
  } catch (error) {
    console.log("Error getting credentials. Please run 'aws sso login' first.");
    process.exit(1);
  }
  return ssoDetails;
}

/**
 * Loads all credential files from the given directory
 * @param credentialsDir the directory to load the credentials from
 * @returns an array of credentials
 */
async function loadCredentialFiles(credentialsDir: string): Promise<OidcCredentials[]> {
  const credentials: OidcCredentials[] = [];
  try {
    fs.accessSync(credentialsDir, fs.constants.F_OK);
    const files = fs.readdirSync(credentialsDir);
    const jsonFiles = files.filter((file) => path.extname(file).toLowerCase() === ".json");
    for (const file of jsonFiles) {
      const filePath = path.join(credentialsDir, file);
      const jsonData = fs.readFileSync(filePath, "utf8");
      const parsedData = JSON.parse(jsonData) as OidcCredentials;
      credentials.push(parsedData);
    }
    if (credentials.length === 0) {
      throw new Error("No credentials found");
    }
  } catch (error) {
    console.error("Error loading credentials");
    throw error;
  }
  return credentials;
}

/**
 * Retrieves a valid & non-expired credentials file
 * @param {OidcCredentials} credentialFiles
 * @returns the token
 */
function getActiveCredentials(credentialFiles: OidcCredentials[]): OidcCredentials {
  const found = credentialFiles.find((credentialFile) => {
    const expiresAt = new Date(credentialFile.expiresAt).getTime();
    if (expiresAt > Date.now()) {
      return credentialFile.accessToken;
    }
  })
  if(found && found.accessToken) {
    return found;
  }
  throw new Error("No valid access token found");
}