import flask
import cv2

app = flask.Flask(__name__)

@app.route("/")
def home():
    ip = flask.request.remote_addr
    return flask.render_template("index.html", ip=ip)
    
if __name__ == "__main__":
    app.run()
    