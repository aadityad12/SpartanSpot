"""Run the combined parking-space and license-plate model

The model detects three kinds of objects:

    available parking spaces
    occupied parking spaces
    license plates

This module seperates parking-space detection from plate detections.
The tracker will assign permanent parking-space IDs afterward.
"""

from app.config import (
    YOLO_CONFIDENCE,
    YOLO_IMAGE_SIZE,
)

def normalize_class_name(name:str) -> str:
    """Convert model labels into consistent format.

    Example:
        "Available" -> "available"
        "Occupied" -> "occupied"
        "License Plate" -> "license_plate"
    """

    return (
        name.lower().strip().replace("-", "_").replace(" ", "_")
    )

def run_model(model, frame):
    """Detect parking spaces and plates in one camera frame.
    
    Args:
        model: The already loaded YOLO model.
        frame: The orignal OpenCV camera image.

    Returns:
        A tuple containing:
            parking: Available/occupied parking-space detections.
            plates: License-plate detections.
    """

    parking = []
    plates = []

    # Run the model once and use result for this frame.
    result = model.predict(
        source = frame,
        conf = YOLO_CONFIDENCE,
        imgsz = YOLO_IMAGE_SIZE,
        verbose = False,
    )[0]

    # Some frames may contain no detected objects.
    if result.boxes is None:
        return parking, plates

    for box in result.boxes:
        # Convert model coordinates into ordinary Python numbers.
        x1, y1, x2, y2 = (
            box.xyxy[0].cpu().tolist()
        )

        class_id = int(
            box.cls[0].cpu().item()
        )

        class_name = normalize_class_name(
            model.names[class_id]
        )

        detection = {
            "class_name": class_name,
            "confidence": float(
                box.conf[0].cpu().item()
            ),
            "x1": int(x1),
            "y1": int(y1),
            "x2": int(x2),
            "y2": int(y2),

            # The tracker uses the center to match detections
            # to the permanent parking-space IDs.
            "center_x": int((x1 + x2) / 2),
            "center_y": int((y1 + y2) / 2),
        }

        if class_name in {"available", "occupied"}:
            parking.append(detection)

        elif class_name in {"plate", "license_plate"}:
            plates.append(detection)
        
    return parking, plates