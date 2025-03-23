# Jotter-drive API Documentation

![API Version](https://img.shields.io/badge/API%20Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

A comprehensive cloud storage API with file management, user authentication, and storage analytics features.

## Table of Contents

-  [Installation](#installation)
-  [Environment Variables](#environment-variables)
-  [API Endpoints](#api-endpoints)
   -  [Authentication](#authentication)
   -  [File Management](#file-management)
   -  [Folder Management](#folder-management)
   -  [User Management](#user-management)
-  [Specify The Api Work](#specific-api-explanation-of-use)
-  [Security](#security)
-  [License](#license)

## Features

-  **User Management**
   -  Email/password & Google authentication
   -  Password reset with OTP
   -  User profile management
-  **File Operations**
   -  File upload/download
   -  File renaming/copying
   -  Favorite management
   -  File organization with folders
-  **Storage Management**
   -  Storage quota enforcement
   -  Dashboard analytics
   -  File type statistics
-  **Security**
   -  JWT authentication
   -  Rate limiting
   -  Input validation

## Technical Stack

-  **Runtime**: Node.js
-  **Framework**: Express.js
-  **Database**: MongoDB
-  **Authentication**: JWT, OAuth2 (Google), Passport
-  **Validation**: Zod
-  **File Handling**: Multer
-  **Mailing**: Nodemailer + Google
-  **Documentation**: OpenAPI 3.0

## Installation

Clone the repository and install dependencies:

```sh
git clone https://github.com/your-repo/jotter-drive.git
cd jotter-drive
npm install
```

## Environment Variables

Create a `.env` file and add:

```env
PORT=4000
DATABASE_URL=mongodb://localhost:27017/jotterDrive
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=374436881254-iqbo2rp17oqe4lfjk373bb2kg6i1234v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
```

## Run locally

```sh
npm run start:dev
```

server will run on
http://localhost:4000

## API Endpoints

### Authentication

| Method | Endpoint                       | Description                   | Authentication |
| ------ | ------------------------------ | ----------------------------- | -------------- |
| POST   | `/auth/register`               | Register a new user           | ❌ No          |
| POST   | `/auth/login`                  | Login with email & password   | ❌ No          |
| GET    | `/auth/google`                 | Google Sign-In                | ❌ No          |
| POST   | `/auth/forget-password`        | Send OTP for password reset   | ❌ No          |
| POST   | `/auth/verify-password`        | Verify OTP for password reset | ❌ No          |
| PUT    | `/auth/change-forget-password` | Reset password using OTP      | ❌ No          |
| PUT    | `/user/change-password`        | Change user password          | ✅ Yes         |
| PUT    | `/user/update-user`            | Update user profile           | ✅ Yes         |
| PUT    | `/user/logout`                 | Logout user                   | ✅ Yes         |
| DELETE | `/user/delete-user`            | Delete user account           | ✅ Yes         |
| POST   | `/user/lock-folder`            | Access Lock folder            | ✅ Yes         |

### File Management

| Method | Endpoint                      | Description           | Authentication |
| ------ | ----------------------------- | --------------------- | -------------- |
| POST   | `/file/add-files`             | Upload a new file     | ✅ Yes         |
| GET    | `/file/get-files`             | Retrieve files        | ✅ Yes         |
| POST   | `/file/copy-file`             | Copy a file           | ✅ Yes         |
| PATCH  | `/file/rename`                | Rename a file         | ✅ Yes         |
| DELETE | `/file/delete/files/{fileId}` | Delete a file         | ✅ Yes         |
| PATCH  | `/file/favorite/{fileId}`     | Mark file as favorite | ✅ Yes         |

### Folder Management

| Method | Endpoint                      | Description             | Authentication |
| ------ | ----------------------------- | ----------------------- | -------------- |
| POST   | `/folder/add-folder`          | Create a new folder     | ✅ Yes         |
| GET    | `/folder/folders`             | Get all folders         | ✅ Yes         |
| PATCH  | `/folder/favorite/{folderId}` | Mark folder as favorite | ✅ Yes         |

### User Management

| Method | Endpoint                     | Description                     | Authentication |
| ------ | ---------------------------- | ------------------------------- | -------------- |
| GET    | `/api/dashboard`             | Retrieve dashboard data         | ✅ Yes         |
| GET    | `/api/get-file-folder`       | Get all files and folders       | ✅ Yes         |
| GET    | `/api/get-file-of-folder`    | Get files inside a folder       | ✅ Yes         |
| GET    | `/api/get-lock-file-folder`  | Get all lock files and folders  | ✅ Yes         |
| PUT    | `/api/add-to-lock/{id}`      | file or folder add to lock      | ✅ Yes         |
| PUT    | `/api/remove-from-lock/{id}` | file or folder remove from lock | ✅ Yes         |

## Specific api explanation of use

### GET

| Method | Endpoint                               | Description                         | Authentication |
| ------ | -------------------------------------- | ----------------------------------- | -------------- |
| GET    | `/api/dashboard`                       | Retrieve dashboard data             | ✅ Yes         |
| GET    | `/api/get-file-folder?recent=true`     | Get all recent files and folders    | ✅ Yes         |
| GET    | `/folder/folders`                      | Get all folders                     | ✅ Yes         |
| GET    | `/file/get-files?type=notes`           | Get all notes                       | ✅ Yes         |
| GET    | `/file/get-files?type=images`          | Get all images                      | ✅ Yes         |
| GET    | `/file/get-files?type=pdfs`            | Get all pdfs                        | ✅ Yes         |
| GET    | `/api/get-file-of-folder`              | Get files inside a folder           | ✅ Yes         |
| GET    | `/api/get-file-folder?favorite=true`   | Get all favorite files and folders  | ✅ Yes         |
| GET    | `/api/get-file-folder?date=2025-03-23` | Get all date wise files and folders | ✅ Yes         |

### Create

| Method | Endpoint             | Description                                               | Authentication |
| ------ | -------------------- | --------------------------------------------------------- | -------------- |
| POST   | `/file/add-files`    | use type:notes/pdfs/images to add different type of files | ✅ Yes         |
| POST   | `/folder/add-folder` | to create new folder and subfolder use the api            | ✅ Yes         |

## Lock Folder Flow

1. user will call the api `/user/lock-folder` and get a token which will validate for 1 min
2. use the token and call the api `/api/get-lock-file-folder` to see all the file and folder
3. add to lock folder use add to lock folder api
4. remove from lock folder use remove from lock folder api

## Security

All protected routes require a **JWT token** in the Authorization header:

```json
{
   "Authorization": "Bearer your_jwt_token"
}
```

## License

This project is licensed under the MIT License.

## Api Dogs Url

URL: https://www.apidog.com/apidoc/shared-9cbe9feb-6417-485b-b1d9-8e3e93893c10
