"use client"

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import axios from "axios";
import Cookies from "js-cookie";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.code === 'token_not_valid'
    ) {
      removeToken();
    }

    return Promise.reject(error);
  }
);

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function isNull(val) {
  return (typeof val === 'undefined' || val === undefined || val === null)
}

export function range(start, stop, step=1) {
  if(!stop) {
    stop = start;
    start = 0;
  }
  return Array.from(
    {length: (stop - start) / step},
    (value, index) => start + index * step
  );
}

export function request(config) {
  // axios.interceptors.response.use((response) => {
  //   return response;
  // }, (error) => {
  //   if(error.response && error.response.data.code === 'token_not_valid') {
  //     window.location.replace(CONFIG.AUTH_FRONTEND_URL + '/user/signin')
  //   }
  //   return Promise.reject(error);
  // })
  return axios.request(config);
}


export function toTitleCase(str) {
  // Replace underscores and hyphens with spaces
  str = str.replace(/[_-]/g, ' ');

  // Convert the string to title case
  return str.split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

export function getToken(redirect= true) {
  const token = Cookies.get('access_token')
  if(!token && redirect) {
    window.location.replace(process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL)
  } else if(token && redirect) {
    window.location.replace(process.env.NEXT_PUBLIC_APP_FRONTEND_URL)
  }
  return token;
}

export function removeToken(redirect= true) {
  const token = Cookies.get('access_token')
  if(!token && redirect) {
    window.location.replace(process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL)
  } else {
    Cookies.remove('access_token', { path: '/', domain: process.env.NEXT_PUBLIC_DOMAIN })
    if(redirect) {
      window.location.replace(process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL)
    }
  }
}

export function getUserTheme() {
  return localStorage.getItem('theme') || 'light';
}

export function setUserTheme(theme) {
  localStorage.setItem('theme', theme);
}