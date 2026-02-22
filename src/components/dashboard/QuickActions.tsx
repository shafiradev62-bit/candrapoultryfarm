import { ClipboardEdit, FileText, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    title: "Catat Produksi Harian",
    description: "Input telur, mortalitas, pakan",
    icon: ClipboardEdit,
    href: "/operasi",
  },
  {
    title: "Buat PO Pakan",
    description: "Purchase order pakan baru",
    icon: ShoppingCart,
    href: "/inventori",
  },
  {
    title: "Invoice Belum Dibayar",
    description: "3 invoice menunggu pembayaran",
    icon: FileText,
    href: "/keuangan",
  },
];

export function QuickActions() {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="section-title">Aksi Cepat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Button
            key={action.title}
            variant="ghost"
            className="w-full justify-start h-auto py-3 px-3 hover:bg-muted"
            asChild
          >
            <a href={action.href}>
              <action.icon className="h-4 w-4 mr-3 text-primary shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </a>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
