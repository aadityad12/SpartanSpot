"""Manage the webcam used by SpartanSpot."""

import cv2 as cv


class Camera:
    """Open a camera and provide frames to the application."""

    def __init__(
        self,
        camera_index: int = 0,
        width: int = 1920,
        height: int = 1080,
    ):
        """Open the webcam and request the desired resolution."""

        self.camera_index = camera_index

        # DirectShow is the camera backend used by this Windows project.
        self.capture = cv.VideoCapture(
            camera_index,
            cv.CAP_DSHOW,
        )

        if not self.capture.isOpened():
            self.capture.release()

            raise RuntimeError(
                f"Could not open camera {camera_index}."
            )

        try:
            # These settings request a resolution.
            # The webcam may choose a different supported resolution.
            self.capture.set(
                cv.CAP_PROP_FRAME_WIDTH,
                width,
            )

            self.capture.set(
                cv.CAP_PROP_FRAME_HEIGHT,
                height,
            )

            actual_width = int(
                self.capture.get(
                    cv.CAP_PROP_FRAME_WIDTH
                )
            )

            actual_height = int(
                self.capture.get(
                    cv.CAP_PROP_FRAME_HEIGHT
                )
            )

            print(
                f"Camera {camera_index} opened: "
                f"{actual_width} x {actual_height}"
            )

        except Exception:
            # Release the webcam if initialization fails.
            self.capture.release()
            raise

    def read(self):
        """Return (success, frame) from the webcam.

        success is False when a frame cannot be retrieved.
        """

        return self.capture.read()

    def release(self):
        """Release the webcam so other programs can use it."""

        self.capture.release()