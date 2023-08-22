window.onload = function() {


    // Chart Global Color
    Chart.defaults.color = "#6C7293";
    Chart.defaults.borderColor = "#000000";


    fetchImages(false)

    // Get the show all and collapse buttons
    var showButton = document.getElementById('show');
    var collapseButton = document.getElementById('collapse');

    // Fetch images and update the table
    function fetchImages(showAll) {

        fetch('/fetch-images?show_all=' + showAll)
            .then(response => {
            console.log(response);
            return response.json(); })
            .then(data => {
                 console.log(data);
                 var tbody = document.getElementById('image-table-body')
                 tbody.innerHTML = '';
                // Replace existing rows with new data
                data.images.forEach((image, index) => {


                        // Clear the table body


                        var newRow = tbody.insertRow();
                        newRow.id = 'img-row-' + (index + 1);

                        // Add new cells to the row
                        var checkboxCell = newRow.insertCell(0);
                        var checkboxInput = document.createElement('input');
                        checkboxInput.setAttribute('type', 'checkbox');
                        checkboxInput.classList.add('form-check-input');
                        checkboxCell.appendChild(checkboxInput);

                        var imageCell = newRow.insertCell(1);
                        var dateCell = newRow.insertCell(2);
                        var typeCell = newRow.insertCell(3);
                        var statusCell = newRow.insertCell(4);
                        var actionCell = newRow.insertCell(5);

                        // Populate the cells with the image data
                        imageCell.innerHTML = `<a href="${image.url}">View Image</a>`;
                        dateCell.textContent = image.upload_date;
                        typeCell.textContent = image.type;
                        statusCell.textContent = image.status;
                         console.log(image.id);
                        var base_url = window.location.origin; // Get the base URL
                        var watermark_url = base_url + '/watermark'; // Construct the URL for the watermark endpoint

                        actionCell.innerHTML = `<a href="${watermark_url}?image=${encodeURIComponent(image.url)}&format=${encodeURIComponent(image.type)}"> Edit </a>`;

                });
            });
    }

    // Set the initial state
    collapseButton.style.display = 'none';

    // Event handler for show all button
    showButton.addEventListener('click', function(e) {

        console.log("here");
        e.preventDefault();
        fetchImages(true);
        showButton.style.display = 'none';
        collapseButton.style.display = 'block';
    });

    // Event handler for collapse all button
    collapseButton.addEventListener('click', function(e) {
        e.preventDefault();
        fetchImages(false);
        collapseButton.style.display = 'none';
        showButton.style.display = 'block';
    });
}
