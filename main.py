import firebase_admin
from flask_bootstrap import Bootstrap
from flask_ckeditor import CKEditor
from flask import Flask
from firebase_admin import storage, credentials
from mongoengine import Document, StringField, IntField, connect, ListField
from flask_login import LoginManager
from decouple import config
from models import User
from routes import init_app

app = Flask(__name__)
app.config['SECRET_KEY'] = config('SECRET_KEY')
ckeditor = CKEditor(app)
Bootstrap(app)

# Accessing the users database
CONNECTION_STRING = config('MONGO_CONNECTION_STRING')
connect(host=CONNECTION_STRING)

cred = credentials.Certificate(config('FIREBASE_AUTH'))
firebase_admin.initialize_app(cred, {
    'storageBucket': 'tool-io-93e1b.appspot.com'
})

login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'

init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.objects(pk=user_id).first()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000 , debug=True)