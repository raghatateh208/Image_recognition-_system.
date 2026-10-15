from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "AI Vision Studio Backend" in data["status"]

def test_analytics_summary():
    response = client.get("/api/analytics-summary")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "total_predictions_today" in data
    assert "prediction_accuracy" in data

def test_visual_search_endpoint():
    # Testing mock visual search with a sample file payload simulation or checking structure
    response = client.post(
        "/api/advanced-visual-search",
        files={"file": ("test.jpg", b"fake-image-bytes-content", "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "matches" in data