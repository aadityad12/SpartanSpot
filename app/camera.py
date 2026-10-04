import cv2 as cv
from pathlib import Path


class Camera:
    def __init__(self, source):
        self.source = source

        if isinstance(source, Path):
            source = str(source)

        self.capture = cv.VideoCapture(source)

        if not self.capture.isOpened():
            raise RuntimeError(
                f"Could not open camera or video: {source}"
            )

    def read(self):
        success, frame = self.capture.read()

        if not success:
            return None

        return frame

    def release(self):
        self.capture.release()