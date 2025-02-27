from flask import Flask, request, jsonify
from transformers import pipeline
import os
import json
import requests
from geopy.distance import geodesic
from geopy.geocoders import Nominatim

app = Flask(__name__)

# Initialize the symptom classifier model from Hugging Face
try:
    symptom_classifier = pipeline(
        "text-classification", 
        model="facebook/bart-large-mnli",
        device=-1  # Use CPU
    )
except Exception as e:
    print(f"Error loading model: {e}")
    symptom_classifier = None

# Mock database for doctors (in a real app, this would be MongoDB)
with open(os.path.join(os.path.dirname(__file__), "mock_doctors.json"), "r") as f:
    doctors_db = json.load(f)

@app.route("/api/analyze-symptoms", methods=["POST"])
def analyze_symptoms():
    data = request.json
    symptoms = data.get("symptoms", "")
    age = data.get("age", 0)
    gender = data.get("gender", "")
    
    if not symptoms:
        return jsonify({"error": "No symptoms provided"}), 400
    
    try:
        # Use the Hugging Face model to classify symptoms
        # In a real app, you would use a medical-specific model
        if symptom_classifier:
            # Define potential conditions to check against
            potential_conditions = [
                "migraine", "common cold", "flu", "covid-19", 
                "allergies", "anxiety", "depression", "hypertension",
                "diabetes", "arthritis"
            ]
            
            # Check symptoms against each condition
            results = []
            for condition in potential_conditions:
                prediction = symptom_classifier(
                    f"The symptoms '{symptoms}' are related to {condition}",
                    candidate_labels=["yes", "no"]
                )
                
                if prediction[0]["labels"][0] == "yes":
                    score = prediction[0]["scores"][0]
                    results.append({"name": condition.title(), "probability": score})
            
            # Sort by probability
            results = sorted(results, key=lambda x: x["probability"], reverse=True)
            
            # If no conditions matched well, provide a generic response
            if not results or results[0]["probability"] < 0.6:
                results = [{"name": "Unspecified Condition", "probability": 0.5}]
                
            # Limit to top 3
            results = results[:3]
            
            # Generate recommendations based on top condition
            recommendations = generate_recommendations(results[0]["name"], age, gender)
            
            return jsonify({
                "conditions": results,
                "recommendations": recommendations
            })
        else:
            # Fallback if model isn't loaded
            return jsonify({
                "conditions": [
                    {"name": "Symptom analysis unavailable", "probability": 1.0}
                ],
                "recommendations": [
                    "Please consult with a healthcare professional  1.0}
                ],
                "recommendations": [
                    "Please consult with a healthcare professional for an accurate diagnosis",
                    "Consider visiting an urgent care facility if symptoms are severe",
                    "Keep track of your symptoms and when they occur"
                ]
            })
    except Exception as e:
        print(f"Error analyzing symptoms: {e}")
        return jsonify({"error": "Failed to analyze symptoms"}), 500

@app.route("/api/find-doctors", methods=["POST"])
def find_doctors():
    data = request.json
    condition = data.get("condition", "").lower()
    location = data.get("location", "")
    
    if not condition or not location:
        return jsonify({"error": "Condition and location are required"}), 400
    
    try:
        # In a real app, you would query MongoDB for doctors
        # Here we'll filter our mock database
        
        # Get coordinates for the provided location
        geolocator = Nominatim(user_agent="mediscan-ai")
        user_location = geolocator.geocode(location)
        
        if not user_location:
            return jsonify({"error": "Location not found"}), 400
            
        user_coords = (user_location.latitude, user_location.longitude)
        
        # Filter doctors by specialty related to condition
        specialties = get_specialties_for_condition(condition)
        matching_doctors = []
        
        for doctor in doctors_db:
            if doctor["specialty"].lower() in specialties:
                # Calculate distance
                doc_coords = (doctor["latitude"], doctor["longitude"])
                distance = geodesic(user_coords, doc_coords).miles
                
                # Add distance to doctor object
                doctor_copy = doctor.copy()
                doctor_copy["distance"] = round(distance, 1)
                doctor_copy["distance_text"] = f"{round(distance, 1)} miles"
                
                matching_doctors.append(doctor_copy)
        
        # Sort by distance
        matching_doctors.sort(key=lambda x: x["distance"])
        
        # Return top 5 closest doctors
        return jsonify(matching_doctors[:5])
        
    except Exception as e:
        print(f"Error finding doctors: {e}")
        return jsonify({"error": "Failed to find doctors"}), 500

def generate_recommendations(condition, age, gender):
    """Generate recommendations based on the condition and patient info"""
    # In a real app, this would be more sophisticated
    general_recommendations = [
        "Consult with a healthcare professional for proper diagnosis",
        "Track your symptoms and their frequency",
        "Stay hydrated and get adequate rest"
    ]
    
    condition_specific = {
        "Migraine": [
            "Avoid known trigger foods like chocolate or aged cheese",
            "Consider keeping a headache journal",
            "Reduce exposure to bright lights and loud noises during episodes"
        ],
        "Common Cold": [
            "Get plenty of rest and stay hydrated",
            "Use over-the-counter medications to relieve symptoms",
            "Consider using a humidifier to ease congestion"
        ],
        "Flu": [
            "Rest and avoid contact with others to prevent spread",
            "Take fever-reducing medications as needed",
            "Seek medical attention if symptoms worsen significantly"
        ],
        "Covid-19": [
            "Isolate yourself to prevent spreading the virus",
            "Monitor your oxygen levels if possible",
            "Seek immediate medical attention if you experience difficulty breathing"
        ],
        "Allergies": [
            "Identify and avoid allergen triggers when possible",
            "Consider over-the-counter antihistamines",
            "Use air purifiers to reduce indoor allergens"
        ]
    }
    
    # Get condition-specific recommendations if available
    specific_recs = condition_specific.get(condition, [])
    
    # Combine recommendations
    if specific_recs:
        return specific_recs + general_recommendations[:1]
    else:
        return general_recommendations
        
def get_specialties_for_condition(condition):
    """Map conditions to relevant medical specialties"""
    condition_map = {
        "headache": ["neurologist", "primary care"],
        "migraine": ["neurologist", "pain management"],
        "back pain": ["orthopedist", "physical therapist", "pain management"],
        "joint pain": ["rheumatologist", "orthopedist"],
        "heart": ["cardiologist"],
        "skin": ["dermatologist"],
        "allergy": ["allergist", "immunologist"],
        "breathing": ["pulmonologist", "allergist"],
        "stomach": ["gastroenterologist"],
        "diabetes": ["endocrinologist", "primary care"],
        "anxiety": ["psychiatrist", "psychologist"],
        "depression": ["psychiatrist", "psychologist"],
        "cancer": ["oncologist"],
        "pregnancy": ["obstetrician", "gynecologist"],
        "child": ["pediatrician"]
    }
    
    # Find matching specialties
    specialties = set()
    for key, values in condition_map.items():
        if key in condition:
            specialties.update(values)
    
    # Default to primary care if no matches
    if not specialties:
        specialties = ["primary care"]
    
    return specialties

if __name__ == "__main__":
    # This is used when running locally
    app.run(host="127.0.0.1", port=5328, debug=True)

