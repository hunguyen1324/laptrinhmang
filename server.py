from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import eventlet
from library.model import Users
from library.extension import db

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:@localhost/network_db'
# app.config['SECRET_KEY'] = 'my-secret-key'
db.init_app(app)
with app.app_context():
    db.create_all()
    print("Created DB")

room_user_map = {}  # Lưu trữ thông tin người dùng và phòng tương ứng


@app.route("/http-call")
def http_call():
    data = {'data': 'This text was fetched using an HTTP call to server on render'}
    return jsonify(data)


@socketio.on("connect")
def connected():
    print(request.sid)
    print("client has connected")
    emit("connect", {"data": f"id: {request.sid} is connected"})


@socketio.on('register')
def register(data):
    username = data.get('username')
    password = data.get('password')

    # Check if the username already exists in the database
    existing_user = Users.query.filter_by(username=username).first()
    if existing_user:
        emit('register_status', {'status': 'failure',
             'message': 'Username already exists'})
    else:
        # Create a new user
        new_user = Users(username=username, password=password)

        try:
            # Add the new user to the database
            db.session.add(new_user)
            db.session.commit()
            emit('register_status', {'status': 'success',
                 'message': 'User registered successfully'})
        except Exception as e:
            # Handle any exceptions that might occur during registration
            emit('register_status', {
                 'status': 'failure', 'message': 'Registration failed', 'error': str(e)})


logged_in_users = {}  # Dictionary to track logged-in users


@socketio.on('login')
def login(data):
    username = data.get('username')
    password = data.get('password')

    user = Users.query.filter_by(username=username).first()

    if user and username == user.username and password == user.password:
        existing_sid = logged_in_users.get(username)
        if existing_sid:
            emit('login_status', {
                 'status': 'failure', 'message': 'Already logged in from another location'})
        else:
            logged_in_users[username] = request.sid
            emit('login_status', {'status': 'success',
                 'message': 'Logged in successfully!'})
    else:
        emit('login_status', {'status': 'failure',
             'message': 'Invalid credentials'})


def is_user_logged_in(sid):
    return sid in logged_in_users.values()


@socketio.on('join')
def join(data):
    if is_user_logged_in(request.sid):
        room = data['room']
        join_room(room)
        room_user_map[request.sid] = room
        emit("joined", {"data": f"You joined room {room}"})
    else:
        emit("joined", {"data": "Please login first"})


@socketio.on('data')
def handle_message(data):
    print("data from the front end: ", str(data))
    # Lấy thông tin phòng của người gửi tin nhắn
    room = room_user_map.get(request.sid)
    if room:
        emit("data", {'data': data, 'id': request.sid},
             room=room)  # Gửi tin nhắn chỉ trong phòng đó
    else:
        print("User is not in any room")


@socketio.on('logout')
def logout():
    for username, sid in logged_in_users.items():
        if sid == request.sid:
            # Remove user from logged_in_users
            del logged_in_users[username]
            # Remove user from room_user_map and leave the room
            room = room_user_map.pop(sid, None)
            if room:
                leave_room(room)
            emit('logout_status', {'status': 'success',
                 'message': 'Logged out successfully'})
            print("User logged out")
            return
    emit('logout_status', {'status': 'failure', 
            'message': 'Not logged in'})
    print("User not logged in")

@socketio.on("disconnect")
def disconnected():
    # Xóa thông tin người dùng khi họ disconnect
    room = room_user_map.pop(request.sid, None)
    if room:
        leave_room(room)  # Rời khỏi phòng nếu người dùng đang ở trong phòng
        emit("disconnect", f"user {request.sid} disconnected", room=room)
    for username, sid in logged_in_users.items():
        if sid == request.sid:
            del logged_in_users[username]
            break


if __name__ == '__main__':
    socketio.run(app, debug=True, port=5001)
