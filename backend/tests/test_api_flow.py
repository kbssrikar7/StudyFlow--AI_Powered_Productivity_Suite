from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

# Global variables to store data between tests
test_user = {
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
}
auth_token = None
task_id = None
session_id = None

def test_register():
    response = client.post("/auth/register", json=test_user)
    # 201 created or 400 if exists
    assert response.status_code in [201, 400]

def test_login():
    global auth_token
    response = client.post("/auth/login", data={"username": test_user["email"], "password": test_user["password"]})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    auth_token = data["access_token"]

def get_headers():
    return {"Authorization": f"Bearer {auth_token}"}

def test_create_task():
    global task_id
    task_data = {"title": "Test Task", "priority": "high", "status": "todo"}
    response = client.post("/tasks/", json=task_data, headers=get_headers())
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    task_id = data["id"]

def test_get_tasks():
    response = client.get("/tasks/", headers=get_headers())
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0

def test_update_task():
    update_data = {"status": "doing"}
    response = client.put(f"/tasks/{task_id}", json=update_data, headers=get_headers())
    assert response.status_code == 200
    assert response.json()["status"] == "doing"

def test_delete_task():
    response = client.delete(f"/tasks/{task_id}", headers=get_headers())
    assert response.status_code == 204

def test_create_session():
    global session_id
    session_data = {"title": "Test Session", "duration": 1500}
    response = client.post("/sessions/", json=session_data, headers=get_headers())
    assert response.status_code == 201
    session_id = response.json()["id"]

def test_complete_session():
    update_data = {"completed": True}
    response = client.put(f"/sessions/{session_id}", json=update_data, headers=get_headers())
    assert response.status_code == 200
    assert response.json()["completed"] == True
