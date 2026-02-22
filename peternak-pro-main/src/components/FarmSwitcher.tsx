import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, Check } from "lucide-react";

export default function FarmSwitcher() {
  const [farms, setFarms] = useState<any[]>([]);
  const [currentFarm, setCurrentFarm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("user_farms")
        .select(`
          farm_id,
          is_active,
          farm:farms(name, address)
        `)
        .eq("user_id", user?.id)
        .eq("is_active", true);
      
      if (error) throw error;
      
      const farmData = data?.map(item => ({
        id: item.farm_id,
        name: item.farm?.name,
        address: item.farm?.address
      })) || [];
      
      setFarms(farmData);
      
      // Set current farm from localStorage or first farm
      const savedFarmId = localStorage.getItem("currentFarmId");
      const savedFarm = farmData.find(farm => farm.id === savedFarmId);
      
      if (savedFarm) {
        setCurrentFarm(savedFarm);
      } else if (farmData.length > 0) {
        setCurrentFarm(farmData[0]);
        localStorage.setItem("currentFarmId", farmData[0].id);
      }
    } catch (error) {
      console.error("Error fetching farms:", error);
    } finally {
      setLoading(false);
    }
  };

  const switchFarm = (farm: any) => {
    setCurrentFarm(farm);
    localStorage.setItem("currentFarmId", farm.id);
    // Reload page or refresh data
    window.location.reload();
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  if (loading || farms.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="hidden md:inline">
            {currentFarm?.name || "Pilih Peternakan"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-2 border-b">
          <p className="text-xs text-muted-foreground">Ganti Peternakan</p>
        </div>
        {farms.map((farm) => (
          <DropdownMenuItem
            key={farm.id}
            onClick={() => switchFarm(farm)}
            className="flex items-start gap-2 p-3"
          >
            <div className="flex-1">
              <p className="font-medium">{farm.name}</p>
              <p className="text-xs text-muted-foreground">{farm.address}</p>
            </div>
            {currentFarm?.id === farm.id && (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}