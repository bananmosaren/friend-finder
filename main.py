import flask
import json
import uuid
import datetime
from time import sleep
import threading
import os

app = flask.Flask(__name__)

locations = []
users = []
likes = []

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
    
@app.route("/current_users")
def get_users():
    return flask.jsonify(users), 200
    
@app.route("/current_likes")
def get_likes():
    return flask.jsonify(likes), 200
    
@app.route('/cleanup', methods=['POST'])
def cleanup():
    print("cleanup")
    global locations
    id = flask.request.cookies.get('user_id')
    for i in range(len(locations) - 1, -1, -1):
        user_id = locations[i]['user_id']
        if user_id == id:
            del locations[i]
            
    return flask.jsonify(success=True)

@app.route("/submit/pfp", methods=['POST'])
def submit_pfp():
    image = flask.request.files['image']
    user_id = flask.request.cookies.get('user_id')
    
    image.save(os.path.join('static/media/pfp', user_id + '.jpg'))
    
    return flask.jsonify(success=True)
    
@app.route("/alias/submit", methods=['POST'])
def alias_submit():
    alias = flask.request.form['alias']
    user_id = flask.request.cookies.get('user_id')
    
    user = {
        'user_id': user_id,
        'alias': alias
    }
    
    for i in range(len(users) - 1, -1, -1):
        if users[i]['user_id'] == user_id:
            del users[i]
            
    users.append(user)
    
    return flask.redirect(flask.url_for('home'))

@app.route("/user/<user_id>")
def user(user_id):
    global locations
    
    pfp_path = "/static/media/pfp/" + user_id + ".jpg"
    
    if locations:
        for i in range(len(locations) - 1, -1, -1):
            if locations[i]['user_id'] == user_id:
                
                if users:
                    for i in range(len(users) - 1, -1, -1):
                        if users[i]['user_id'] == user_id:
                            alias = users[i]['alias']
                            return flask.render_template("user.html", user_id=user_id, pfp_path=pfp_path, alias=alias)
                
                return flask.render_template("user.html", user_id=user_id, pfp_path=pfp_path)
    
    return 'No user with  the ID: ' + user_id, 400
    
@app.route("/like/submit/<user_id>", methods=['POST'])
def like(user_id):
    id = flask.request.cookies.get('user_id')
    like = {
        'user_id': user_id,
        id: True
    }
    likes.append(like)
    
    return flask.redirect("/user/" + user_id)
    
def match(id):
    user_id = flask.request.cookies.get('user_id')
    
    
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
    