import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Customer, Order, DashboardStats } from '@/types';

// Hook for dashboard stats
export function useDashboardStats(shopId: string | undefined) {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeOrders: 0,
    completedOrders: 0,
    pendingPayments: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) {
      setLoading(false);
      return;
    }

    const customersQuery = query(
      collection(db, 'customers'),
      where('shopId', '==', shopId)
    );

    const ordersQuery = query(
      collection(db, 'orders'),
      where('shopId', '==', shopId)
    );

    const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
      setStats(prev => ({ ...prev, totalCustomers: snapshot.size }));
      setLoading(false);
    });

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      let activeOrders = 0;
      let completedOrders = 0;
      let pendingPayments = 0;
      let totalRevenue = 0;

      snapshot.docs.forEach(doc => {
        const order = doc.data() as Order;
        if (order.status === 'pending' || order.status === 'in-progress') {
          activeOrders++;
        }
        if (order.status === 'completed' || order.status === 'delivered') {
          completedOrders++;
        }
        if (order.paymentStatus !== 'paid') {
          pendingPayments++;
        }
        totalRevenue += order.paidAmount || 0;
      });

      setStats(prev => ({
        ...prev,
        activeOrders,
        completedOrders,
        pendingPayments,
        totalRevenue
      }));
    });

    return () => {
      unsubscribeCustomers();
      unsubscribeOrders();
    };
  }, [shopId]);

  return { stats, loading };
}

// Hook for customers
export function useCustomers(shopId: string | undefined) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'customers'),
      where('shopId', '==', shopId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Customer[];

      setCustomers(customersData);
      setLoading(false);
    });

    return unsubscribe;
  }, [shopId]);

  const addCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const docRef = await addDoc(collection(db, 'customers'), {
      ...customerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }, []);

  const updateCustomer = useCallback(async (customerId: string, data: Partial<Customer>) => {
    await updateDoc(doc(db, 'customers', customerId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  }, []);

  const deleteCustomer = useCallback(async (customerId: string) => {
    await deleteDoc(doc(db, 'customers', customerId));
  }, []);

  return { customers, loading, addCustomer, updateCustomer, deleteCustomer };
}

// Hook for orders
export function useOrders(shopId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('shopId', '==', shopId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deliveryDate: doc.data().deliveryDate?.toDate() || new Date(),
        imageExpiryDate: doc.data().imageExpiryDate?.toDate() || null,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Order[];

      setOrders(ordersData);
      setLoading(false);
    });

    return unsubscribe;
  }, [shopId]);

  const addOrder = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }, []);

  const updateOrder = useCallback(async (orderId: string, data: Partial<Order>) => {
    await updateDoc(doc(db, 'orders', orderId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  }, []);

  const deleteOrder = useCallback(async (orderId: string) => {
    await deleteDoc(doc(db, 'orders', orderId));
  }, []);

  return { orders, loading, addOrder, updateOrder, deleteOrder };
}

// Hook for single customer
export function useCustomer(customerId: string | undefined) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'customers', customerId), (doc) => {
      if (doc.exists()) {
        setCustomer({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        } as Customer);
      } else {
        setCustomer(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [customerId]);

  return { customer, loading };
}
