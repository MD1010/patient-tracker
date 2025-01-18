import { Label } from "@/components/ui/label";
import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "@/components/Patient/MedicalRegistrationForm";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { TrashIcon } from "lucide-react";
import { Button } from "./ui/button";

interface ESignatureProps {
  form: UseFormReturn<FormData>;
  isEditMode: boolean;
}

export function ESignature({ form, isEditMode }: ESignatureProps) {
  const { setValue, watch } = form;
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const clearSignature = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling up
    sigCanvasRef.current?.clear();
    setValue("signature", undefined);
  };

  const handleBlur = () => {
    if (sigCanvasRef.current?.isEmpty()) {
      setValue("signature", undefined);
      return;
    }

    const signatureURL = sigCanvasRef.current?.toDataURL();
    setValue("signature", signatureURL);
  };

  return (
    <div className="space-y-4">
      {isEditMode && watch("signature") ? (
        <div className="mt-4 mb-2">
          <Label className="block mb-4 font-semibold">
            נחתם בתאריך {format(new Date(), "dd/MM/yyyy")}
          </Label>
          <img
            src={watch("signature")}
            alt="חתימת המטופל"
            className="border rounded-md max-w-full"
          />
        </div>
      ) : (
        <>
          <Label className="block mb-2 font-semibold">חתימת המטופל</Label>
          <div className="relative border rounded-md p-2">
            <Button
              size="icon"
              variant={"ghost"}
              onClick={clearSignature}
              onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
              className="absolute top-2 left-2 rounded-lg p-1 shadow-md focus:outline-none bg-white/10"
              aria-label="Clear Signature"
            >
              <TrashIcon className="w-5 h-5 text-foreground" />
            </Button>

            <SignatureCanvas
              ref={sigCanvasRef}
              canvasProps={{
                className: "w-full h-full rounded-md",
                onBlur: handleBlur,
                tabIndex: 0,
              }}
              clearOnResize={false}
              penColor={isDarkMode ? "white" : "black"}
            />
          </div>
        </>
      )}
    </div>
  );
}
