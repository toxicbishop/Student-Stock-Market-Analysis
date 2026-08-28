import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { PriceAlert } from '../types';

export type PriceAlertNotification = { 
  ticker: string; 
  price: number; 
  condition: string; 
};

export function usePriceAlerts(user: User | null) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState<boolean>(false);
  const [notification, setNotification] = useState<PriceAlertNotification | null>(null);

  // Subscribe to price alerts from Firestore
  useEffect(() => {
    if (!user) {
      setAlerts([]);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'priceAlerts'),
      (snap) => {
        setAlerts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PriceAlert)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/priceAlerts`);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Listen to custom window events for price alerts triggered by client
  useEffect(() => {
    const handleAlert = (event: Event) => {
      const detail = (event as CustomEvent<PriceAlertNotification>).detail;
      if (!detail) return;
      setNotification(detail);
      setTimeout(() => setNotification(null), 5000);
    };

    window.addEventListener('price-alert', handleAlert);
    return () => window.removeEventListener('price-alert', handleAlert);
  }, []);

  const handleAddAlert = async (
    ticker: string, 
    targetPrice: number, 
    condition: 'ABOVE' | 'BELOW'
  ) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'priceAlerts'), {
        ticker,
        targetPrice,
        condition,
        isActive: true,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/priceAlerts`);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'priceAlerts', alertId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/priceAlerts/${alertId}`);
    }
  };

  const triggerToastNotification = (toast: PriceAlertNotification, timeoutMs: number = 3000) => {
    setNotification(toast);
    setTimeout(() => setNotification(null), timeoutMs);
  };

  return {
    alerts,
    showAlerts,
    setShowAlerts,
    notification,
    setNotification,
    handleAddAlert,
    handleDeleteAlert,
    triggerToastNotification,
  };
}
