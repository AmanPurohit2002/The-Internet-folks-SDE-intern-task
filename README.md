# The Internet Folks: SDE Intern Assignment [002]

## About
Welcome to The Internet Folks SDE Intern Task [002]! This task involves building APIs for a SaaS platform that enables users to create communities and manage members within those communities. Each user is assigned the role of Community Admin upon creating a community and can add other users as Community Members.

## User Stories (Features)
### Module: Authentication
- **Feature 1:** User should be able to signup using a valid name, email, and a strong password.
- **Feature 2:** User should be able to signin using valid credentials.

### Module: Community
- **Feature 3:** User should be able to see all communities.
- **Feature 4:** User should be able to create a community.

### Module: Moderation
- **Feature 5:** User should be able to see all community members.
- **Feature 6:** User should be able to add a user as a member.
- **Feature 7:** User should be able to remove a member from the community.

## Problem Statement
Your task is to develop APIs that adhere to the specified user stories. Note that the role names (Community Admin, Community Member) are strict, and the API URLs, response structure, field attributes, and table names must strictly follow the given guidelines. While using NoSQL databases, you are allowed to add a field for storing IDs. Validations for each API must be implemented.

## Tech Stack
- **Language:** Node v14+
- **Database:** MongoDB
- **ORM:**  Mongoose 
- **Library:** [@theinternetfolks/snowflake](https://www.npmjs.com/package/@theinternetfolks/snowflake) (to generate unique IDs instead of autoincrement, UUID, or MongoDB ObjectID)

## Getting Started
Follow the steps below to set up and run the project:

1. Clone this repository.
   ```bash
   git clone https://github.com/yourusername/theiniternetfolks-sde-intern-task.git
   ```
2. Navigate to the project directory.
    ```bash
    cd backend
    ```
3. Install dependencies.
    ```
    npm i
    ```
4. make your .env file

5. Run the project.
    ```bash
    npm run dev
