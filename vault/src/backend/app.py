from flask import Flask, jsonify, request, session, redirect, url_for
import sqlite3
from datetime import datetime
from datetime import timedelta
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app, supports_credentials=True)
bcrypt = Bcrypt(app)

# Configure the Flask app to use SQLite for session storage
app.config['SECRET_KEY'] = '4d8486b39ee93f76f6d71e655c3fe5141816c5bd003a9d659d3b16f99a4148598ddaed15e9c8fc6a07db1de07d4845f216143390a7429b8ad8a03db96b390045d8887af41f4d1db2f696f0a8003d1062'
app.config['SESSION_TYPE'] = 'sqlalchemy'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///vault_database.db?timeout=30'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30) 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_COOKIE_PATH'] = '/'
db = SQLAlchemy(app)
app.config['SESSION_SQLALCHEMY'] = db

Session(app)

# Creates the database with multiple tables
def init_db():
    connection = sqlite3.connect('vault_database.db')
    cursor = connection.cursor()

    # Creates table for storing user data
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            profile_pic TEXT,                               
            bio TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Creates table for storing user posts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            post_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
    ''')

    # Creates table for followers
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS followers (
            follower_id INTEGER NOT NULL,
            followed_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (follower_id, followed_id),
            FOREIGN KEY(follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY(followed_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
    ''')

    connection.commit()
    connection.close()

def get_db_connection():
    connection = sqlite3.connect('vault_database.db', timeout=30.0) 
    return connection


class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    first_name = db.Column(db.String(120), nullable=False)
    last_name = db.Column(db.String(120), nullable=False)

#  Initializes the database (will only need to be run when first creating the DB and anytime we add new fields/schemas to the tables
@app.route('/init', methods=['GET'])
def initialize_database():
    init_db()
    return jsonify({"message": "Database initialized!"})

#  Returns all the users in the users table
@app.route('/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    conn.close()
    return jsonify(users)

# Login handling
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    conn = get_db_connection()
    cursor = conn.cursor()

    if '@' not in username:
        cursor.execute("SELECT password FROM users WHERE username = ?", (username,))
    else:
        cursor.execute("SELECT password FROM users WHERE email = ?", (username,))
    
    user = cursor.fetchone()
    conn.close()

    if user is None or not bcrypt.check_password_hash(user[0], password):
        return jsonify({"status": "failure", "message": "Username or password incorrect."}), 401

    # Set the session and force it to be saved
    session['username'] = username
    session.modified = True  # Ensure the session is saved
    print("Session after login:", session)  # Add this line for debugging
    return jsonify({"status": "success", "message": "Login successful!"}), 200



        
    
# Registration handling
@app.route('/register', methods=['POST'])
def register():
    data = request.json

    firstName = data['firstName']
    lastName = data['lastName']
    email = data['email']
    username = data['username']
    password = data['password']
    confirmedPassword = data['confirmedPassword']

    if password != confirmedPassword:
        return jsonify({"status": "failure", "message": "Passwords do not match."}), 401

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
    if existing_user:
        return jsonify({"status": "failure", "message": "Username or email already taken"}), 409

    new_user = User(username=username, email=email, password=hashed_password, first_name=firstName, last_name=lastName)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"status": "success", "message": "Account created!"}), 201

# Retrieve single user by ID
@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify(user), 200
    else:
        return jsonify({"error": "User not found"}), 404

# Update user profile information
@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE users
        SET username = ?, email = ?, profile_pic = ?, bio = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
    ''', (data['username'], data['email'], data['profile_pic'], data['bio'], user_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "User profile updated!"}), 200

@app.route('/home', methods=['GET'])
def home():
    print("Session data at /home:", session)  # Debug the session data
    if 'username' in session:
        return jsonify({"message": f"Welcome {session['username']}!"}), 200
    else:
        return jsonify({"message": "Not logged in."}), 401



# Create a time capsule / post
@app.route('/posts', methods=['POST'])
def create_post():
    data = request.json
    user_id = data['user_id']
    content = data['content']
    image_url = data.get('image_url')  # null if no image

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO posts (user_id, content, image_url)
        VALUES (?, ?, ?)
    ''', (user_id, content, image_url))
    conn.commit()
    conn.close()

    return jsonify({"message": "Post created!"}), 201

# Searching for users
@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('q', '')

    conn = get_db_connection()
    cursor = conn.cursor()

    # Search users by username and gets usernames (and profile pic later)
    cursor.execute('''
        SELECT username FROM users
        WHERE username LIKE ? LIMIT 7
    ''', ('%' + query + '%',)) # Match any part of the username

    results = cursor.fetchall()

    # Format the results as a list of dictionaries
    users = [{'username': row[0]} for row in results]

    conn.close()

    return jsonify(users)
    
# route for reseting password #
@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email_or_username = data['email_or_username']
    new_password = data['new_password']
    confirmed_password = data['confirmed_password']

    if new_password != confirmed_password:
        return jsonify({"status": "failure", "message": "Passwords do not match."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if the user exists using email or username
    if '@' in email_or_username:
        cursor.execute("SELECT user_id FROM users WHERE email = ?", (email_or_username,))
    else:
        cursor.execute("SELECT user_id FROM users WHERE username = ?", (email_or_username,))

    user = cursor.fetchone()

    if user:
        # If user exists, update the password
        cursor.execute("UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?", (new_password, user[0]))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Password reset successful!"}), 200
    else:
        conn.close()
        return jsonify({"status": "failure", "message": "User not found."}), 404
   

if __name__ == '__main__':
    with app.app_context():
        db.create_all() 
        init_db()
    app.run(debug=True)
