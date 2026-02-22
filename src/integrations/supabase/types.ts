export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chart_of_accounts: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          type: Database["public"]["Enums"]["account_type"]
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          type: Database["public"]["Enums"]["account_type"]
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          type?: Database["public"]["Enums"]["account_type"]
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          code: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          pricing_tier: string | null
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          pricing_tier?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          pricing_tier?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_records: {
        Row: {
          created_at: string
          culled: number
          eggs_broken: number
          eggs_dirty: number
          eggs_grade_a: number
          eggs_grade_b: number
          eggs_grade_c: number
          eggs_kg: number
          eggs_total: number
          electricity_kwh: number | null
          feed_bran_kg: number
          feed_concentrate_kg: number
          feed_corn_kg: number
          feed_formula_id: string | null
          feed_kg: number
          feed_type: string | null
          flock_id: string
          id: string
          jual_ayam: number
          kandang_id: string
          medicine_notes: string | null
          mortality: number
          mortality_cause: string | null
          notes: string | null
          population_start: number
          record_date: string
          recorded_by: string | null
          transferred: number
          updated_at: string
          usia_minggu: number
          vaccination_notes: string | null
          vitamin_obat: string | null
          water_liters: number | null
        }
        Insert: {
          created_at?: string
          culled?: number
          eggs_broken?: number
          eggs_dirty?: number
          eggs_grade_a?: number
          eggs_grade_b?: number
          eggs_grade_c?: number
          eggs_kg?: number
          eggs_total?: number
          electricity_kwh?: number | null
          feed_bran_kg?: number
          feed_concentrate_kg?: number
          feed_corn_kg?: number
          feed_formula_id?: string | null
          feed_kg?: number
          feed_type?: string | null
          flock_id: string
          id?: string
          jual_ayam?: number
          kandang_id: string
          medicine_notes?: string | null
          mortality?: number
          mortality_cause?: string | null
          notes?: string | null
          population_start?: number
          record_date: string
          recorded_by?: string | null
          transferred?: number
          updated_at?: string
          usia_minggu?: number
          vaccination_notes?: string | null
          vitamin_obat?: string | null
          water_liters?: number | null
        }
        Update: {
          created_at?: string
          culled?: number
          eggs_broken?: number
          eggs_dirty?: number
          eggs_grade_a?: number
          eggs_grade_b?: number
          eggs_grade_c?: number
          eggs_kg?: number
          eggs_total?: number
          electricity_kwh?: number | null
          feed_bran_kg?: number
          feed_concentrate_kg?: number
          feed_corn_kg?: number
          feed_formula_id?: string | null
          feed_kg?: number
          feed_type?: string | null
          flock_id?: string
          id?: string
          jual_ayam?: number
          kandang_id?: string
          medicine_notes?: string | null
          mortality?: number
          mortality_cause?: string | null
          notes?: string | null
          population_start?: number
          record_date?: string
          recorded_by?: string | null
          transferred?: number
          updated_at?: string
          usia_minggu?: number
          vaccination_notes?: string | null
          vitamin_obat?: string | null
          water_liters?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_records_feed_formula_id_fkey"
            columns: ["feed_formula_id"]
            isOneToOne: false
            referencedRelation: "feed_formulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_records_flock_id_fkey"
            columns: ["flock_id"]
            isOneToOne: false
            referencedRelation: "flocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_records_kandang_id_fkey"
            columns: ["kandang_id"]
            isOneToOne: false
            referencedRelation: "kandang"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          address: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      feed_formulas: {
        Row: {
          bran_pct: number
          concentrate_pct: number
          corn_pct: number
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          bran_pct?: number
          concentrate_pct?: number
          corn_pct?: number
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          bran_pct?: number
          concentrate_pct?: number
          corn_pct?: number
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      flocks: {
        Row: {
          batch_code: string
          breed: string
          created_at: string
          current_population: number
          doc_date: string
          id: string
          initial_population: number
          is_active: boolean
          kandang_id: string
          stage: Database["public"]["Enums"]["flock_stage"]
          updated_at: string
        }
        Insert: {
          batch_code: string
          breed?: string
          created_at?: string
          current_population: number
          doc_date: string
          id?: string
          initial_population: number
          is_active?: boolean
          kandang_id: string
          stage?: Database["public"]["Enums"]["flock_stage"]
          updated_at?: string
        }
        Update: {
          batch_code?: string
          breed?: string
          created_at?: string
          current_population?: number
          doc_date?: string
          id?: string
          initial_population?: number
          is_active?: boolean
          kandang_id?: string
          stage?: Database["public"]["Enums"]["flock_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flocks_kandang_id_fkey"
            columns: ["kandang_id"]
            isOneToOne: false
            referencedRelation: "kandang"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string
          code: string
          created_at: string
          current_stock: number
          id: string
          is_active: boolean
          min_stock: number
          name: string
          price_per_unit: number
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          current_stock?: number
          id?: string
          is_active?: boolean
          min_stock?: number
          name: string
          price_per_unit?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          current_stock?: number
          id?: string
          is_active?: boolean
          min_stock?: number
          name?: string
          price_per_unit?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          item_id: string
          kandang_id: string | null
          notes: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
          tx_date: string
          tx_type: Database["public"]["Enums"]["inventory_tx_type"]
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id: string
          kandang_id?: string | null
          notes?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          tx_date?: string
          tx_type: Database["public"]["Enums"]["inventory_tx_type"]
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id?: string
          kandang_id?: string | null
          notes?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          tx_date?: string
          tx_type?: Database["public"]["Enums"]["inventory_tx_type"]
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_kandang_id_fkey"
            columns: ["kandang_id"]
            isOneToOne: false
            referencedRelation: "kandang"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          paid_amount: number
          paid_date: string | null
          so_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id: string
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          paid_amount?: number
          paid_date?: string | null
          so_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_amount?: number
          paid_date?: string | null
          so_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_so_id_fkey"
            columns: ["so_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          entry_date: string
          entry_number: string
          id: string
          is_auto: boolean
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          entry_date?: string
          entry_number: string
          id?: string
          is_auto?: boolean
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          entry_date?: string
          entry_number?: string
          id?: string
          is_auto?: boolean
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: []
      }
      journal_lines: {
        Row: {
          account_id: string
          credit: number
          debit: number
          description: string | null
          entry_id: string
          id: string
        }
        Insert: {
          account_id: string
          credit?: number
          debit?: number
          description?: string | null
          entry_id: string
          id?: string
        }
        Update: {
          account_id?: string
          credit?: number
          debit?: number
          description?: string | null
          entry_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      kandang: {
        Row: {
          capacity: number
          code: string
          created_at: string
          farm_id: string
          id: string
          is_active: boolean
          name: string
          type: Database["public"]["Enums"]["kandang_type"]
          updated_at: string
        }
        Insert: {
          capacity?: number
          code: string
          created_at?: string
          farm_id: string
          id?: string
          is_active?: boolean
          name: string
          type?: Database["public"]["Enums"]["kandang_type"]
          updated_at?: string
        }
        Update: {
          capacity?: number
          code?: string
          created_at?: string
          farm_id?: string
          id?: string
          is_active?: boolean
          name?: string
          type?: Database["public"]["Enums"]["kandang_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kandang_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      po_items: {
        Row: {
          id: string
          item_id: string
          po_id: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          id?: string
          item_id: string
          po_id: string
          quantity: number
          subtotal?: number
          unit_price: number
        }
        Update: {
          id?: string
          item_id?: string
          po_id?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "po_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category: string
          code: string
          created_at: string
          egg_size: string | null
          id: string
          is_active: boolean
          name: string
          unit: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          category?: string
          code: string
          created_at?: string
          egg_size?: string | null
          id?: string
          is_active?: boolean
          name: string
          unit?: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          category?: string
          code?: string
          created_at?: string
          egg_size?: string | null
          id?: string
          is_active?: boolean
          name?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string | null
          expected_date: string | null
          id: string
          notes: string | null
          order_date: string
          po_number: string
          received_date: string | null
          status: Database["public"]["Enums"]["po_status"]
          supplier_name: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number: string
          received_date?: string | null
          status?: Database["public"]["Enums"]["po_status"]
          supplier_name: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          received_date?: string | null
          status?: Database["public"]["Enums"]["po_status"]
          supplier_name?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      sales_orders: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string
          delivery_date: string | null
          discount_amount: number
          id: string
          notes: string | null
          order_date: string
          so_number: string
          status: Database["public"]["Enums"]["so_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id: string
          delivery_date?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          order_date?: string
          so_number: string
          status?: Database["public"]["Enums"]["so_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string
          delivery_date?: string | null
          discount_amount?: number
          id?: string
          notes?: string | null
          order_date?: string
          so_number?: string
          status?: Database["public"]["Enums"]["so_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      so_items: {
        Row: {
          discount_pct: number
          id: string
          product_id: string
          quantity: number
          so_id: string
          subtotal: number
          unit_price: number
        }
        Insert: {
          discount_pct?: number
          id?: string
          product_id: string
          quantity: number
          so_id: string
          subtotal?: number
          unit_price: number
        }
        Update: {
          discount_pct?: number
          id?: string
          product_id?: string
          quantity?: number
          so_id?: string
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "so_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "so_items_so_id_fkey"
            columns: ["so_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_type: "asset" | "liability" | "equity" | "revenue" | "expense"
      app_role:
        | "super_admin"
        | "farm_manager"
        | "kandang_supervisor"
        | "keuangan"
        | "logistik"
      egg_grade: "A" | "B" | "C"
      flock_stage: "doc" | "brooding" | "grower" | "layer" | "depopulation"
      inventory_tx_type:
        | "purchase"
        | "usage"
        | "transfer_in"
        | "transfer_out"
        | "adjustment"
        | "sale"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      kandang_type: "cage" | "floor"
      po_status: "draft" | "approved" | "received" | "cancelled"
      so_status:
        | "draft"
        | "confirmed"
        | "picking"
        | "packing"
        | "shipped"
        | "invoiced"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["asset", "liability", "equity", "revenue", "expense"],
      app_role: [
        "super_admin",
        "farm_manager",
        "kandang_supervisor",
        "keuangan",
        "logistik",
      ],
      egg_grade: ["A", "B", "C"],
      flock_stage: ["doc", "brooding", "grower", "layer", "depopulation"],
      inventory_tx_type: [
        "purchase",
        "usage",
        "transfer_in",
        "transfer_out",
        "adjustment",
        "sale",
      ],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      kandang_type: ["cage", "floor"],
      po_status: ["draft", "approved", "received", "cancelled"],
      so_status: [
        "draft",
        "confirmed",
        "picking",
        "packing",
        "shipped",
        "invoiced",
        "cancelled",
      ],
    },
  },
} as const
