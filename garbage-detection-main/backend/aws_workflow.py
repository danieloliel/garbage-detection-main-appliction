import os
import boto3
from os.path import  join, dirname
from dotenv import load_dotenv
import json

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg']
AWS_BUCKET_NAME = os.environ.get("AWS_BUCKET_NAME")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")
AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_REGION_NAME = os.environ.get("AWS_REGION_NAME")
AWS_DYNAMO_DB_TABLE_NAME = os.environ.get("AWS_DYNAMO_DB_TABLE_NAME")

GARBAGE_ITEMS_LIST = os.environ.get("GARBAGE_ITEMS_LIST") 
GARBAGE_THRESHOLD_LIMIT = os.environ.get("GARBAGE_THRESHOLD_LIMIT")

GARBAGE_ITEMS_LIST = json.loads(GARBAGE_ITEMS_LIST)
GARBAGE_THRESHOLD_LIMIT = int(GARBAGE_THRESHOLD_LIMIT)
GARBAGE_ITEMS_DICT = dict(zip(GARBAGE_ITEMS_LIST, [GARBAGE_THRESHOLD_LIMIT]*len(GARBAGE_ITEMS_LIST)))


s3 = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION_NAME
    )

rekognition = boto3.client('rekognition',
                            aws_access_key_id=AWS_ACCESS_KEY_ID,
                            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                            region_name=AWS_REGION_NAME
                        )

dynamodb = boto3.client(
        "dynamodb",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION_NAME
    )

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def detect_labels_through_rekognition(image_file_name):

    try:

        response = rekognition.detect_labels(Image={'S3Object': {'Bucket': AWS_BUCKET_NAME, 'Name': image_file_name}}, MaxLabels=10)
        labels = response['Labels']
        return {'success': True, 'labels': labels}
    
    except Exception as e:
        print("Some error occured while detecting labels in rekognition: ", e)
        return {'success': False, 'error': e}


def upload_file_to_s3(file):

    try:
        s3.upload_fileobj(
            file,
            AWS_BUCKET_NAME,
            file.filename
        )
        
        url = s3.generate_presigned_url(
            ClientMethod='get_object',
            Params={
                'Bucket': AWS_BUCKET_NAME,
                'Key': file.filename
            }
        )
        
        return {'success': True, 'url': url}

    except Exception as e:
        print("Some error occured while uploading file to s3: ", e)
        return {'success': False, 'error': e}
    
def set_data_in_dynamo_db(item):

    try:
        dynamodb.put_item(TableName=AWS_DYNAMO_DB_TABLE_NAME, Item=item)
        return {'success': True }
    
    except Exception as e:
        print("Some error occured while uploading file to s3: ", e)
        return {'success': False, 'error': e}