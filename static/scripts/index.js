if (typeof ImageCapture !== 'undefined') {
	var video = document.createElement('video');
	var photo = document.getElementById('photo');
	var imageCapture;
	
	if (navigator.mediaDevices.getUserMedia) {
	navigator.mediaDevices.getUserMedia({video: true, audio: false })
		.then(function (stream) {
			video.srcObject = stream;
			video.play();
			
			const track = stream.getVideoTracks()[0];
			imageCapture = new ImageCapture(track);
			
			video.addEventListener('playing', function() {
				takeSnapshot();
			});
		})
		.catch(function (error) {
		console.error("Something went wrong: ", error);
		});
	}
	
	function takeSnapshot() {
		imageCapture.takePhoto()
			.then(blob => {
				const url = URL.createObjectURL(blob);
				photo.src = url;
				
				const formData = new FormData();
				formData.append('image', blob, 'pfp.jpg');
				
				fetch('/submit/pfp', {
				method: 'POST',
				body: formData
				})
				.then(response => response.json())
				.then(data => console.log('Success:', data))
				.catch(error => console.error('Error fetching:', error));
				
				// Stop the video tracks
				let tracks = video.srcObject.getTracks();
				tracks.forEach(track => track.stop());
				video.srcObject = null;
			})
		.catch(error => console.error('Error taking photo:', error));
	}
} else {
	var video = document.createElement('video');
	photo = document.getElementById('photo');
	
	var canvas = document.createElement('canvas');
	canvas.width = 350;
	canvas.height = 350;
	var context = canvas.getContext('2d');
	
	if (navigator.mediaDevices.getUserMedia) {
	navigator.mediaDevices.getUserMedia({video: true, audio: false })
		.then(function (stream) {
			video.srcObject = stream;
			video.play();
			video.addEventListener('playing', function() {
				takeSnapshot();
			});
		})
		.catch(function (error) {
		console.error("Something went wrong: ", error);
		});
	}
	
	function takeSnapshot() {
		context.drawImage(video, 0, 0, canvas.width, canvas.height);
		const data = canvas.toDataURL("image/jpeg");
		photo.src = data;
		
		const byteString = atob(data.split(',')[1]);
		const mimeString = data.split(',')[0].split(':')[1].split(';')[0];
		const ab = new ArrayBuffer(byteString.length);
		const ia = new Uint8Array(ab);
		for (let i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
		
		
		const blob = new Blob([ab], { type: mimeString });
		
		const formData = new FormData();
		formData.append('image', blob, 'pfp.jpg');
	
		fetch('/submit/pfp', {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then(data => console.log('Success:', data))
		.catch(error => console.error('Error fetching:', error));
		
		let tracks = video.srcObject.getTracks();
		tracks.forEach(track => track.stop());
		video.srcObject = null;
	}
}
