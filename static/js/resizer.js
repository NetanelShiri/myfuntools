window.initializeResize = function(canvas) {


    canvas.on('object:added', function(e) {
        var objectType = e.target.get('type');
        if (objectType === 'image') {
            e.target.set({
                selectable: true,
                hasControls: true,
                left:10

            });
            let canvasWidth = canvas.getWidth();
            let canvasHeight = canvas.getHeight();

            canvas.setWidth(canvasWidth+35)

            var imgInstance = canvas.item(0);
            canvas.setActiveObject(imgInstance); // Make the image active

            canvas.renderAll();
        }
    });
}