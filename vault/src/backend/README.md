# Backend Guide

## 1. Ensure you have SQLite, Flask, Flask-cors, Flask-bcrypt, and Flask-Session downloaded


### Table Format Example:
| user_id | username   | email               | password       | profile_pic                       | bio                       | created_at          | updated_at          |
|---------|------------|---------------------|-----------------|-----------------------------------|---------------------------|---------------------|---------------------|
| 1       | john_doe   | john@example.com     | $2b$12$abc123... | /static/profile_pics/john_doe.jpg | "Coffee enthusiast."      | 2024-01-01 12:00:00 | 2024-01-01 12:00:00 |
| 2       | jane_doe   | jane@example.com     | $2b$12$xyz456... | /static/profile_pics/jane_doe.jpg | "Loves hiking and travel."| 2024-01-02 14:30:00 | 2024-01-02 14:30:00 |
| 3       | user123    | user123@example.com  | $2b$12$def789... | NULL                              | NULL                      | 2024-01-03 08:15:00 | 2024-01-03 08:15:00 |

### Accessing Table in Terminal
1. Navigate to the backend folder
2. Type: sqlite3 vault_database.db
3. use .tables to view all tables
4. use .schema 'table name' to view the tables schema

### Notes:
    * The database contains multiple relational-tables that store data, for instance the user table stores user credentials, the post table stores post data
    * FOREIGN KEY indicates the key comes from another table, for example, user_id in the posts table is the same as the one in the users table
    * DELETE CASCADE means that if you delete an entry from a parent table, it gets deleted from that table. i.e if a user is deleted from the users table, any entry in the post table with their id is also deleted (deletes their posts)

