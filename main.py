import flask

app = flask.Flask(__name__)

@app.route("/")
def home():
    ip = flask.request.remote_addr
    return flask.render_template("index.html", ip=ip)
    
def generate_frames():
    camera = cv2.VideoCapture(0)  # Use 0 for the default camera
    while True:
        success, frame = camera.read()  # Read the camera frame
        if not success:
            break
        else:
            # Encode the frame in JPEG format
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()  # Convert to bytes
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')  # Yield the frame

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
    
if __name__ == "__main__":
    app.run()
    