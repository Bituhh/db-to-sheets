# UI:

## Login

### Considerations

- Maybe one master user only.
- Google Authentication via federated ID to allowed anyone within the business to use the system as long as permission
  is given via Connect Admin.
- Login page allow for login only and not register, as user management can be done via the AWS console, since not many
  users will use the UI.
- Create the UI without any login and assume authenticated access to the API as the end solution will require the UI to
  be moved to other internal webapps.

## Reports

### Requirements

- Create Reports
  - Name
  - Description
  - Scheduled Time
  - DB Access Parameters
- List currently running reports
  - Name
  - Description
  - Scheduled Time
- Change report details
  - Name
  - Descriptions
  - Scheduled Time
- Delete Report

## DB Access Manager

### Requirements

- Create connections
  - DB Type
    - Postgres or MySql
  - Endpoint
  - Port
- List Connections
  - Name
  - User
  - Description
- Change Connection
  - Name
  - Description
  - Username
  - Password
    - Don't show old password
- Delete Connection

# API

## Functions

- Report
  - CreateReport:
    1. Create Report in database
    2. Create EventBridge Rule
    3. Attach Rule to EventBridge Target (Create using CDK) with the database report id as parameter or input
    4. Update Report on database to include the EventBridge Rule Identifier
  - GetReports:
    1. If parameter is passed return a single report item else return all data (must contain SSM parameter key in all
       returns)
  - UpdateReport:
    1. Retrieve report from database
    2. If changes affect the EventBridge Rule, delete and create a new Rule
    3. Update database to reflect changes
  - DeleteReport:
    1. Retrieve EventBridge Rule Identifier from database
    2. Delete EventBridge Rule
    3. Delete Report from database.
- Connection
  - CreateConnection:
    1. Create SSM Key???
    2. Store connection object into SSM
    3. Create connection record in database
  - GetConnections:
    1. Retrieve data from database
  - DeleteConnection:
    1. Delete SSM Parameter from AWS
    2. Delete report from database

# Docker (EventBridge Target):

## Process

1. Retrieve Report Info from database
2. Get DB Connection Data from SSM Parameters.
3. Retrieve Data from DB
4. Map data to a spreadsheet format (Type => (number | string)[][]);
5. Authenticate with Google OAuth.
6. Write data to spreadsheet.

## Classes

- Database:
  - \#connect(ssmParameter: string);
  - call(storedProcedureName: string);

- SecretManager:
  - getSecret()

- Spreadsheet:
  - \#connect(ssmParameter: string)
  - convertToSpreadsheetFormat(object: {[key: string]: number | string | boolean}[]): (string|number|boolean)[][]
  - writeToSpreadsheet(data);
