'use client'

import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '@/store/store'

const store = makeStore();

export default function StoreProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}

