from flask_login import UserMixin
from mongoengine import Document, StringField, ListField, URLField, DateTimeField, ReferenceField, BooleanField, \
    BinaryField
from flask_bcrypt import bcrypt


class User(UserMixin, Document):
    email = StringField(max_length=100, unique=True)
    password = BinaryField()
    username = StringField(max_length=100, unique=True)
    images = ListField(ReferenceField('Image'))  # use 'Image' instead of Image

    def get_id(self):
        return str(self.id)

    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password = bcrypt.hashpw(password.encode('utf-8'), salt)

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'),self.password)


class Image(Document):
    url = URLField(required=True)
    upload_date = DateTimeField(required=True)
    type = StringField(required=True)
    status = StringField(required=True)
    user = ReferenceField(User)  # reference to the User model
