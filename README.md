**Urvish Makwana**


## Selected Question:-

- **Customer Analysis:**
  - **Total Number of Customers:** (Within a date range)
  - **Total Number of Orders:** (Within a date range)
  - **Average Order Value:** (Within a date range)

## Instructions:-
- Do check attached files in email.

**Project Setup and Usage Guide**

**Prerequisites**

-Before starting, ensure you have the following installed:

-Node.js (Latest LTS recommended),Postman (For testing APIs)

**Installation Steps**

1. Clone the Repository

git clone <repository-url>
cd <project-folder>

2. Add Configuration File

Place the provided (attached in email) config.yml file in the root directory of the project.
- Use local postgresql database for large datasets.
  
3. Install Dependencies

`npm i`

4. Run the Project

`npm run start:dev`

The project should now be running successfully.

5. Postman Collection

The attached .zip file contains a Postman collection for testing the APIs.

Import this collection directly into Postman for ease of use.

**API Endpoint**

1. /insertData

Method: POST

Purpose:

Insert CSV data into the system.

Can also be triggered as a cron-job to refresh data periodically.

2. /typeWiseData

Method: GET

Purpose: Provides analytical insights based on customer data.

Query Parameters:

type (integer): Defines the type of data required

1 = Total Customers

2 = Total Orders

3 = Average Order Value

start_date and end_date (string): Define the date range for filtering data (format: YYYY-MM-DD).


**Api Table**

# API Documentation

## List of APIs

| Route                        | Method | Body                            | Sample Response                        | Description                          |
|-----------------------------|--------|---------------------------------|----------------------------------------|--------------------------------------|
| `/admin/reports/insertData`  | `POST`  | `file` (Form Data - CSV file)   | `{ "message": "" }` | Uploads a CSV file for data insertion |
| `/admin/reports/typeWiseData`  | `GET`  | `type` (value = 1) `start_date` (For date range) `end_date` (For date range)   | `{"data":{"totalCustomers":"3"},"message":""}` |For customets total |
| `/admin/reports/typeWiseData`  | `GET`  | `type` (value = 2)) `start_date` (For date range) `end_date` (For date range)    | `{"data":{"totalOrders":"6"},"message":""}` | For orders total |
| `/admin/reports/typeWiseData`  | `GET`  | `type` (value = 3)  `start_date` (For date range) `end_date` (For date range)   | `{"data":{"averageOrderValue":827.83},"message":""}` | For avg order value total |


# Schema
![image](https://github.com/user-attachments/assets/7156e3c8-10dd-49ce-a5fd-68b19e323ab8)


**Troubleshooting**

If you face any issues while running the project, feel free to reach out at urvishmakwana28@gmail.com.


