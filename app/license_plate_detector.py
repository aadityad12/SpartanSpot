from ultralytics import YOLO


class LicensePlateDetector:
    def __init__(
        self,
        model_path,
        confidence_threshold=0.5,
        image_size=640
    ):
        self.model = YOLO(str(model_path))
        self.confidence_threshold = confidence_threshold
        self.image_size = image_size

    def detect(self, frame):
        detections = []

        results = self.model.predict(
            source=frame,
            conf=self.confidence_threshold,
            imgsz=self.image_size,
            verbose=False
        )

        result = results[0]

        if result.boxes is None or len(result.boxes) == 0:
            return detections

        for box in result.boxes:
            x1, y1, x2, y2 = (
                box.xyxy[0].cpu().tolist()
            )

            confidence = float(
                box.conf[0].cpu()
            )

            class_id = int(
                box.cls[0].cpu()
            )

            class_name = self.model.names[class_id]

            detections.append({
                "class_name": class_name,
                "confidence": confidence,
                "x1": int(x1),
                "y1": int(y1),
                "x2": int(x2),
                "y2": int(y2)
            })

        return detections