import flask
import json
import uuid
import datetime
from time import sleep
import threading
import os

app = flask.Flask(__name__)

locations = []

@app.route("/")
def home():
    x = flask.request.headers.get('X-Forwarded-For')
    if x:
        if "," in x:
            ips = x.split(",")
            ip = ips[0]
        else:
            ip = x
    else:
        ip = "unknown"
        
    resp = flask.make_response(flask.render_template("index.html", ip=ip, locations=locations))
    if not flask.request.cookies.get('user_id'):
        resp.set_cookie('user_id', str(uuid.uuid4()))
        
    return resp
    
@app.route("/submit/location", methods=['POST'])
def submit_location():
    data = flask.request.get_json()
    lat = data['lat']
    lng = data['lng']
    timestamp = datetime.datetime.now().timestamp()
    
    user_id = flask.request.cookies.get('user_id')
    print("user_id: " + user_id)
    
    current_location = {
        'user_id': user_id,
        'timestamp': timestamp,
        'lat': lat,
        'lng': lng
    }
    
    for i in range(len(locations) - 1, -1, -1):
        if locations[i]['user_id'] == user_id:
            del locations[i]
        
    locations.append(current_location)
    
    response = {
        'message': 'Location received',
        'timestamp': timestamp,
        'lat': lat,
        'lng': lng
    }
    return flask.jsonify(locations), 200
    
@app.route("/current_locations")
def get_locations():
    return flask.jsonify(locations), 200
    
def cleanup():
    global locations
    while True:
        sleep(5)
        for i in range(len(locations) - 1, -1, -1):
            timestamp = locations[i]['timestamp']
            if datetime.datetime.now().timestamp() - timestamp > 5:
                del locations[i]
                
cleanup_thread = threading.Thread(target=cleanup, daemon=True)
cleanup_thread.start()

@app.route("/submit/pfp", methods=['POST'])
def submit_pfp():
    image = flask.request.files['image']
    user_id = flask.request.cookies.get('user_id')
    
    image.save(os.path.join('static/media/pfp', user_id + '.jpg'))
    
    return 'Success!', 200

@app.route("/user/<user_id>")
def user(user_id):
    global locations
    
    pfp_path = "/static/media/pfp/" + user_id + ".jpg"
    
    if locations:
        print("locations")
        for i in range(len(locations) - 1, -1, -1):
            if locations[i]['user_id'] == user_id:
                return flask.render_template("user.html", user_id=user_id, pfp_path=pfp_path)
    
    return 'No user with  the ID: ' + user_id, 400
    
@app.route("/allusers")
def all_users():
    global locations
    dir = "static/media/pfp/"
    users = []
    
    for pfp in os.listdir(dir):
        id = pfp.replace(".jpg", "")
        pfp = dir + pfp
        
        users.append((id, pfp))
    
    return flask.render_template("allusers.html", users=users), 200

if __name__ == "__main__":
    app.run()
    