window.initializeWatermark = function(canvas) {

      canvas.on('object:added', function(e) {
          if(e.target.type === 'image') {
             document.getElementById('toolbar').classList.add('show');
             }
      });


      canvas.on('selection:created', function () {
          document.getElementById('textInputs').style.display = 'block';
      });

      canvas.on('selection:cleared', function () {
            document.getElementById('textInputs').style.display = 'none';
      });

    // Color input
    document.getElementById('colorInput').addEventListener('input', function() {
        var activeObjects = canvas.getActiveObjects();
        var newColor = this.value;  // Assign the new color to a variable
        activeObjects.forEach(function (object) {
          if (object.type === 'i-text') {
            object.set({ fill: newColor }); // Use newColor variable here
          }
        });
        canvas.requestRenderAll();
      });

    // Opacity input
    document.getElementById('opacityInput').addEventListener('input', function() {
        var activeObjects = canvas.getActiveObjects();
        var newOpacity = this.value;  // Assign the new opacity to a variable
        activeObjects.forEach(function (object) {
          if (object.type === 'i-text') {
            object.set({ opacity: newOpacity }); // Use newOpacity variable here
          }
        });
        canvas.requestRenderAll();
    });

    // New Text button
    document.getElementById('addText').addEventListener('click', function() {
        canvas.add(new fabric.IText('New Text', {
            fontFamily: 'arial black',
            left: 100,
            top: 100 ,
            fill: document.getElementById('colorInput').value,
            opacity: document.getElementById('opacityInput').value
        }));
    });

        var toolbarItems = document.querySelectorAll("#toolbar .clickable");

        // Loop over the items
        for (let i = 0; i < toolbarItems.length; i++) {
          // Attach a click event listener to each item
          toolbarItems[i].addEventListener('click', function() {

                var saveImageButton = document.getElementById('saveImage');
                 saveImageButton.classList.remove("btn-light");
                 saveImageButton.classList.add("btn-primary");
                var resetImageButton = document.getElementById('resetImage');
                 resetImageButton.classList.remove("btn-light");
                 resetImageButton.classList.add("btn-primary");
          });
        }
}