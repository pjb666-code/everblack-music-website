import type { ColorScheme } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const defaultColors: ColorScheme = {
  primaryColor: "#0D9488",
  secondaryColor: "#2a2a2a",
  backgroundColor: "#0d0d0d",
  textColor: "#f0ede6",
  gradientEnabled: false,
  gradientStartColor: "#0D9488",
  gradientEndColor: "#0f766e",
};

type ColorInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  helperText?: string;
};

function ColorInput({
  id,
  label,
  value,
  onChange,
  helperText,
}: ColorInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <div className="relative shrink-0">
          <input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-md border border-input cursor-pointer bg-transparent p-0.5"
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono text-sm"
        />
      </div>
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

export default function AdminColors() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [useGradient, setUseGradient] = useState(false);

  const { data: colorScheme } = useQuery({
    queryKey: ["color-scheme"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getColorScheme();
    },
    enabled: !!actor,
  });

  const [colors, setColors] = useState<ColorScheme>(defaultColors);

  useEffect(() => {
    if (colorScheme) {
      setColors(colorScheme);
      setUseGradient(
        !!(colorScheme.gradientStartColor && colorScheme.gradientEndColor),
      );
    }
  }, [colorScheme]);

  const updateMutation = useMutation({
    mutationFn: async (newScheme: ColorScheme) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateColorScheme(newScheme);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["color-scheme"] });
      toast.success("Farbschema erfolgreich gespeichert");
      applyColorsToCSS();
    },
    onError: (error: Error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const applyColorsToCSS = () => {
    const root = document.documentElement;
    if (useGradient && colors.gradientStartColor && colors.gradientEndColor) {
      root.style.setProperty("--gradient-start", colors.gradientStartColor);
      root.style.setProperty("--gradient-end", colors.gradientEndColor);
      root.style.setProperty("--use-gradient", "1");
    } else {
      root.style.setProperty("--use-gradient", "0");
    }
  };

  const handleReset = () => {
    if (colorScheme) {
      setColors(colorScheme);
      setUseGradient(
        !!(colorScheme.gradientStartColor && colorScheme.gradientEndColor),
      );
    }
  };

  const handleSubmit = () => {
    const schemeToSave: ColorScheme = {
      ...colors,
      gradientEnabled: useGradient,
      gradientStartColor: useGradient
        ? colors.gradientStartColor || "#0D9488"
        : colors.gradientStartColor,
      gradientEndColor: useGradient
        ? colors.gradientEndColor || "#0f766e"
        : colors.gradientEndColor,
    };
    updateMutation.mutate(schemeToSave);
  };

  const gradientStyle =
    useGradient && colors.gradientStartColor && colors.gradientEndColor
      ? {
          background: `linear-gradient(135deg, ${colors.gradientStartColor}, ${colors.gradientEndColor})`,
        }
      : { backgroundColor: colors.primaryColor };

  return (
    <div className="space-y-6">
      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Vorschau</CardTitle>
          <CardDescription>
            So sehen deine Highlight-Farben auf der Website aus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-xl p-6 space-y-4"
            style={{ backgroundColor: colors.backgroundColor }}
          >
            <h3
              className="font-bold text-xl"
              style={{ color: colors.textColor }}
            >
              Professioneller Gitarrenunterricht
            </h3>
            <p
              className="text-sm"
              style={{ color: colors.textColor, opacity: 0.7 }}
            >
              Gitarrenunterricht in Aachen und online — individuell für dich.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                className="px-5 py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
                style={{
                  ...gradientStyle,
                  color: "#fff",
                }}
              >
                Jetzt starten
              </button>
              <button
                type="button"
                className="px-5 py-2 rounded-lg font-semibold text-sm border"
                style={{
                  borderColor: colors.primaryColor,
                  color: colors.primaryColor,
                  backgroundColor: "transparent",
                }}
              >
                Mehr erfahren
              </button>
            </div>
            {useGradient &&
              colors.gradientStartColor &&
              colors.gradientEndColor && (
                <p
                  className="text-sm font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${colors.gradientStartColor}, ${colors.gradientEndColor})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Gradient-Text Beispiel
                </p>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Color controls */}
      <Card>
        <CardHeader>
          <CardTitle>Farbeinstellungen</CardTitle>
          <CardDescription>
            Passe die Farben der Website an. Änderungen sehen live in der
            Vorschau oben.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-5">
            <ColorInput
              id="primary-color"
              label="Highlight-Farbe (Primär)"
              value={colors.primaryColor}
              onChange={(v) => setColors({ ...colors, primaryColor: v })}
              helperText="Für Buttons, Links und Akzente"
            />
            <ColorInput
              id="secondary-color"
              label="Sekundärfarbe"
              value={colors.secondaryColor}
              onChange={(v) => setColors({ ...colors, secondaryColor: v })}
            />
            <ColorInput
              id="background-color"
              label="Hintergrundfarbe"
              value={colors.backgroundColor}
              onChange={(v) => setColors({ ...colors, backgroundColor: v })}
            />
            <ColorInput
              id="text-color"
              label="Textfarbe"
              value={colors.textColor}
              onChange={(v) => setColors({ ...colors, textColor: v })}
            />
          </div>

          {/* Gradient toggle */}
          <div className="border-t pt-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="gradient-toggle" className="text-base">
                  Gradient-Highlights
                </Label>
                <p className="text-sm text-muted-foreground">
                  Buttons und Text werden mit einem Farbverlauf dargestellt
                </p>
              </div>
              <Switch
                id="gradient-toggle"
                checked={useGradient}
                onCheckedChange={setUseGradient}
              />
            </div>

            {useGradient && (
              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <ColorInput
                    id="gradient-start"
                    label="Gradient Startfarbe"
                    value={colors.gradientStartColor || "#0D9488"}
                    onChange={(v) =>
                      setColors({ ...colors, gradientStartColor: v })
                    }
                  />
                  <ColorInput
                    id="gradient-end"
                    label="Gradient Endfarbe"
                    value={colors.gradientEndColor || "#0f766e"}
                    onChange={(v) =>
                      setColors({ ...colors, gradientEndColor: v })
                    }
                  />
                </div>
                <div>
                  <Label className="text-sm">Gradient-Vorschau</Label>
                  <div
                    className="h-12 rounded-lg mt-2 border border-border/50"
                    style={{
                      background: `linear-gradient(to right, ${colors.gradientStartColor || "#0D9488"}, ${colors.gradientEndColor || "#0f766e"})`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
              data-ocid="colors-save"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Farbschema speichern
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Zurücksetzen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
