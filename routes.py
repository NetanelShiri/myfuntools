import io
import base64

from PIL import Image as PILImage
from bson import ObjectId
from flask import render_template, redirect, request, jsonify, url_for, flash, session
from firebase_admin import storage
from datetime import datetime
import requests
from flask_login import login_user, current_user, logout_user, login_required, AnonymousUserMixin
from models import User, Image
from forms import RegistrationForm


def init_app(app):
    @app.route("/register", methods=['GET', 'POST'])
    def register():
        print("already here")
        print(request.method)  # Add this line

        if current_user.is_authenticated:
            return redirect(url_for('home'))

        if request.method == 'POST':
            print("method post")
            data = request.get_json()
            username = data['username']
            email = data['email']
            password = data['password']

            existing_user = User.objects(username=username).first()
            if existing_user is not None:
                return jsonify({'message': 'Username  already taken', 'status': 'error'}), 400

            existing_email = User.objects(email=email).first()
            if existing_email is not None:
                return jsonify({'message': 'Email already taken', 'status': 'error'}), 400

            print(username, email, password)
            user = User(email=email, username=username)
            user.set_password(password)
            user.save()
            login_user(user)
            print("great we done")
            attach_session_edits()

            return jsonify(
                {'redirect': url_for('home'), 'message': 'Your account has been created! Redirecting home..'})

        else:
            form = RegistrationForm()
            return render_template('users/signin.html', source="Register", form=form)

    @app.route('/login', methods=['POST'])
    def login():
        print("got to login")
        is_correct = None

        if request.method == 'POST':
            data = request.get_json()
            username = data['username']
            password = data['password']
            print(username, password)
            user = User.objects(username=username).first()
            if user:
                is_correct = user.check_password(password)
            print(is_correct)
            if user is not None and is_correct:
                print("User logged in")
                login_user(user)

                attach_session_edits()

                return jsonify(
                    {'redirect': url_for('home'), 'message': 'Successfully logged in! Redirecting home..'})

        return jsonify({'message': 'Incorrect password'}), 400

    @app.route('/logout')
    def logout():
        if current_user.is_authenticated:
            username = current_user.username
            logout_user()
            print(f"user {username} logged out")
        return redirect(url_for('home'))

    @app.route('/')
    def home():

        if current_user.is_authenticated:
            images_number = len(current_user.images)
        else:
            if 'image_ids' not in session:
                session['image_ids'] = []
            images_number = len(session['image_ids'])

        return render_template('index.html', images_number=images_number, current_user=current_user)

    @app.route('/signin')
    def signin():

        return render_template('users/signin.html')

    @app.route('/fetch-images')
    def fetch_images():

        user = current_user

        show_all = request.args.get('show_all',
                                    'false').lower() == 'true'  # Default to 'false' if no argument is provided
        if user.is_authenticated:
            images = user.images
        else:
            if 'image_ids' not in session:
                return jsonify({'message': 'Anonymous user not uploaded yet'})
            image_ids = [ObjectId(image_id) for image_id in session['image_ids']]
            images = Image.objects(id__in=image_ids)
        if not show_all:
            images = images[:5]  # Show only the last 5 images if 'show_all' is false

        images = sorted(images, key=lambda image: image.id, reverse=True)

        # Convert each image to a dictionary and return as JSON
        images_dict = [
            {'url': img.url, 'upload_date': img.upload_date.strftime('%H:%M:%S - %d-%m-%y'), 'type': img.type,
             'status': img.status, 'test': img.status} for img in images]
        return jsonify(images=images_dict)

    @app.route('/watermark')
    def watermark():
        return render_template('functions/water-mark.html')

    @app.route('/resizer')
    def resizer():
        return render_template('functions/resizer.html')

    @app.route('/cropper')
    def cropper():
        return render_template('index.html')

    @app.route('/maintenance')
    def maintenance():
        return render_template('maintenance.html')

    @app.route('/test')
    def preset_images():
        return render_template('image.html')

    # User upload image the the server
    @app.route('/upload', methods=['POST'])
    def upload():
        imageData = request.json['imageData']
        imageFormat = request.json['imageFormat']
        editAction = request.json['editAction']
        image_data = base64.b64decode(imageData.split(",")[1])

        user = current_user

        if current_user.is_authenticated:
            user_id = user.id
        else:
            if 'image_ids' not in session:
                session['image_ids'] = []
            user_id = "000"

        image = PILImage.open(io.BytesIO(image_data))

        user_ip = request.remote_addr

        try:
            response = requests.get(f'http://ip-api.com/json/{user_ip}')
            response.raise_for_status()
        except requests.RequestException:
            return None

        data = response.json()
        user_timezone = data.get('timezone')
        upload_date_documented = user_timezone
        # Standard UTC timezone aware Datetime

        if user_timezone is None:
            user_timezone = datetime.utcnow().strftime('%d-%m-%Y_%H-%M-%S')
            upload_date_documented = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        else:
            user_timezone = user_timezone.strftime('%d-%m-%Y_%H-%M-%S')
            upload_date_documented = user_timezone.strftime('%d-%m-%Y %H:%M:%S')

        unique_filename = f"{user_id}_{user_timezone}.{image.format.lower()}"
        local_path = f"user_images/{unique_filename}"

        # saving the image locally
        image.save(local_path)

        # upload image to firebase and get the URL
        uploaded_image_url = upload_image(local_path, user_id, imageFormat)
        print(uploaded_image_url)
        new_image = Image(
            url=uploaded_image_url,
            upload_date=upload_date_documented,
            type=imageFormat,
            status=editAction,
            user=None if isinstance(user, AnonymousUserMixin) else user,
        )
        new_image.save()

        if user.is_authenticated:
            user.images.append(new_image)
            user.save()
        else:
            session['image_ids'].append(str(new_image.id))
            session.modified = True

        return jsonify({'message': 'Image uploaded'})

    def upload_image(local_path, user_id, image_format):
        firebase_path = "users/" + str(user_id) + '/' + local_path
        bucket = storage.bucket()
        blob = bucket.blob(firebase_path)

        with open(local_path, "rb") as img_file:
            blob.upload_from_file(img_file, content_type=f'image/{image_format}')

        # Make the blob publicly viewable
        blob.make_public()

        return blob.public_url

    # this function attaches all the images that an un-registered/logged user uploaded/edited. and attaches to
    # his user once he logs in/register
    def attach_session_edits():
        image_ids = session.get('image_ids', [])
        images_list = []
        if image_ids:
            for image_id in image_ids:
                image = Image.objects(id=ObjectId(image_id)).first()
                if image:
                    image.user = current_user
                    image.save()
                    images_list.append(image)

        print(images_list)
        current_user.images.extend(images_list)
        current_user.save()
        del session['image_ids']
