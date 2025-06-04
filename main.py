import flask

app = flask.Flask(__name__)

@app.route("/")
def home():
    ip = flask.request.headers.get('X-Forwarded-For')
    return flask.render_template("index.html", ip=ip)
    
if __name__ == "__main__":
    app.run()
    