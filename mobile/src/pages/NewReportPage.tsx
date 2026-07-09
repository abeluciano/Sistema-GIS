import {
  IonButton,
  IonButtons,
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
import { Camera, CheckCircle, ChevronLeft, LocateFixed, RefreshCw, Send } from "lucide-react";
import { Camera as CapacitorCamera, CameraResultType, CameraSource, type Photo } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createReport, getCategories, uploadReportPhoto, type Category, type Urgency } from "../services/api";

export function NewReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriaId, setCategoriaId] = useState<number>();
  const [urgencia, setUrgencia] = useState<Urgency>("media");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [location, setLocation] = useState<{ latitud: number; longitud: number }>();
  const [photo, setPhoto] = useState<Photo>();
  const [pendingPhotoReportId, setPendingPhotoReportId] = useState<number>();
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [capturingLocation, setCapturingLocation] = useState(false);
  const [capturingPhoto, setCapturingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadCategories();
  }, []);

  async function loadCategories() {
    setLoadingCategories(true);
    setCategoriesError("");
    try {
      const loadedCategories = await getCategories();
      setCategories(loadedCategories);
      if (loadedCategories.length === 0) {
        setCategoriesError("No hay categorias disponibles.");
      }
    } catch {
      setCategories([]);
      setCategoriesError("No se pudieron cargar las categorias.");
    } finally {
      setLoadingCategories(false);
    }
  }

  function formatCategoryName(value: string) {
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  async function ensureLocationPermission() {
    const current = await Geolocation.checkPermissions();
    if (current.location === "granted" || current.coarseLocation === "granted") return true;

    const requested = await Geolocation.requestPermissions({ permissions: ["location"] });
    return requested.location === "granted" || requested.coarseLocation === "granted";
  }

  async function ensureCameraPermission() {
    const current = await CapacitorCamera.checkPermissions();
    if (current.camera === "granted") return true;

    const requested = await CapacitorCamera.requestPermissions({ permissions: ["camera"] });
    return requested.camera === "granted";
  }

  async function captureLocation() {
    setCapturingLocation(true);
    try {
      const allowed = await ensureLocationPermission();
      if (!allowed) {
        setMessage("Permiso de ubicacion denegado.");
        return;
      }

      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 12000 });
      setLocation({
        latitud: position.coords.latitude,
        longitud: position.coords.longitude
      });
      setMessage("Ubicacion GPS capturada.");
    } catch {
      setMessage("No se pudo capturar la ubicacion GPS.");
    } finally {
      setCapturingLocation(false);
    }
  }

  async function capturePhoto() {
    setCapturingPhoto(true);
    try {
      const allowed = await ensureCameraPermission();
      if (!allowed) {
        setMessage("Permiso de camara denegado.");
        return;
      }

      const capturedPhoto = await CapacitorCamera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 80
      });
      if (!capturedPhoto.webPath && !capturedPhoto.path) {
        throw new Error("La camara no devolvio una fotografia.");
      }
      setPhoto(capturedPhoto);
      setMessage("Fotografia capturada.");
    } catch {
      setMessage("No se capturo la fotografia.");
    } finally {
      setCapturingPhoto(false);
    }
  }

  async function submitReport() {
    if (categories.length === 0) {
      setMessage("Carga una categoria antes de enviar el reporte.");
      return;
    }

    if (!user || !categoriaId || !location || descripcion.trim().length < 5) {
      setMessage("Completa categoria, descripcion y ubicacion.");
      return;
    }

    setSubmitting(true);
    try {
      const report = await createReport(user, {
        categoria_id: categoriaId,
        urgencia,
        descripcion,
        latitud: location.latitud,
        longitud: location.longitud,
        direccion_aprox: direccion
      });
      if (photo) {
        try {
          await uploadReportPhoto(user, report.id, photo);
        } catch {
          setPendingPhotoReportId(report.id);
          setMessage(`Reporte #${report.id} creado. Reintenta la carga de la fotografia.`);
          return;
        }
      }
      setMessage("Reporte enviado correctamente.");
      navigate("/mis-reportes");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo enviar el reporte.");
    } finally {
      setSubmitting(false);
    }
  }

  async function retryPhotoUpload() {
    if (!user || !photo || !pendingPhotoReportId) return;
    setSubmitting(true);
    try {
      await uploadReportPhoto(user, pendingPhotoReportId, photo);
      setMessage("Fotografia enviada correctamente.");
      navigate("/mis-reportes");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo subir la fotografia.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => navigate("/home")} aria-label="Volver">
              <ChevronLeft size={24} />
            </IonButton>
          </IonButtons>
          <IonTitle>Nuevo reporte</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <main className="page-body form-flow">
          <IonList inset>
            <IonItem>
              <IonLabel>Categoria</IonLabel>
              <IonSelect
                value={categoriaId}
                disabled={loadingCategories || categories.length === 0}
                placeholder={loadingCategories ? "Cargando" : "Seleccionar"}
                onIonChange={(event) => {
                  const nextValue = Number(event.detail.value);
                  setCategoriaId(Number.isFinite(nextValue) ? nextValue : undefined);
                }}
              >
                {categories.map((category) => (
                  <IonSelectOption key={category.id} value={category.id}>{formatCategoryName(category.nombre)}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            {categoriesError && (
              <IonItem lines="none">
                <IonLabel color="danger">{categoriesError}</IonLabel>
                <IonButton fill="clear" slot="end" onClick={() => void loadCategories()}>
                  <RefreshCw size={18} />
                </IonButton>
              </IonItem>
            )}
            <IonItem>
              <IonLabel>Urgencia</IonLabel>
              <IonSelect value={urgencia} onIonChange={(event) => setUrgencia(event.detail.value)}>
                <IonSelectOption value="baja">Baja</IonSelectOption>
                <IonSelectOption value="media">Media</IonSelectOption>
                <IonSelectOption value="alta">Alta</IonSelectOption>
                <IonSelectOption value="critica">Critica</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonTextarea label="Descripcion" labelPlacement="stacked" value={descripcion} onIonInput={(event) => setDescripcion(String(event.detail.value ?? ""))} />
            </IonItem>
            <IonItem>
              <IonInput label="Direccion aproximada" labelPlacement="stacked" value={direccion} onIonInput={(event) => setDireccion(String(event.detail.value ?? ""))} />
            </IonItem>
          </IonList>

          <div className="form-actions">
            <IonButton expand="block" fill="outline" color={location ? "success" : "primary"} disabled={capturingLocation} onClick={captureLocation}>
              {location ? <CheckCircle size={18} /> : <LocateFixed size={18} />}
              <span>{capturingLocation ? "Capturando ubicacion" : location ? "Ubicacion capturada" : "Capturar ubicacion GPS"}</span>
            </IonButton>
            {location && (
              <p className="form-action-status success-status">
                GPS listo: {location.latitud.toFixed(5)}, {location.longitud.toFixed(5)}
              </p>
            )}
            <IonButton expand="block" fill="outline" color={photo ? "success" : "primary"} disabled={capturingPhoto || submitting} onClick={capturePhoto}>
              {photo ? <CheckCircle size={18} /> : <Camera size={18} />}
              <span>{capturingPhoto ? "Abriendo camara" : photo ? "Fotografia capturada" : "Capturar fotografia"}</span>
            </IonButton>
            {photo && <p className="form-action-status success-status">Fotografia lista para enviar con el reporte.</p>}
            {pendingPhotoReportId ? (
              <IonButton expand="block" disabled={submitting} onClick={retryPhotoUpload}>
                <RefreshCw size={18} />
                <span>{submitting ? "Subiendo fotografia" : "Reintentar fotografia"}</span>
              </IonButton>
            ) : (
              <IonButton expand="block" disabled={submitting} onClick={submitReport}>
                <Send size={18} />
                <span>{submitting ? "Enviando reporte" : "Enviar reporte"}</span>
              </IonButton>
            )}
          </div>
        </main>
        <IonToast isOpen={Boolean(message)} message={message} duration={2200} onDidDismiss={() => setMessage("")} />
      </IonContent>
    </IonPage>
  );
}
