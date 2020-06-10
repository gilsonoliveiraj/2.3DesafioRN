import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const jsonValue = await AsyncStorage.getItem('@GoMarketPlace:products');
      jsonValue && setProducts(JSON.parse(jsonValue));
    }

    loadProducts();
  }, []);

  const saveProducts = useCallback(async () => {
    await AsyncStorage.setItem(
      '@GoMarketPlace:products',
      JSON.stringify(products),
    );
  }, [products]);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const index = products.findIndex(x => x.id === product.id);

      if (index === -1) {
        setProducts([...products, { ...product, quantity: 1 }]);
      } else {
        const newArray = [...products];
        newArray[index].quantity += 1;
        setProducts(newArray);
      }
      saveProducts();
    },
    [products, saveProducts],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const index = products.findIndex(x => x.id === id);
      const newItem = products[index];

      newItem.quantity += 1;
      const newArr = [...products];
      newArr.splice(index, 1, newItem);
      setProducts(newArr);
      saveProducts();
    },
    [products, saveProducts],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART      const index = products.findIndex(x => x.id === id);
      const index = products.findIndex(x => x.id === id);
      const newItem = products[index];

      newItem.quantity -= 1;
      const newArr = [...products];
      newItem.quantity === 0
        ? newArr.splice(index, 1)
        : newArr.splice(index, 1, newItem);
      setProducts(newArr);
      saveProducts();
    },
    [products, saveProducts],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
