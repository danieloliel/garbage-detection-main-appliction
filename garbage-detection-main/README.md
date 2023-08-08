# Garbage detection webapp

AWS_REGION_NAME='us-east-1'
AWS_BUCKET_NAME='garbage-detection-bucket'
AWS_DYNAMO_DB_TABLE_NAME='Garbage_Inquiries'
AWS_STATIC_FILES_BUCKET_NAME='garbage-detection-bucket-react-static'
AWS_STATIC_WEBSITE_S3_URL='http://garbage-detection-bucket-react-static.s3-website-us-east-1.amazonaws.com'

# OTHER ENVS
GARBAGE_ITEMS_LIST=["Trash", "Cardboard", "Garbage", "Chair", "Table", "Bottle", "Plastic Bag"]
GARBAGE_THRESHOLD_LIMIT=70

PUBLIC_URL=https://garbage-detection-bucket-react-static.s3.amazonaws.com/
REACT_APP_DEBUG=false
REACT_APP_HOST_URL=http://ec2-3-90-164-189.compute-1.amazonaws.com/
REACT_APP_BASE_URL=http://ec2-3-90-164-189.compute-1.amazonaws.com/api/
REACT_APP_ENV=prod
