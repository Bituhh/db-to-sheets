# DB To Sheets

## Introduction

### Purpose

The purpose of this document is to build a system to help report data from a database to a Google Sheets at a scheduled
time.

### Intended Audience & Reading Suggestions

The project is intended to be used within Cordant Group as a support tool to help users report data from a database (
MySql or Postgresql) to a Google Sheet. It is intended for users with knowledge of database queries, store procedure and
database user permissions, as previous setup is required outside the scope of this project.

### Scope

The purpose of tools is to allow the user to easily add new reports, and manage those reports. The user will only need
to provide the remote DB access details, stored procedure name, time to schedule the report, and destination sheet and
name once, and the system will be able repeatedly report the information retrieved from the remote DB to the destination
sheet.

### Definitions & Acronyms

| Abbreviation | Definition   |
|--------------|--------------|
| DB           | Database     |
| GS           | Google Sheet |
| psql         | Postgresql   |

## Overall Description

### User Needs

### Assumptions & Dependencies

- The DB user will have access to the stored procedure and any relevant table/sequences/index that it needs.
- Only Postgres and MySql relational database servers will be used.
- A report will only have one destination spreadsheet but no limits in sheets within the spreadsheet.
- A report will consist of multiple items, where each item will have a single store procedure and a single destination
  within the same spreadsheet.
- A report item will have a dynamic number of rows.
- A report item will have a static number of columns, predefined beforehand when configuring the report.

## System Features & Requirements

### Functional Requirements

- Report running at scheduled time.

### External Interface Requirements

### System Features

### Nonfunctional Requirements

- UI to manage the reports
- Storage of DB user information in SSM for secure access
