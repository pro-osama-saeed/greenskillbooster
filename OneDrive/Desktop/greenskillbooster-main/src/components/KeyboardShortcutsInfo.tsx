import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Keyboard } from "lucide-react";

export const KeyboardShortcutsInfo = () => {
  const shortcuts = [
    { key: "/", description: "Focus search input" },
    { key: "Esc", description: "Close modal or unfocus input" },
    { key: "Alt + H", description: "Go to Home" },
    { key: "Alt + L", description: "Go to Lessons" },
    { key: "Alt + C", description: "Go to Community" },
    { key: "Alt + B", description: "Go to Badges" },
    { key: "Alt + D", description: "Go to Dashboard" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Keyboard className="h-5 w-5" />
          Keyboard Shortcuts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-background border border-border rounded">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
