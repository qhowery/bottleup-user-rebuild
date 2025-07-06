import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Database } from "./database.types";
import { StreamChat } from 'stream-chat';


export const version = '0.1.0';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key)
  },
}

const supabaseUrl = "https://lafokgenyynjprbkpjvb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhZm9rZ2VueXluanByYmtwanZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODU5OTMyOTYsImV4cCI6MjAwMTU2OTI5Nn0.JxnJezoIzolsFepBqddmYpOkhPYQK0wmKKS5fymAQ6Q";
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});


const streamChatAPIKey = 'xxbn3dy4m94c';
export const streamChatClient = StreamChat.getInstance(streamChatAPIKey);


export const constants = {
  stripePublishableKey: 'pk_test_zRAF7nn7FrwMcRx1gPeQ8wA7',
  streamChatTokenSecureStorageKey: 'streamChatToken',
  streamChatChannelType: 'commerce'
}


export const endpoints = {
  auth: {
    createSession: 'https://create-session.bottleup.workers.dev',
    initPhoneVerification: 'https://init-phone-verification.bottleup.workers.dev',
    populateUser: 'https://populate-user.bottleup.workers.dev',
    verifyToken:'https://verify-token.bottleup.workers.dev',
  },
  checkout: {
    createOrder: 'https://create-order.bottleup.workers.dev',
    updateOrder: 'https://update-order.bottleup.workers.dev',
    calculateOrderCost: 'https://calculate-order-cost.bottleup.workers.dev',
    prepareOrderPayment: 'https://prepare-order-payment.bottleup.workers.dev',
    declareStale: 'https://declare-stale.bottleup.workers.dev',
    refundOrder: 'https://refund-order.bottleup.workers.dev'
  },
  messaging: {
    createSupportChat: 'https://create-support-chat.bottleup.workers.dev'
  }
};


export const theme = {
  color: {
    invisible: "#00000000",
    bgDark: "#05060e",
    bg: "#0a0b1c",
    bgTint: "#181828",
    bgComponent: "#2d3140",
    bgBorderMuted: "#1f202b",
    bgBorder: "#2f2f3e",
    secondary: "#7e8996",
    text: "#ffffff",
    primary: "#50d9e3",
    hamburgerIconColor: "#979797",
    ticket: "#F9CC6F",
    table: "#42FFF2",
    semiTransparentBlack: "rgba(0,0,0,0.5)",
    indigo: '#3023AE',
    purplePink: '#C86DD7',
    chat: '#0077FF',
    chatBg: '#3a9aff',
    textPayment: '#50E3C2',
    bgPayment: '#40CEA5',
    success: '#57DC89',
    textBad: '#F96F6F',
    settings: '#50A2FF',
    helpDesk: '#57CD89',
    inviteFriends: '#59FF42',
    legal: '#F9CC6F',
    logOut: '#7E8996'
  },
  fontSize: {
    standard: 16,
    small: 13,
    large: 20,
    larger: 24
  },
  fontFamily: {
    medium: 'Avenir-Medium',
    heavy: 'Avenir-Heavy',
    black: 'Avenir-Black',
    din: 'DIN-Alternate-Bold'
  },
  radius: {
    small: 5,
    standard: 9,
    big: 18,
    extraBig: 25
  }
}


// postgresql data standardization
const selectLocation = 'id, name, timezone' as const;
export interface Location {
  id: string,
  name: string,
  timezone: string
}

const selectVenue = 'id, banner, avatar, name, type, address, cost, location, description, neighborhood, supportEmail, salesTax' as const;
export interface Venue {
  id: string
  banner: string
  avatar: string
  name: string
  type: string
  address: string
  cost: number
  location: string
  description: string
  neighborhood: string
  supportEmail: string
  salesTax: number
}

const selectListing = 'id, name, maxInventory, currInventory, price, description, minPerOrder, maxPerOrder, purchasePolicy, event, collectInPerson, heldInventory, soldInventory, type, custom, customForUser, customExpiry, peoplePerListing, refundTimeLimit, purchaseTimeLimit' as const;
export interface Listing {
  id: string
  name: string
  maxInventory: number
  currInventory: number
  price: number
  description: string | null
  minPerOrder: number
  maxPerOrder: number | null
  purchasePolicy: string
  event: string
  collectInPerson: boolean
  heldInventory: number
  soldInventory: number
  type: number
  custom: boolean
  customForUser: string | null
  customExpiry: string | null
  peoplePerListing: number | null,
  refundTimeLimit: string,
  purchaseTimeLimit: string
}

const selectEvent = `id, flyer, name, description, start, end, performer, allowOffers, venue(${selectVenue}), listings(${selectListing}), linkedRepeat` as const;
export interface Event {
  id: string
  flyer: string | null
  name: string
  description: string
  start: string
  end: string
  performer: string
  allowOffers: boolean
  venue: Venue,
  listings: Listing[],
  linkedRepeat: string | null
}

