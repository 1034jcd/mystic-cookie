import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SavedFortune } from "@/hooks/useFortuneStore";
import { Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CollectionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fortunes: SavedFortune[];
  onRemove: (id: number) => void;
}

export function CollectionDrawer({ open, onOpenChange, fortunes, onRemove }: CollectionDrawerProps) {
  const [filterCat, setFilterCat] = useState<string>("All");

  const categories = ["All", "Love", "Career", "Health", "Wealth", "Wisdom"];
  const displayed = filterCat === "All" ? fortunes : fortunes.filter(f => f.category === filterCat);

  const handleExport = () => {
    if (fortunes.length === 0) return;
    
    let text = "--- MYSTIC COOKIE COLLECTION ---\n\n";
    fortunes.forEach(f => {
      text += `[${f.category}] ${new Date(f.date).toLocaleDateString()}\n`;
      text += `"${f.text}"\n`;
      text += `Lucky Numbers: ${f.luckyNumbers.join(', ')}\n\n`;
    });

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mystic_fortunes_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] sm:h-[85vh] bg-card border-t border-card-border overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-serif text-primary text-center">Scroll of Memories</SheetTitle>
          <SheetDescription className="text-center">
            Your saved fortunes from the Oracle.
          </SheetDescription>
        </SheetHeader>

        {fortunes.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-2xl mx-auto">
            {categories.map(cat => {
              const count = cat === "All" ? fortunes.length : fortunes.filter(f => f.category === cat).length;
              return (
                <Badge
                  key={cat}
                  variant={filterCat === cat ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1 ${filterCat === cat ? "bg-secondary text-secondary-foreground shadow-[0_0_10px_hsl(var(--secondary))]" : "hover:bg-secondary/20"}`}
                  onClick={() => setFilterCat(cat)}
                >
                  {cat} ({count})
                </Badge>
              );
            })}
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-4 pb-20">
          {displayed.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p>{fortunes.length === 0 ? "Your collection is empty." : "No fortunes found in this category."}</p>
              {fortunes.length === 0 && <p className="text-sm mt-2">Save a fortune to see it here.</p>}
            </div>
          ) : (
            displayed.map(f => (
              <div key={f.id} className="bg-background border border-border p-4 rounded-lg shadow-sm group">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                    {f.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(f.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="font-serif text-lg italic text-foreground my-3">
                  "{f.text}"
                </p>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-2">
                    {f.luckyNumbers.map((n, i) => (
                      <span key={i} className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-bold border border-secondary/20">
                        {n}
                      </span>
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemove(f.id)}
                    title="Remove from collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}

          {fortunes.length > 0 && (
            <div className="flex justify-center mt-8">
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export Scroll (.txt)
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
