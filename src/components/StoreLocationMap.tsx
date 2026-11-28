import { useCallback, useEffect, useState } from "react";
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
} from "@vis.gl/react-google-maps";

const STORE_POSITION = { lat: 13.1118495, lng: 80.2493876 };
const STORE_MAPS_URL =
  "https://www.google.com/maps/place/Eshwar+Home+Products/@13.1118547,80.2468127,17z/data=!3m1!4b1!4m6!3m5!1s0x3a526569af8122ad:0xe485caf4b8adf074!8m2!3d13.1118495!4d80.2493876!16s%2Fg%2F11v4j6lc03";
const QUOTA_DOCS_URL =
  "https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors";

const GMP_QUOTA_EVENT = "gmp-quota-exceeded";
const CONSOLE_TAP_FLAG = "__ehpGmpConsoleTapped";

function registerGlobalQuotaListeners(): void {
  if (typeof window === "undefined") return;

  const win = window as Window & {
    gm_authFailure?: () => void;
    [CONSOLE_TAP_FLAG]?: boolean;
  };

  win.gm_authFailure = () => {
    window.dispatchEvent(new CustomEvent(GMP_QUOTA_EVENT));
  };

  if (!win[CONSOLE_TAP_FLAG]) {
    win[CONSOLE_TAP_FLAG] = true;
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      origError.apply(console, args);
      const msg = args.map((arg) => String(arg)).join(" ");
      if (
        msg.includes("OverQuotaMapError") ||
        msg.includes("QuotaExceededError")
      ) {
        window.dispatchEvent(new CustomEvent(GMP_QUOTA_EVENT));
      }
    };
  }
}

interface StoreLocationMapProps {
  compact?: boolean;
}

interface StoreMapCanvasProps {
  compact?: boolean;
  onStatusChange: (status: APILoadingStatus) => void;
}

function StoreMapCanvas({ compact = false, onStatusChange }: StoreMapCanvasProps) {
  const map = useMap();
  const status = useApiLoadingStatus();
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(!compact);
  const [activeZoom, setActiveZoom] = useState<"store" | "area">("store");

  useEffect(() => {
    onStatusChange(status);
    if (status === APILoadingStatus.AUTH_FAILURE && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(GMP_QUOTA_EVENT));
    }
  }, [status, onStatusChange]);

  const handleFocusStore = useCallback(() => {
    if (map) {
      map.panTo(STORE_POSITION);
      map.setZoom(16);
    }
    setActiveZoom("store");
    setInfoOpen(true);
  }, [map]);

  const handleAreaView = useCallback(() => {
    if (map) {
      map.panTo(STORE_POSITION);
      map.setZoom(14);
    }
    setActiveZoom("area");
  }, [map]);

  const handleToggleInfo = useCallback(() => {
    setInfoOpen((prev) => !prev);
  }, []);

  if (
    status === APILoadingStatus.FAILED ||
    status === APILoadingStatus.AUTH_FAILURE
  ) {
    return (
      <div className={compact ? "ehp-gmap-fallback ehp-gmap-fallback--compact" : "ehp-gmap-fallback"}>
        <p className="ehp-gmap-fallback-kicker">Interactive map unavailable right now</p>
        <strong>Eshwar Home Products · Perambur</strong>
        <p>119/1, Paddy Field Rd, Chinnaiyan Colony, Perambur, Chennai 600011</p>
        <a
          className="ehp-gmap-ext-link"
          href={STORE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Google Maps ↗
        </a>
      </div>
    );
  }

  return (
    <div className="ehp-gmap-inner">
      <div className="ehp-gmap-toolbar" role="group" aria-label="Map view controls">
        <div className="ehp-gmap-btn-row">
          <button
            type="button"
            className="ehp-gmap-btn"
            aria-pressed={activeZoom === "store"}
            onClick={handleFocusStore}
          >
            Store pin
          </button>
          <button
            type="button"
            className="ehp-gmap-btn"
            aria-pressed={activeZoom === "area"}
            onClick={handleAreaView}
          >
            Perambur area
          </button>
          <button
            type="button"
            className="ehp-gmap-btn"
            aria-pressed={infoOpen}
            onClick={handleToggleInfo}
          >
            {infoOpen ? "Hide info" : "Store info"}
          </button>
        </div>
        <span className="ehp-gmap-hint">Mon–Sat · 9 AM – 9 PM</span>
      </div>

      <div
        className={
          compact ? "ehp-gmap-frame ehp-gmap-frame--compact" : "ehp-gmap-frame"
        }
      >
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={STORE_POSITION}
          defaultZoom={16}
          gestureHandling="cooperative"
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={!compact}
          internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
          style={{ width: "100%", height: "100%" }}
        >
          <AdvancedMarker
            ref={markerRef}
            position={STORE_POSITION}
            title="Eshwar Home Products — Perambur, Chennai"
            onClick={() => setInfoOpen((prev) => !prev)}
          >
            <Pin
              background="#422719"
              borderColor="#7F4E1B"
              glyphColor="#E4B76A"
              scale={1.15}
            />
          </AdvancedMarker>

          {infoOpen && marker && (
            <InfoWindow
              anchor={marker}
              maxWidth={250}
              onCloseClick={() => setInfoOpen(false)}
            >
              <div className="ehp-gmap-infowindow">
                <strong>Eshwar Home Products</strong>
                <p>
                  119/1, Paddy Field Rd, Chinnaiyan Colony, Perambur, Chennai
                  600011
                </p>
                <p className="ehp-gmap-hours">Mon–Sat: 9:00 AM – 9:00 PM · Sun: Closed</p>
                <a
                  href={STORE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open directions ↗
                </a>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </div>
  );
}

export default function StoreLocationMap({
  compact = false,
}: StoreLocationMapProps) {
  const apiKey = (
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY ||
    ""
  ).trim();

  const [mounted, setMounted] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [loadStatus, setLoadStatus] = useState<APILoadingStatus>(
    APILoadingStatus.NOT_LOADED
  );

  useEffect(() => {
    setMounted(true);
    registerGlobalQuotaListeners();
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener(GMP_QUOTA_EVENT, handleQuotaExceeded);
    return () => {
      window.removeEventListener(GMP_QUOTA_EVENT, handleQuotaExceeded);
    };
  }, []);

  return (
    <div
      className={compact ? "ehp-gmap-shell ehp-gmap-shell--compact" : "ehp-gmap-shell"}
      aria-label="Interactive Google Map for Eshwar Home Products in Perambur"
    >
      {quotaExceeded && (
        <div
          className="ehp-gmap-quota-banner"
          role="status"
          aria-live="polite"
        >
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{" "}
            <a
              href={QUOTA_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              maps developer site
            </a>{" "}
            for instructions to update your account.
          </span>
        </div>
      )}

      {mounted && apiKey ? (
        <APIProvider apiKey={apiKey} libraries={["marker"]} language="en" region="IN">
          <StoreMapCanvas compact={compact} onStatusChange={setLoadStatus} />
        </APIProvider>
      ) : (
        <div
          className={
            compact
              ? "ehp-gmap-fallback ehp-gmap-fallback--compact"
              : "ehp-gmap-fallback"
          }
          data-map-status={loadStatus}
        >
          <p className="ehp-gmap-fallback-kicker">Store Location · Perambur</p>
          <strong>Eshwar Home Products</strong>
          <p>
            119/1, Paddy Field Rd, Chinnaiyan Colony, Perambur, Chennai, Tamil
            Nadu 600011
          </p>
          <a
            className="ehp-gmap-ext-link"
            href={STORE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open directions in Google Maps ↗
          </a>
        </div>
      )}
    </div>
  );
}
