from flask import Flask, render_template, request, redirect
from flask_cors import CORS
from datetime import datetime, timezone
from werkzeug.utils import secure_filename
from os.path import  join, dirname
from dotenv import load_dotenv
import flask
import os
import uuid


dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

class Config:
    LOCALE = os.environ.get("FLASK_LOCALE", 'en_US.utf8')
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY")
    DEBUG = os.environ.get("FLASK_DEBUG", 'True')
    BASE_URL = os.environ.get("FLASK_BASE_URL", "")

app = Flask(__name__)

app.config.from_object(Config())

cors = CORS(app, allow_headers=[
    "Content-Type", "Authorization", "Access-Control-Allow-Credentials", "withCredentials", "Access-Control-Allow-Origin"],
            supports_credentials=True, resources={r"/*": {"origins": "*"}})

@app.route("/")
def index():

    url = os.environ.get('AWS_STATIC_WEBSITE_S3_URL')
    return redirect(url)

@app.route('/api/submit_resident_form', methods=['POST'])
def submit_resident_form():
    from aws_workflow import allowed_file, upload_file_to_s3, detect_labels_through_rekognition, set_data_in_dynamo_db, GARBAGE_ITEMS_DICT

    ok = False
    post_data = request.form.to_dict()
    image_data = request.files
    img_file = image_data['image']
    img_filename = secure_filename(img_file.filename)

    if allowed_file(img_filename):

        # call the s3 service to upload the image
        s3_response = upload_file_to_s3(img_file)

        if s3_response["success"]:
            s3_img_url = s3_response["url"]

            # call the rekognition service to detect labels
            rekognition_response = detect_labels_through_rekognition(img_filename)
            if rekognition_response["success"]:
                labels = rekognition_response["labels"]
                is_dirty = False
                for label in labels:
                    label_name = label.get("Name", None)
                    label_confidence = label.get("Confidence", None)
                    if label_name and label_name in GARBAGE_ITEMS_DICT:
                        threshold_garbage_value = GARBAGE_ITEMS_DICT[label_name]
                        if threshold_garbage_value and label_confidence and (label_confidence > threshold_garbage_value):
                            is_dirty = True
                            break
                
                # call the dynamo db and set form data and is_dirty values
                id = str(uuid.uuid4())
                first_name = post_data["firstName"]
                last_name = post_data["lastName"]
                phone_number = post_data["phoneNumber"]
                description = post_data["description"]
                location = post_data["location"]
                timestamp = datetime.now(timezone.utc).isoformat()

                item  = {
                    'ID': {'S': id},
                    'First_name': {'S': first_name },
                    'Last_name': {'S': last_name },
                    'Phone_number': {'S': phone_number },
                    'Location': {'S': location },
                    'Description': {'S': description },
                    'File': {'S': s3_img_url },
                    'Is_dirty': {'BOOL': is_dirty },
                    'Time': {'S': timestamp },
                }

                dynamodb_response = set_data_in_dynamo_db(item)
                
                if dynamodb_response["success"]:
                    ok = True
    
    return flask.jsonify(ok=ok)

if __name__ == '__main__':
    app.run()
