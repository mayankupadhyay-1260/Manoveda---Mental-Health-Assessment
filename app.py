import pandas as pd
from collections import Counter
from flask import Flask, request, jsonify, render_template
from flask_mysqldb import MySQL
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/test_connection', methods=['GET'])
def test_connection():
    cursor = mysql.connection.cursor()
    try:
        cursor.execute("SELECT 1")
        return jsonify({'message': 'Connection successful!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()

# MySQL Configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'Mayank'
app.config['MYSQL_PASSWORD'] = 'mayank1234'
app.config['MYSQL_DB'] = 'finaldata'

mysql = MySQL(app)
print("MySQL connection established.")

# Route to serve the HTML page
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/my_flask_app/templates/depression.html')
def depression():
    return render_template('depression.html')

@app.route('/submit', methods=['POST'])
def submit():
    data = request.json
    user_id = data['user_id']
    responses = data['responses']  # List of dicts

    cursor = mysql.connection.cursor()
    try:
        for response in responses:
            question_id = response['question_id']
            option = response['selected_option']
            cursor.execute("""INSERT INTO UserResponses 
                (user_id, question_id, selected_option) 
                VALUES (%s, %s, %s)""", 
                (user_id, question_id, option))

        mysql.connection.commit()
        return jsonify({'message': 'Responses submitted successfully'})
    except Exception as e:
        mysql.connection.rollback()  # Rollback in case of error
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()

# Route to add or update a user (MySQL)
@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.json
    name = data['name']
    email = data['email']

    cursor = mysql.connection.cursor()
    try:
        cursor.execute("SELECT id FROM User WHERE email = %s", (email,))
        result = cursor.fetchone()

        if result:
            cursor.execute("UPDATE User SET name = %s WHERE email = %s", (name, email))
            mysql.connection.commit()
            user_id = result[0]
            return jsonify({'message': 'User  updated successfully', 'user_id': user_id})
        else:
            cursor.execute("INSERT INTO User (name, email) VALUES (%s, %s)", (name, email))
            mysql.connection.commit()
            user_id = cursor.lastrowid
            return jsonify({'message': 'User  added successfully', 'user_id': user_id})
    except Exception as e:
        mysql.connection.rollback()  # Rollback in case of error
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()

# Analyze the frequencies and percentages of selected options (from database)
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    user_id = data['user_id']

    cursor = mysql.connection.cursor()
    try:
        cursor.execute("SELECT selected_option FROM UserResponses WHERE user_id = %s", (user_id,))
        responses = cursor.fetchall()

        # Flatten the list of tuples to a list of options
        scores = [response[0] for response in responses]

        # Count frequencies and calculate percentages
        frequency = Counter(scores)
        total = len(scores)
        percentages = {opt: round((count / total) * 100, 2) for opt, count in frequency.items()}

        # Prediction logic
        prediction = ""
        if percentages.get('1', 0) > 40:
            prediction = "No depression at all."
        elif percentages.get('2', 0) > 40:
            prediction = "Likely to have depression after a long time."
        elif percentages.get('3', 0) > 40:
            prediction = "Likely to have depression in less than a week."
        elif percentages.get('4', 0) > 40:
            prediction = "User  is already in disorder."

        return jsonify({
            'frequencies': dict(frequency),
            'percentages': percentages,
            'prediction': prediction
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()

if __name__ == '__main__':
    app.run(debug=True)