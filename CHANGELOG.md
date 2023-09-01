# Change Log

## Released

## 1.0.1

## Features

- Generate an AWS Profile file to `stdout` with the `-c` flag.
- Generate an AWS Profile file and populate it to your `~/.aws/config` with `-p` flag. Backup of your old configuration is created.
- Specify a name of the sso session in your AWS profile file with option `-n <your session name>`
- Specify an AWS Region for your AWS Profiles with option `-r <region>` if it differs from the AWS SSO Region.
- Specify a default IAM Role with option `-d <defaultRole>`, if you have multiple Roles in an AWS Account. The default role will be used in the profile named by your AWS Account without a suffix.
### Added

- Initial Version for `ssoprogen` CLI tool.