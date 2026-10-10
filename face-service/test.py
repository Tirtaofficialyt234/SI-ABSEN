import cv2
from insightface.app import FaceAnalysis


print("Memuat InsightFace...")

app = FaceAnalysis(name="buffalo_l")
app.prepare(ctx_id=0)

print("InsightFace siap!")

image = cv2.imread("foto.jpg")

if image is None:
    print("Foto tidak ditemukan!")
    exit()

faces = app.get(image)

print("Jumlah wajah:", len(faces))

for i, face in enumerate(faces):
    print(f"Wajah ke-{i + 1}")
    print("Bounding box:", face.bbox)
    print("Embedding tersedia:", face.embedding is not None)