const selectEventMinimal = `id, flyer, name, description, start, end, performer, allowOffers, linkedRepeat` as const;
export interface EventMinimal {
  id: string
  flyer: string | null
  name: string
  description: string
  start: string
  end: string
  performer: string
  allowOffers: boolean,
  linkedRepeat: string
}

const selectOrderListing = `id, listing(${selectListing}), quantity` as const;
export interface OrderListing {
  id: string,
  listing: Listing,
  quantity: number,
}

const selectOrder = `id, event(${selectEventMinimal}), venue(${selectVenue}), order_listings(${selectOrderListing}), state, maxToCheckIn, currCheckedIn, checkedIn` as const;
export interface Order {
  id: string,
  event: EventMinimal,
  venue: Venue,
  order_listings: OrderListing[],
  state: number,
  maxToCheckIn: number | null,
  currCheckedIn: number,
  checkedIn: boolean
}

export interface CartItem {
  listing: Listing,
  quantity: number
}

export interface UserInfo {
  id: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  email: string,
  dateOfBirth: string,
  streamChatToken: string,
}

export interface Cost {
  subtotal: number,
  bookingDeposit: number,
  salesTax: number,
  total: number,
  payableAtVenue: number,
  dueNow: number
}


export const select = {
  location: selectLocation,
  venue: selectVenue,
  listing: selectListing,
  event: selectEvent,
  order: selectOrder,
} as const;


export const useStore = create<{
  events: Event[],
  setEvents: (newEvents: Event[]) => void,
  updateSingleEvent: (event: Event) => void,
  setEventListings: (eventID: string, listings: Listing[]) => void,
  userLocation: Location | null,
  setUserLocation: (newLocation: Location) => void,
  locations: Location[],
  setLocations: (newLocations: Location[]) => void,
  venues: Venue[],
  setVenues: (newVenues: Venue[]) => void,
  userOrders: Order[],
  setUserOrders: (newUserOrders: Order[]) => void,
  setSingleUserOrder: (newUserOrder: Order) => void,
  refundTriggered: boolean
  setRefundTriggered: (refundTriggered: boolean) => void
}>()(
  devtools(
    persist(
      set => ({
        events: [],
        setEvents: newEvents => set(() => ({ events: newEvents })),
        updateSingleEvent: event => set(state => ({ events: state.events.filter(d => d.id !== event.id).concat(event) })),
        setEventListings: (eventID, listings) => set(state => {
          const eventsCopy = [...state.events];
          const event = eventsCopy.find(d => d.id === eventID)!;
          event.listings = listings;
          return ({ events: eventsCopy });
        }),

        userLocation: null,
        setUserLocation: newLocation => set(() => ({ userLocation: newLocation })),

        locations: [],
        setLocations: newLocations => set(() => ({ locations: newLocations })),

        venues: [],
        setVenues: newVenues => set(() => ({ venues: newVenues })),

        userOrders: [],
        setUserOrders: (newUserOrders: Order[]) => set(() => ({ userOrders: newUserOrders })),
        setSingleUserOrder: (newUserOrder: Order) => set(({ userOrders }) => ({ userOrders: [...userOrders.filter(d => d.id !== newUserOrder.id), newUserOrder] })),

        refundTriggered: false,
        setRefundTriggered: (refundTriggered: boolean) => set({ refundTriggered })
      }),
      {
        name: "user-app",
        storage: createJSONStorage(() => AsyncStorage)
      }
    )
  )
);


export const usePurchaseStore = create<{
  eventID: string,
  setEventID: (eventID: string) => void,
  orderID: string | null,
  setOrderID: (newOrderID: string) => void,
  clearOrderID: () => void,
  orderAge: Date | null,
  cart: CartItem[],
  updateCart: (newCart: CartItem[]) => void
}>()(
  devtools(
    set => ({
      eventID: '',
      setEventID: eventID => set(() => ({ eventID })),

      orderID: null,
      orderAge: null,
      setOrderID: newOrderID => set(() => ({ orderID: newOrderID, orderAge: new Date() })),
      clearOrderID: () => set(() => ({ orderID: null, orderAge: null })),

      cart: [],
      updateCart: newCart => set({ cart: newCart })
    })
  )
)


export const useAuthFlowStore = create<{
  phoneNumber: string | null,
  setPhoneNumber: (newPhoneNumber: string) => void
}>()(
  devtools(
    set => ({
      phoneNumber: null,
      setPhoneNumber: newPhoneNumber => set({ phoneNumber: newPhoneNumber })
    })
  ),
)


export const useAuthStore = create<{
  signedIn: boolean,
  userInfo: UserInfo | null,
  signIn: (newUserInfo: UserInfo) => void,
  signOut: () => void
}>()(
  persist(
    devtools(
      set => ({
        signedIn: false,
        userInfo: null,
        signIn: newUserInfo => set({ signedIn: true, userInfo: newUserInfo }),
        signOut: () => {
          SecureStore.deleteItemAsync('streamChatToken');
          set({ signedIn: false, userInfo: null });
        }
      })
    ),
    {
      name: "user-app-auth",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
)