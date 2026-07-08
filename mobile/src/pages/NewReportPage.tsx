import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar
} from "@ionic/react";
import { Camera, LocateFixed, Send } from "lucide-react";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createReport, getCategories, type Category, type Urgency } from "../services/api";

export function NewReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriaId, setCategoriaId] = useState<number>();
  const [urgencia, setUrgencia] = useState<Urgency>("media");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [location, setLocation] = useState<{ latitud: number; longitud: number }>();
  const [photoName, setPhotoName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  async function captureLocation() {
    const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    setLocation({
      latitud: position.coords.latitude,
      longitud: position.coords.longitude
    });
  }

  async function capturePhoto() {
    const photo = await CapacitorCamera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 80
    });
    setPhotoName(photo.path ?? photo.webPath ?? "Fotografia capturada");
  }

  async function submitReport() {
    if (!user || !categoriaId || !location || descripcion.trim().length < 5) {
      setMessage("Completa categoria, descripcion y ubicacion.");
      return;
    }

    await createReport(user, {
      categoria_id: categoriaId,
      urgencia,
      descripcion,
      latitud: location.latitud,
      longitud: location.longitud,
      direccion_aprox: direccion
    });
    setMessage("Reporte enviado correctamente.");
    navigate("/mis-reportes");
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Nuevo reporte</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <main className="page-body form-flow">
          <IonList inset>
            <IonItem>
              <IonLabel>Categoría</IonLabel>
              <IonSelect value={categoriaId} onIonChange={(event) => setCategoriaId(Number(event.detail.value))}>
                {categories.map((category) => (
                  <IonSelectOption key={category.id} value={category.id}>{category.nombre}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Urgencia</IonLabel>
              <IonSelect value={urgencia} onIonChange={(event) => setUrgencia(event.detail.value)}>
                <IonSelectOption value="baja">Baja</IonSelectOption>
                <IonSelectOption value="media">Media</IonSelectOption>
                <IonSelectOption value="alta">Alta</IonSelectOption>
                <IonSelectOption value="critica">Crítica</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonTextarea label="Descripción" labelPlacement="stacked" value={descripcion} onIonInput={(event) => setDescripcion(String(event.detail.value ?? ""))} />
            </IonItem>
            <IonItem>
              <IonInput label="Dirección aproximada" labelPlacement="stacked" value={direccion} onIonInput={(event) => setDireccion(String(event.detail.value ?? ""))} />
            </IonItem>
          </IonList>

          <div className="form-actions">
            <IonButton expand="block" fill="outline" onClick={captureLocation}>
              <LocateFixed size={18} />
              <span>{location ? "Ubicación capturada" : "Capturar ubicación GPS"}</span>
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={capturePhoto}>
              <Camera size={18} />
              <span>{photoName || "Capturar fotografía"}</span>
            </IonButton>
            <IonButton expand="block" onClick={submitReport}>
              <Send size={18} />
              <span>Enviar reporte</span>
            </IonButton>
          </div>
        </main>
        <IonToast isOpen={Boolean(message)} message={message} duration={2200} onDidDismiss={() => setMessage("")} />
      </IonContent>
    </IonPage>
  );
}
