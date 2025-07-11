export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          allowOffers: boolean
          createdAt: string | null
          description: string
          end: string
          flyer: string | null
          fts: unknown | null
          id: string
          linkedRepeat: string | null
          name: string
          performer: string
          start: string
          venue: string
        }
        Insert: {
          allowOffers?: boolean
          createdAt?: string | null
          description?: string
          end: string
          flyer?: string | null
          fts?: unknown | null
          id?: string
          linkedRepeat?: string | null
          name: string
          performer?: string
          start: string
          venue: string
        }
        Update: {
          allowOffers?: boolean
          createdAt?: string | null
          description?: string
          end?: string
          flyer?: string | null
          fts?: unknown | null
          id?: string
          linkedRepeat?: string | null
          name?: string
          performer?: string
          start?: string
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_linkedRepeat_fkey"
            columns: ["linkedRepeat"]
            referencedRelation: "repeating_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_fkey"
            columns: ["venue"]
            referencedRelation: "venues"
            referencedColumns: ["id"]
          }
        ]
      }
      listings: {
        Row: {
          collectInPerson: boolean
          createdAt: string | null
          currInventory: number
          custom: boolean
          customExpiry: string | null
          customForUser: string | null
          description: string | null
          event: string
          heldInventory: number
          id: string
          maxInventory: number
          maxPerOrder: number | null
          minPerOrder: number
          name: string
          peoplePerListing: number | null
          price: number
          purchasePolicy: string
          purchaseTimeLimit: string
          refundTimeLimit: string
          soldInventory: number
          type: number
        }
        Insert: {
          collectInPerson?: boolean
          createdAt?: string | null
          currInventory: number
          custom?: boolean
          customExpiry?: string | null
          customForUser?: string | null
          description?: string | null
          event: string
          heldInventory?: number
          id?: string
          maxInventory: number
          maxPerOrder?: number | null
          minPerOrder?: number
          name: string
          peoplePerListing?: number | null
          price?: number
          purchasePolicy?: string
          purchaseTimeLimit?: string
          refundTimeLimit: string
          soldInventory?: number
          type?: number
        }
        Update: {
          collectInPerson?: boolean
          createdAt?: string | null
          currInventory?: number
          custom?: boolean
          customExpiry?: string | null
          customForUser?: string | null
          description?: string | null
          event?: string
          heldInventory?: number
          id?: string
          maxInventory?: number
          maxPerOrder?: number | null
          minPerOrder?: number
          name?: string
          peoplePerListing?: number | null
          price?: number
          purchasePolicy?: string
          purchaseTimeLimit?: string
          refundTimeLimit?: string
          soldInventory?: number
          type?: number
        }
        Relationships: [
          {
            foreignKeyName: "listings_customForUser_fkey"
            columns: ["customForUser"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_event_fkey"
            columns: ["event"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
      locations: {
        Row: {
          createdAt: string
          id: string
          name: string
          timezone: string
        }
        Insert: {
          createdAt?: string
          id?: string
          name: string
          timezone: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          timezone?: string
        }
        Relationships: []
      }
      map_vendor_venue: {
        Row: {
          createdAt: string
          id: string
          vendor: string
          venue: string
        }
        Insert: {
          createdAt?: string
          id?: string
          vendor: string
          venue: string
        }
        Update: {
          createdAt?: string
          id?: string
          vendor?: string
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "map_vendor_venue_vendor_fkey"
            columns: ["vendor"]
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_vendor_venue_venue_fkey"
            columns: ["venue"]
            referencedRelation: "venues"
            referencedColumns: ["id"]
          }
        ]
      }
      offer_channels: {
        Row: {
          createdAt: string
          event: string
          id: string
          user: string
        }
        Insert: {
          createdAt?: string
          event: string
          id?: string
          user: string
        }
        Update: {
          createdAt?: string
          event?: string
          id?: string
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_channels_event_fkey"
            columns: ["event"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_channels_user_fkey"
            columns: ["user"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      order_listings: {
        Row: {
          createdAt: string
          id: string
          listing: string
          order: string
          quantity: number
        }
        Insert: {
          createdAt?: string
          id?: string
          listing: string
          order: string
          quantity?: number
        }
        Update: {
          createdAt?: string
          id?: string
          listing?: string
          order?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_listings_listing_fkey"
            columns: ["listing"]
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_listings_order_fkey"
            columns: ["order"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          checkedIn: boolean
          createdAt: string
          currCheckedIn: number
          event: string
          id: string
          lastActive: string
          maxToCheckIn: number | null
          state: number
          stripePaymentIntentID: string | null
          stripeRefundID: string | null
          user: string | null
          venue: string | null
        }
        Insert: {
          checkedIn?: boolean
          createdAt?: string
          currCheckedIn?: number
          event: string
          id?: string
          lastActive?: string
          maxToCheckIn?: number | null
          state?: number
          stripePaymentIntentID?: string | null
          stripeRefundID?: string | null
          user?: string | null
          venue?: string | null
        }
        Update: {
          checkedIn?: boolean
          createdAt?: string
          currCheckedIn?: number
          event?: string
          id?: string
          lastActive?: string
          maxToCheckIn?: number | null
          state?: number
          stripePaymentIntentID?: string | null
          stripeRefundID?: string | null
          user?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_event_fkey"
            columns: ["event"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_fkey"
            columns: ["user"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_venue_fkey"
            columns: ["venue"]
            referencedRelation: "venues"
            referencedColumns: ["id"]
          }
        ]
      }
      repeating_events: {
        Row: {
          createdAt: string
          id: string
          repeatStrategy: string
        }
        Insert: {
          createdAt?: string
          id?: string
          repeatStrategy: string
        }
        Update: {
          createdAt?: string
          id?: string
          repeatStrategy?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          createdAt: string
          dateOfBirth: string | null
          email: string | null
          firstName: string | null
          id: string
          lastName: string | null
          phoneNumber: string
          streamChatToken: string
          stripeCustomerID: string
        }
        Insert: {
          createdAt?: string
          dateOfBirth?: string | null
          email?: string | null
          firstName?: string | null
          id: string
          lastName?: string | null
          phoneNumber: string
          streamChatToken: string
          stripeCustomerID: string
        }
        Update: {
          createdAt?: string
          dateOfBirth?: string | null
          email?: string | null
          firstName?: string | null
          id?: string
          lastName?: string | null
          phoneNumber?: string
          streamChatToken?: string
          stripeCustomerID?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      vendors: {
        Row: {
          admin: boolean
          createdAt: string
          email: string
          id: string
          manager: boolean
          streamChatToken: string
          superAdmin: boolean
        }
        Insert: {
          admin?: boolean
          createdAt?: string
          email: string
          id: string
          manager?: boolean
          streamChatToken?: string
          superAdmin?: boolean
        }
        Update: {
          admin?: boolean
          createdAt?: string
          email?: string
          id?: string
          manager?: boolean
          streamChatToken?: string
          superAdmin?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "vendors_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      venues: {
        Row: {
          address: string
          avatar: string
          banner: string
          cost: number
          createdAt: string
          description: string
          fts: unknown
          id: string
          location: string
          name: string
          neighborhood: string
          salesTax: number
          supportEmail: string
          type: string
        }
        Insert: {
          address: string
          avatar: string
          banner: string
          cost: number
          createdAt?: string
          description?: string
          fts?: unknown
          id?: string
          location: string
          name: string
          neighborhood: string
          salesTax?: number
          supportEmail?: string
          type: string
        }
        Update: {
          address?: string
          avatar?: string
          banner?: string
          cost?: number
          createdAt?: string
          description?: string
          fts?: unknown
          id?: string
          location?: string
          name?: string
          neighborhood?: string
          salesTax?: number
          supportEmail?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "venues_location_fkey"
            columns: ["location"]
            referencedRelation: "locations"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_in: {
        Args: {
          vendor_id: string
          order_id: string
          quantity: number
        }
        Returns: undefined
      }
      complete_order: {
        Args: {
          order_id: string
        }
        Returns: undefined
      }
      complete_refund_order: {
        Args: {
          order_id: string
          stripe_refund_id: string
        }
        Returns: undefined
      }
      declare_stale_order: {
        Args: {
          order_id: string
        }
        Returns: string
      }
      init_refund_order: {
        Args: {
          order_id: string
          user_id: string
        }
        Returns: string
      }
      release_stale_orders: {
        Args: Record<PropertyKey, never>
        Returns: {
          stripe_payment_intent_id: string
        }[]
      }
      update_order_listing: {
        Args: {
          p_orderid: string
          p_listingid: string
          p_quantity: number
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

