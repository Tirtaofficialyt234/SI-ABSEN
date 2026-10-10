import cv2
from insightface.app import FaceAnalysis

print("Memuat InsightFace...")

app = FaceAnalysis(name="buffalo_l")
app.prepare(ctx_id=0)

print("InsightFace siap!")
print("Kamera sedang dibuka...")
print("Tekan Q untuk keluar.")

camera = cv2.VideoCapture(0)

while True:
    ret, frame = camera.read()

    if not ret:
        print("Kamera gagal dibuka")
        break

    faces = app.get(frame)

    for face in faces:
        # Embedding wajah
        embedding = face.embedding

        print("Embedding:")
        print(embedding)
        print("Jumlah nilai:", len(embedding))

    cv2.imshow("Face Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

camera.release()
cv2.destroyAllWindows()