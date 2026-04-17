"""
train.py -- Synthetic Dataset Generator & Model Trainer
RiskShield-Gig ML Engine v3.0

Generates ~2000 rows of realistic gig-worker weather-claim data,
trains an IsolationForest (fraud/anomaly) and a RandomForestClassifier (risk level),
and saves the models to ml-model/models/.

Usage:
    python train.py
"""

import os
import sys
import io
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# -- Configuration ------------------------------------------------------------
NUM_ROWS = 2000
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
SEED = 42
np.random.seed(SEED)

# -- Indian city profiles for realistic synthetic data -------------------------
CITY_PROFILES = {
    "Bengaluru":  {"temp_mean": 28, "temp_std": 4, "rain_prob": 0.40, "rain_mean": 25, "wind_mean": 5},
    "Mumbai":     {"temp_mean": 32, "temp_std": 3, "rain_prob": 0.55, "rain_mean": 40, "wind_mean": 8},
    "Delhi":      {"temp_mean": 36, "temp_std": 6, "rain_prob": 0.20, "rain_mean": 15, "wind_mean": 6},
    "Hyderabad":  {"temp_mean": 34, "temp_std": 4, "rain_prob": 0.30, "rain_mean": 20, "wind_mean": 4},
    "Chennai":    {"temp_mean": 33, "temp_std": 3, "rain_prob": 0.50, "rain_mean": 35, "wind_mean": 7},
    "Pune":       {"temp_mean": 30, "temp_std": 4, "rain_prob": 0.35, "rain_mean": 22, "wind_mean": 5},
    "Kolkata":    {"temp_mean": 31, "temp_std": 4, "rain_prob": 0.45, "rain_mean": 30, "wind_mean": 6},
    "Ahmedabad":  {"temp_mean": 37, "temp_std": 5, "rain_prob": 0.15, "rain_mean": 12, "wind_mean": 5},
    "Jaipur":     {"temp_mean": 35, "temp_std": 6, "rain_prob": 0.10, "rain_mean": 10, "wind_mean": 7},
    "Lucknow":    {"temp_mean": 33, "temp_std": 5, "rain_prob": 0.25, "rain_mean": 18, "wind_mean": 4},
}


def generate_synthetic_dataset(n=NUM_ROWS):
    """
    Generates a synthetic dataset with weather features, claim history,
    GPS/fraud signals, and labeled risk levels + anomaly flags.
    """
    print(f"[DATA] Generating {n} synthetic weather-claim records...")

    cities = list(CITY_PROFILES.keys())
    rows = []

    for i in range(n):
        city = np.random.choice(cities)
        p = CITY_PROFILES[city]

        # -- Weather features --------------------------------------------------
        temperature = np.clip(np.random.normal(p["temp_mean"], p["temp_std"]), 10, 55)
        has_rain = np.random.random() < p["rain_prob"]
        rain = np.clip(np.random.exponential(p["rain_mean"]), 0, 120) if has_rain else 0
        wind = np.clip(np.random.normal(p["wind_mean"], 3), 0, 30)
        humidity = np.clip(
            np.random.normal(80 if has_rain else 55, 12), 15, 100
        )

        # -- Claim history features --------------------------------------------
        # Normal workers: 0-3 claims/month; suspicious: 5-15
        is_fraud_pattern = np.random.random() < 0.12  # ~12% fraud-like patterns
        if is_fraud_pattern:
            claim_count_30d = np.random.randint(6, 16)
            avg_claim_amount = np.random.uniform(300, 500)
            time_since_last_claim_hr = np.random.uniform(1, 24)
        else:
            claim_count_30d = np.random.randint(0, 4)
            avg_claim_amount = np.random.uniform(50, 250)
            time_since_last_claim_hr = np.random.uniform(24, 720)

        # -- GPS / Fraud signal features ---------------------------------------
        if is_fraud_pattern:
            location_mismatch_score = np.random.uniform(40, 100)   # high mismatch
            speed_jump_kmh = np.random.uniform(150, 800)           # impossible travel
            accel_flatline_pct = np.random.uniform(60, 100)        # no movement
        else:
            location_mismatch_score = np.random.uniform(0, 25)     # normal
            speed_jump_kmh = np.random.uniform(0, 80)              # normal travel
            accel_flatline_pct = np.random.uniform(0, 30)          # normal movement

        # -- Risk label (based on weather severity) ----------------------------
        weather_severity = (
            (rain / 120) * 0.45 +
            (max(0, temperature - 25) / 30) * 0.25 +
            (wind / 30) * 0.15 +
            (max(0, humidity - 50) / 50) * 0.15
        ) * 100

        # Add some noise to prevent perfect correlation
        weather_severity += np.random.normal(0, 5)
        weather_severity = np.clip(weather_severity, 0, 100)

        if weather_severity >= 70:
            risk_level = "HIGH"
        elif weather_severity >= 45:
            risk_level = "ELEVATED"
        elif weather_severity >= 25:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        # -- Anomaly label -----------------------------------------------------
        # Anomalies = fraud patterns OR extreme weather outliers
        is_anomaly = 1 if (
            is_fraud_pattern or
            rain > 80 or
            temperature > 48 or
            wind > 22 or
            (claim_count_30d > 8 and location_mismatch_score > 60)
        ) else 0

        rows.append({
            "city": city,
            "temperature": round(float(temperature), 1),
            "rain": round(float(rain), 1),
            "wind": round(float(wind), 1),
            "humidity": round(float(humidity), 1),
            "claim_count_30d": int(claim_count_30d),
            "avg_claim_amount": round(float(avg_claim_amount), 2),
            "time_since_last_claim_hr": round(float(time_since_last_claim_hr), 1),
            "location_mismatch_score": round(float(location_mismatch_score), 1),
            "speed_jump_kmh": round(float(speed_jump_kmh), 1),
            "accel_flatline_pct": round(float(accel_flatline_pct), 1),
            "risk_level": risk_level,
            "is_anomaly": int(is_anomaly),
        })

    df = pd.DataFrame(rows)
    print(f"   [OK] Generated {len(df)} rows")
    print(f"   Risk distribution:\n{df['risk_level'].value_counts().to_string()}")
    print(f"   Anomaly rate: {df['is_anomaly'].mean():.1%}")
    return df


