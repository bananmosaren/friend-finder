import flask
import request

app = flask.Flask(__name__)

@app.route("/")
def home():
    ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    return flask.render_template("index.html", ip=ip)
    
if __name__ == "__main__":
    app.run()
    