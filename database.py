from bson import ObjectId
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient


# -----------------------------------
# CREATE FASTAPI APPLICATION
# -----------------------------------

app = FastAPI(
    title="Hospital Support Request System",
    description="Backend API for managing hospital support requests",
    version="1.0.0"
)


# -----------------------------------
# CONNECT TO MONGODB
# -----------------------------------

MONGO_URL = "mongodb://127.0.0.1:27017"

client = MongoClient(MONGO_URL)

database = client["hospital_support_db"]

request_collection = database["support_requests"]


# -----------------------------------
# REQUEST MODEL
# -----------------------------------

class SupportRequestCreate(BaseModel):
    patient_name: str
    patient_id: str
    department: str
    request_type: str
    description: str
    priority: str
    status: str


# -----------------------------------
# RESPONSE MODEL
# -----------------------------------

class SupportRequestResponse(SupportRequestCreate):
    id: str


# -----------------------------------
# HELPER FUNCTION
# -----------------------------------

def request_helper(request):
    return {
        "id": str(request["_id"]),
        "patient_name": request["patient_name"],
        "patient_id": request["patient_id"],
        "department": request["department"],
        "request_type": request["request_type"],
        "description": request["description"],
        "priority": request["priority"],
        "status": request["status"]
    }


# ===================================
# 1. CREATE SUPPORT REQUEST
# ===================================

@app.post(
    "/requests",
    response_model=SupportRequestResponse,
    status_code=201
)
def create_request(request: SupportRequestCreate):

    request_data = request.model_dump()

    result = request_collection.insert_one(request_data)

    new_request = request_collection.find_one(
        {"_id": result.inserted_id}
    )

    return request_helper(new_request)


# ===================================
# 2. GET ALL SUPPORT REQUESTS
# ===================================

@app.get(
    "/requests",
    response_model=list[SupportRequestResponse]
)
def get_all_requests():

    requests = request_collection.find()

    return [
        request_helper(request)
        for request in requests
    ]


# ===================================
# 3. GET REQUEST BY ID
# ===================================

@app.get(
    "/requests/{request_id}",
    response_model=SupportRequestResponse
)
def get_request(request_id: str):

    if not ObjectId.is_valid(request_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid request ID"
        )

    request = request_collection.find_one(
        {"_id": ObjectId(request_id)}
    )

    if request is None:
        raise HTTPException(
            status_code=404,
            detail="Support request not found"
        )

    return request_helper(request)


# ===================================
# 4. UPDATE SUPPORT REQUEST
# ===================================

@app.put(
    "/requests/{request_id}",
    response_model=SupportRequestResponse
)
def update_request(
    request_id: str,
    request: SupportRequestCreate
):

    if not ObjectId.is_valid(request_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid request ID"
        )

    request_data = request.model_dump()

    result = request_collection.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": request_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Support request not found"
        )

    updated_request = request_collection.find_one(
        {"_id": ObjectId(request_id)}
    )

    return request_helper(updated_request)


# ===================================
# 5. DELETE SUPPORT REQUEST
# ===================================

@app.delete("/requests/{request_id}")
def delete_request(request_id: str):

    if not ObjectId.is_valid(request_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid request ID"
        )

    result = request_collection.delete_one(
        {"_id": ObjectId(request_id)}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Support request not found"
        )

    return {
        "message": "Support request deleted successfully"
    }