import { ListAccountsCommand, ListAccountRolesCommand, SSOClient, AccountInfo } from "@aws-sdk/client-sso";
import { AccountRoles } from "../types/sso";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function getAccountsWithRoles(accessToken: string, region?: string) : Promise<AccountRoles[]> {
  const client = new SSOClient({ region: region ?? process.env.AWS_REGION });
  const accounts = await getAccounts(accessToken, client);
  const accountRoles = [];
  for (const account of accounts) {
    const roles = await getRolesForAccount(account.accountId || "", accessToken, client);
    accountRoles.push({
      accountId: account.accountId || "",
      accountName: account.accountName || "",
      roles
    });
    await sleep(200);
  }
  return accountRoles;
}

async function getAccounts(accessToken: string, client: SSOClient) {
  try {

    const accountInfos : AccountInfo[] = [];
    let nextToken;
    do {
      const command: ListAccountsCommand = new ListAccountsCommand({ accessToken, nextToken });
      const response = await client.send(command);
      if (response.accountList) {
        accountInfos.push(...response.accountList);
      }
      nextToken = response.nextToken;
    } while (nextToken);
    if (accountInfos.length > 0) {
      return accountInfos;
    }
    console.log("🟡 Warning. No accounts found which are assigned to you. Contact your administrator.");
    process.exit(1);
  } catch (error) {
    console.log("❌ Error getting accounts.");
    process.exit(1);
  }
}

async function getRolesForAccount(account: string, accessToken: string, client: SSOClient) {
  try {
    const roleList = [];
    let nextToken;
    do {
      const command: ListAccountRolesCommand = new ListAccountRolesCommand({ accessToken, accountId: account, nextToken });
      const response = await client.send(command);
      if (response.roleList) {
        roleList.push(...response.roleList);
      }
      nextToken = response.nextToken;
    } while (nextToken)
    const roles: string[] = [];
    if (roleList.length > 0) {
      roleList.forEach(role => {
        if (role.roleName) {
          roles.push(role.roleName);
        }
      });
      return roles;
    }
    console.log("❌ No IAM roles found for assigned accounts. Contact your administrator.");
    process.exit(1);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("429")) {
        console.log("❌ Error getting roles. Too many requests against AWS SSO API. Please try again later.");
      } else {
        console.log("❌ Error getting roles. " + error.message);
      }
    }
    process.exit(1);
  }
}