# -- Feature columns used by each model ---------------------------------------
WEATHER_FEATURES = ["temperature", "rain", "wind", "humidity"]
CLAIM_FEATURES = ["claim_count_30d", "avg_claim_amount", "time_since_last_claim_hr"]
GPS_FEATURES = ["location_mismatch_score", "speed_jump_kmh", "accel_flatline_pct"]

ALL_FEATURES = WEATHER_FEATURES + CLAIM_FEATURES + GPS_FEATURES


def train_risk_classifier(df):
    """
    Train a RandomForestClassifier to predict risk_level from weather features.
    """
    print("\n[TRAIN] Training RandomForestClassifier for risk level prediction...")

    X = df[WEATHER_FEATURES].values
    le = LabelEncoder()
    y = le.fit_transform(df["risk_level"])

    # Use stratify only if all classes have enough samples
    min_class_count = pd.Series(y).value_counts().min()
    use_stratify = min_class_count >= 2

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=SEED,
        stratify=y if use_stratify else None
    )

    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=5,
        random_state=SEED,
        class_weight="balanced",
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"   Accuracy: {acc:.3f}")
    print(f"   Classes:  {list(le.classes_)}")
    unique_labels = sorted(set(y_test) | set(y_pred))
    label_names = [le.classes_[i] for i in unique_labels]
    print(classification_report(y_test, y_pred, labels=unique_labels, target_names=label_names))

    return clf, le


def train_fraud_detector(df):
    """
    Train an IsolationForest on all features for anomaly/fraud detection.
    """
    print("[TRAIN] Training IsolationForest for fraud/anomaly detection...")

    X = df[ALL_FEATURES].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # contamination = expected proportion of anomalies
    contamination = float(df["is_anomaly"].mean())
    print(f"   Contamination rate: {contamination:.3f}")

    iso = IsolationForest(
        n_estimators=200,
        contamination=contamination,
        max_samples="auto",
        random_state=SEED,
    )
    iso.fit(X_scaled)

    # Evaluate on the labeled data
    predictions = iso.predict(X_scaled)  # 1 = normal, -1 = anomaly
    detected_anomalies = int((predictions == -1).sum())
    actual_anomalies = int(df["is_anomaly"].sum())
    print(f"   Detected anomalies: {detected_anomalies} / {actual_anomalies} actual")

    return iso, scaler


def save_models(clf, le, iso, scaler):
    """Save all models and transformers to disk."""
    os.makedirs(MODELS_DIR, exist_ok=True)

    paths = {
        "risk_classifier": os.path.join(MODELS_DIR, "risk_classifier.joblib"),
        "label_encoder":   os.path.join(MODELS_DIR, "label_encoder.joblib"),
        "fraud_detector":  os.path.join(MODELS_DIR, "fraud_detector.joblib"),
        "feature_scaler":  os.path.join(MODELS_DIR, "feature_scaler.joblib"),
    }

    joblib.dump(clf, paths["risk_classifier"])
    joblib.dump(le, paths["label_encoder"])
    joblib.dump(iso, paths["fraud_detector"])
    joblib.dump(scaler, paths["feature_scaler"])

    print(f"\n[SAVE] Models saved to {MODELS_DIR}/")
    for name, path in paths.items():
        size_kb = os.path.getsize(path) / 1024
        print(f"   {name}: {size_kb:.1f} KB")


def main():
    print("=" * 60)
    print("  RiskShield-Gig -- ML Model Training Pipeline v3.0")
    print("=" * 60)

    # Step 1: Generate synthetic dataset
    df = generate_synthetic_dataset()

    # Save dataset for reference
    dataset_path = os.path.join(MODELS_DIR, "training_data.csv")
    os.makedirs(MODELS_DIR, exist_ok=True)
    df.to_csv(dataset_path, index=False)
    print(f"   [FILE] Training data saved to {dataset_path}")

    # Step 2: Train risk classifier (weather -> risk level)
    clf, le = train_risk_classifier(df)

    # Step 3: Train fraud detector (all features -> anomaly)
    iso, scaler = train_fraud_detector(df)

    # Step 4: Save all models
    save_models(clf, le, iso, scaler)

    print("\n[DONE] Training complete! Models are ready for production.")
    print("   Start the ML service with: python app.py")
    print("=" * 60)


if __name__ == "__main__":
    main()
