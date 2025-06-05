import flask
import json
import uuid

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
def user_location():
    data = flask.request.get_json()
    lat = data['lat']
    lng = data['lng']
    
    user_id = flask.request.cookies.get('user_id')
    print("user_id: " + user_id)
    
    current_location = {
        'user_id': user_id,
        'latitude': lat,
        'longitude': lng
    }
    
    for i in range(len(locations)):
        print(i)
        if locations[i]['user_id'] == user_id:
            del locations[i]
        
    locations.append(current_location)
    
    response = {
        'message': 'Location received',
        'latitude': lat,
        'longitude': lng
    }
    return flask.jsonify(locations), 200
    
@app.route("/current_locations")
def get_locations():
    return flask.jsonify(locations), 200
    
if __name__ == "__main__":
    app.run()
    