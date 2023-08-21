# SSO Profile Generator

This tiny CLI Tool helps you creating AWS Profiles based on your AWS SSO (AWS IAM Identity Center) Account Assignments. Especially if you have to manage plenty of AWS Accounts using various IAM Roles, `ssoprofilegen` will quickly create all neccessary profiles for your `~/.aws/config` file.

- [SSO Profile Generator](#sso-profile-generator)
  - [Prerequisites](#prerequisites)
  - [Usage](#usage)


## Prerequisites

In order to use `ssoprofilegen` properly , you need to have an access token, which is created by the the identity provider of AWS SSO. Therefore you need the initial configuration in your `~/.aws/config` file:

```properties
[sso-session sso]
sso_start_url=https://<your sso instance name>.awsapps.com/start
sso_region=<the region where your sso instane is provisioned>
sso_registration_scopes=sso:account:access

[default]
sso_session=sso
```

With this configuration you can now perform

```bash
aws sso login
```

This will open the browser and you have to authenticate against the identity provider from AWS SSO (AWS IAM Identity Center). For more details, follow the instructions on [Configure automatic token refresh](https://docs.aws.amazon.com/cli/latest/userguide/sso-configure-profile-token.html).

## Usage

There are two ways to create the neccesssary AWS profiles for your AWS CLI (`~/.aws/config`). With the following command you print out all available profiles for the user:

```bash
ssoprofilegen -c
```

You then have to copy the profiles manually in to your `~/.aws/config` file. Caution: The tool will create the sso session and the default profile as well. If you prefer to overwrite `~/.aws/config` file directly, then you can perform:

```bash
ssoprofilegen -p
```

If you have more than one IAM Role in an account, the profile name will be

```bash
<account name>-<role name without appending word role>
```

 in lower case.

 **Example:**

 Your account name is **machine-learning-dev** and you have a role **DataScientistRole** assigned for this account, then the profile would look like

 ```properties
[profile machine-learning-dev-datascientist]
sso_session=sso
sso_account_id=111111111111
sso_role_name=DataScientistRole
region=us-west-2
output=json
cli_pager=cat
 ```

**Hint:** If your region for your AWS profiles differs from the region of the SSO instance, you can simply provide the region as follows:

```bash
ssoprofilegen -p -r "eu-central-1"
```

Furthermore you have the following options:

```bash
user@yourhost>ssoprofilegen -h
  ____ ____   ___    ____             __ _ _         ____                           _             
 / ___/ ___| / _ \  |  _ \ _ __ ___  / _(_) | ___   / ___| ___ _ __   ___ _ __ __ _| |_ ___  _ __ 
 \___ \___ \| | | | | |_) | '__/ _ \| |_| | |/ _ \ | |  _ / _ \ '_ \ / _ \ '__/ _` | __/ _ \| '__|
  ___) |__) | |_| | |  __/| | | (_) |  _| | |  __/ | |_| |  __/ | | |  __/ | | (_| | || (_) | |   
 |____/____/ \___/  |_|   |_|  \___/|_| |_|_|\___|  \____|\___|_| |_|\___|_|  \__,_|\__\___/|_|   
                                                                                                  
Usage: ssoprofilegen [options]

A CLI for generating Configuration File with AWS SSO Profiles for AWS CLI etc. based on AWS SSO.

Options:
  --version                                      output the version number
  -c, --create                                   Print a configuration File with AWS SSO Profiles for AWS CLI.
  -p, --populate                                 Populate a configuration File with AWS SSO Profiles for AWS CLI in ~/.aws/config.
  -r <region>, --region <region>                 The region to use for the configuration file. Defaults to SSO Region.
  -n <name>,--sso-session-name <name>            The SSO Session Name to use for the configuration file. Defaults to sso.
  -d <defaultRole>,--default-role <defaultRole>  The default role to use for the configuration file. The role name will not be appended in the profile name.
  -h, --help                                     display help for command
```