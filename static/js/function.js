window.onload = function() {

    var modified = false;
    var fileFormat;
    var currentEditAction = "Default";


    document.querySelector('.fixed-bottom').style.display = 'none';

    document.querySelector('.sidebar').classList.toggle("open");
    document.querySelector('.content').classList.toggle("open");


    document.getElementById('selectImage').addEventListener('click', function() {
        document.getElementById('imageLoader').click();
    });

    // Load uploaded image onto canvas
    document.getElementById('imageLoader').addEventListener('change', loadImage, false);

    // New Image button
    document.getElementById('reSelectImage').addEventListener('click', function() {
        document.getElementById('imageLoader').click();
    });


    // CANVAS THAT WILL BE USED FOR MULTIPLE PAGES!
    let canvas = new fabric.Canvas('canvas');
    let canvasUsed = false;



    document.getElementById('canvas').style.display = 'none';
    document.querySelector('.canvas-container').style.display = 'none';

    let img = new Image();


    let params = new URLSearchParams(window.location.search);
    loadImage(null,params.get('image'));

    let maxImgWidth = window.innerWidth;
    let maxImgHeight = window.innerHeight - 66;


    // Load uploaded image onto canvas
function loadImage(e = null, imageLink = null) {

    let imageURL = null
    if(imageLink === null && e === null){
        return;
    }
    // Check if a file was selected
    if(e !== null){
        if (e.target.files.length == 0) {
            console.log("No file selected!");
            return;
        }

        let file = e.target.files[0];
        fileFormat = file.type;

        imageURL = URL.createObjectURL(file);
        console.log("url : " , imageURL);
    }
    else{
        $('#spinner').addClass('show');
        fileFormat = params.get('format');
        imageURL = imageLink;
    }
    canvasUsed = true;
    createImageWorld(imageURL);

}

function createImageWorld(imageURL){

    img.onload = function(){
        // Hide controls
        let controls = document.getElementsByClassName('watermark-controls');
        for (let i = 0; i < controls.length; i++) {
            controls[i].style.display = "none";
        }
        // Show canvas
        var scale = Math.min(maxImgWidth / img.width, maxImgHeight / img.height);

        canvas.setWidth(img.width * scale);
        canvas.setHeight(img.height * scale);

        //show buttons
        document.getElementById('imageChoices').classList.remove('ms-auto');

        document.getElementById('navButtons').style.display = 'block';


        // Draw the image onto the canvas
           // Create a Fabric.js image instance
            fabric.Image.fromURL(imageURL, function(imgInstance) {
                // Convert the image to a data URL

                // Set the image position and properties
                imgInstance.set({
                    left: 0,
                    top: 0,
                    scaleX: scale,
                    scaleY: scale,
                    selectable: false
                });

                imgInstance.resizeFilter = new fabric.Image.filters.Resize({
                    resizeType: 'highQuality' // Use 'highQuality' resize algorithm
                });
                // Add the image to the canvas
                canvas.imageSmoothingEnabled = true;
                canvas.add(imgInstance);

                $('#spinner').removeClass('show');
            });

        canvas.on('object:modified', function(e) {
            var saveImageButton = document.getElementById('saveImage');
             saveImageButton.classList.remove("btn-light");
             saveImageButton.classList.add("btn-primary");
            var resetImageButton = document.getElementById('resetImage');
             resetImageButton.classList.remove("btn-light");
             resetImageButton.classList.add("btn-primary");
        });

        document.querySelector('.playground').style.display = "flex";
        document.getElementById('canvas').style.display = 'block';
        document.querySelector('.canvas-container').style.display = 'block';


        // Release the blob URL after the image is loaded
        URL.revokeObjectURL(imageURL);
    }
    img.src = imageURL;
}

 // Helper function to convert dataURL to Blob
    function dataURLToBlob(dataURL) {
        let parts = dataURL.split(';base64,');
        let contentType = parts[0].split(":")[1];
        let raw = window.atob(parts[1]);
        let rawLength = raw.length;

        let uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    }

    // Save button
    document.getElementById('saveImage').addEventListener('click', function() {

        // Get data URL of image, replace used to manipulate the default of "todataurl" which saves to png always.
        // i wanted the original format of the image not to change.

        var dataURL = canvas.toDataURL("image/png").replace("image/png", fileFormat);  // here is the most important part because if you dont replace you will get a DOM 18 exception.
        let imageFormat = dataURL.split(',')[0].split(':')[1].split(';')[0].split('/')[1];

        // Convert the dataURL to a Blob
        let blob = dataURLToBlob(dataURL);

        // Create a FormData object and append the blob
        let formData = new FormData();
        formData.append('image', blob);

        // Send the FormData object to the server
        fetch('/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
           body: JSON.stringify({ imageData: dataURL, imageFormat: imageFormat , editAction: currentEditAction })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Image uploaded');
        });


        // Save the image locally
        let theImage = document.createElement('a');

        // Set the href of the 'a' element to the data URL
        theImage.href = dataURL;
        theImage.download = 'image.'+imageFormat;

        // Trigger a click event on the 'a' element
        theImage.click();
    });




    // Functions initializer for multiple services
    if (window.initializeWatermark) {
        currentEditAction = "Watermark"
        window.initializeWatermark(canvas);
    }
    if (window.initializeResize) {
        currentEditAction = "Resize"
        window.initializeResize(canvas);
    }
}
