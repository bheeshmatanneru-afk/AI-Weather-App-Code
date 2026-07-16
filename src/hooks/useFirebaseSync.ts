import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp, getDoc } from "firebase/firestore";
import { City } from "../types";
import { db, auth, isFirebaseEnabled, handleFirestoreError, OperationType } from "../lib/firebase";

const PRE_POPULATED_FAVORITES: City[] = [
  { id: 5128581, name: "New York", latitude: 40.7128, longitude: -74.006, country: "United States", admin1: "New York", country_code: "US" },
  { id: 1850147, name: "Tokyo", latitude: 35.6895, longitude: 139.6917, country: "Japan", admin1: "Tokyo", country_code: "JP" },
  { id: 2643743, name: "London", latitude: 51.5085, longitude: -0.1257, country: "United Kingdom", admin1: "England", country_code: "GB" },
  { id: 2988507, name: "Paris", latitude: 48.8534, longitude: 2.3488, country: "France", admin1: "Île-de-France", country_code: "FR" },
  { id: 2147714, name: "Sydney", latitude: -33.8678, longitude: 151.2073, country: "Australia", admin1: "New South Wales", country_code: "AU" }
];

export function useFirebaseSync() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [favorites, setFavorites] = useState<City[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);

  // 1. Listen for Auth Changes and Initialize State
  useEffect(() => {
    if (!isFirebaseEnabled || !auth) {
      setAuthLoading(false);
      // Fallback to local storage
      const saved = localStorage.getItem("weather_intelligence_favorites");
      setFavorites(saved ? JSON.parse(saved) : PRE_POPULATED_FAVORITES);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);

      if (firebaseUser) {
        // Sync user profile once they log in
        await syncUserProfile(firebaseUser);
      } else {
        // Fallback to local storage if user logs out
        const saved = localStorage.getItem("weather_intelligence_favorites");
        setFavorites(saved ? JSON.parse(saved) : PRE_POPULATED_FAVORITES);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Sync Firestore Favorites if logged in
  useEffect(() => {
    if (!isFirebaseEnabled || !db || !user) {
      return;
    }

    setSyncLoading(true);
    const userId = user.uid;
    const favoritesPath = `users/${userId}/favorites`;
    const favoritesCollection = collection(db, "users", userId, "favorites");

    const unsubscribe = onSnapshot(
      favoritesCollection,
      (snapshot) => {
        const list: City[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: data.id,
            name: data.name,
            latitude: data.latitude,
            longitude: data.longitude,
            country: data.country || "",
            admin1: data.admin1 || "",
            country_code: data.country_code || "",
          });
        });
        
        // If there is active user list, set it. Otherwise fallback.
        setFavorites(list);
        setSyncLoading(false);
      },
      (error) => {
        setSyncLoading(false);
        // Safely capture permissions errors or connection issues
        handleFirestoreError(error, OperationType.GET, favoritesPath);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Sync to local storage only if NOT logged in or Firebase is disabled
  useEffect(() => {
    if (!user || !isFirebaseEnabled) {
      localStorage.setItem("weather_intelligence_favorites", JSON.stringify(favorites));
    }
  }, [favorites, user]);

  // Helper to safely provision user profile
  const syncUserProfile = async (firebaseUser: User) => {
    if (!db) return;
    const userPath = `users/${firebaseUser.uid}`;
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "",
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.warn("User profile registration deferred/local-only:", error);
    }
  };

  const addFavorite = async (city: City) => {
    if (isFirebaseEnabled && db && user) {
      const userId = user.uid;
      const docPath = `users/${userId}/favorites/${city.id}`;
      try {
        const docRef = doc(db, "users", userId, "favorites", String(city.id));
        await setDoc(docRef, {
          id: city.id,
          name: city.name,
          latitude: city.latitude,
          longitude: city.longitude,
          country: city.country || "",
          admin1: city.admin1 || "",
          country_code: city.country_code || "",
          userId: userId,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, docPath);
      }
    } else {
      if (!favorites.some((fav) => fav.id === city.id)) {
        setFavorites((prev) => [...prev, city]);
      }
    }
  };

  const removeFavorite = async (city: City) => {
    if (isFirebaseEnabled && db && user) {
      const userId = user.uid;
      const docPath = `users/${userId}/favorites/${city.id}`;
      try {
        const docRef = doc(db, "users", userId, "favorites", String(city.id));
        await deleteDoc(docRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, docPath);
      }
    } else {
      setFavorites((prev) => prev.filter((fav) => fav.id !== city.id));
    }
  };

  return {
    user,
    authLoading,
    syncLoading,
    favorites,
    addFavorite,
    removeFavorite,
  };
}
