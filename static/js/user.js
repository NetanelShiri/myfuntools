window.onload = function() {

    var modified = false;
    var fileFormat;
    var signInMode = false;

    var signinButton = document.getElementById('signin');
    var connectMethod = document.getElementById('connectCard')
    var snackbar = document.getElementById("snackbar");


    document.querySelector('.fixed-bottom').style.display = 'none';

    document.querySelector('.sidebar').classList.toggle("open");
    document.querySelector('.content').classList.toggle("open");




    $(document).ready(function() {

        function toggleSignInSignUpMode(isSignInMode) {
            if (isSignInMode) {
                signInMode = true;
                $('.form-check, #floatingEmail').hide(); // this hides the email and checkbox divs
                $('h3:contains("Sign Up")').text('Sign In');
                $('button:contains("Sign Up")').text('Sign In')
                $('#signin').html('Don\'t have an Account? <a href="">Sign Up</a>'); // this changes the text and link below the button
            } else {
                signInMode = false;
                $('.form-check, #floatingEmail').show(); // this shows the email and checkbox divs
                $('h3:contains("Sign In")').text('Sign Up');
                $('button:contains("Sign In")').text('Sign Up');
                $('#signin').html('Already have an Account? <a href="">Sign In</a>'); // this changes the text and link below the button
            }
        }

        $('#signin').on('click', 'a', function(e) {
            e.preventDefault(); // this prevents the page from refreshing upon clicking the link
            toggleSignInSignUpMode($(this).text() === 'Sign In');
        });

        if(connectMethod.dataset.source !== 'Register'){
            console.log(connectMethod);
            // Call the function when page loads
            toggleSignInSignUpMode(true);  // Set true for Sign In mode, false for Sign Up mode
        }
    });


    $(document).ready(function() {

        $('form').on('submit', function(e) {
        e.preventDefault();

            let url;
            let email
            console.log("im here bro");
            if (signInMode == false){
                   email = $('#floatingEmail').val();
            }
            else{
                    email = null;
            }
            let username = $('#floatingUsername').val();
            let password = $('#floatingPassword').val();

            let button = $('button:contains("Sign In")').length ? $('button:contains("Sign In")') : $('button:contains("Sign Up")');

                    if (button.text() === "Sign In") {
                        url = button.data('login-url');
                    } else {
                        url = button.data('register-url');

                    }
            console.log(email)
            console.log(username)
            console.log(password)
            $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify({
                    email: email,
                    password: password,
                    username: username,
                }),
                contentType: "application/json",
                success: function(response) {
                    var message = response.message;
                    console.log(message);
                    snackbar.textContent = message;

                    snackbar.className = "show";
                    setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 1500);

                    if (response.redirect) {
                       setTimeout(function(){ window.location.href = response.redirect; }, 1500);
                    }

                },
                error: function(error) {
                    var message = error.responseJSON.message;
                    snackbar.textContent = message;

                    snackbar.className = "show";
                    setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000);
                }
            });
        });

    });
}(jQuery)