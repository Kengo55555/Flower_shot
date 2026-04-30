import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { GeoLocation } from "../types";

interface CaptureState {
  imageFile: File | null;
  compressedBlob: Blob | null;
  imagePreviewUrl: string | null;
  location: GeoLocation | null;
  isLocationRecorded: boolean;
}

interface CaptureContextType extends CaptureState {
  setCaptureData: (data: Partial<CaptureState>) => void;
  clearCaptureData: () => void;
}

const initialState: CaptureState = {
  imageFile: null,
  compressedBlob: null,
  imagePreviewUrl: null,
  location: null,
  isLocationRecorded: false,
};

const CaptureContext = createContext<CaptureContextType>({
  ...initialState,
  setCaptureData: () => {},
  clearCaptureData: () => {},
});

export function CaptureProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CaptureState>(initialState);

  const setCaptureData = useCallback((data: Partial<CaptureState>) => {
    setState((prev) => ({ ...prev, ...data }));
  }, []);

  const clearCaptureData = useCallback(() => {
    if (state.imagePreviewUrl) {
      URL.revokeObjectURL(state.imagePreviewUrl);
    }
    setState(initialState);
  }, [state.imagePreviewUrl]);

  return (
    <CaptureContext.Provider value={{ ...state, setCaptureData, clearCaptureData }}>
      {children}
    </CaptureContext.Provider>
  );
}

export function useCapture() {
  return useContext(CaptureContext);
}
