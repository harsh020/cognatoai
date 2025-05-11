"use client"

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import {format, isBefore, startOfToday, endOfToday, isAfter, startOfDay, endOfDay} from "date-fns";
import {
  Briefcase,
  Code,
  Database,
  Users,
  BarChart,
  PenTool,
  Cpu,
  HelpCircle
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return (Math.floor(Math.random()) * (max - min)) + min;
}

export function convertDateStringToLocalTZWithFormat(date, pattern = "HH:mm") {
  const dtz = new Date(date);
  return format(dtz, pattern);
}

export function checkDateAndGetTime(dateString, checkDate=new Date()) {
  const localDate = new Date(dateString); // Browser auto converts UTC to local
  const todayStart = startOfDay(checkDate);
  const todayEnd = endOfDay(checkDate);

  if (isBefore(localDate, todayStart)) {
    return "00:00";
  } else if(isAfter(localDate, todayEnd)) {
    return "23:59";
  } else {
    return format(localDate, "HH:mm");
  }
}

export function toTitleCase(str) {
  // Replace underscores and hyphens with spaces
  str = str.replace(/[_-]/g, ' ');

  // Convert the string to title case
  return str.split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

export function getScoreBadgeClasses(score) {
  if (score >= 7) {
    return "border-green-500 bg-green-100 text-green-700";
  } else if (score >= 4) {
    return "border-yellow-500 bg-yellow-100 text-yellow-700";
  } else {
    return "border-red-500 bg-red-100 text-red-700";
  }
}

export function getLevelBadgeClasses(level) {
  if (level === 'Senior') {
    return "border-blue-500 bg-blue-100 text-blue-700";
  } else if (level === 'Mid') {
    return "border-green-500 bg-green-100 text-green-700";
  } else if (level === 'Mid') {
    return "border-yellow-500 bg-yellow-100 text-yellow-700";
  } else {
    return "border-gray-500 bg-gray-100 text-gray-700";
  }
}

// export function getRoleBadgeClasses(role) {
//   if (role.toLowerCase().includes('software engineer')) {
//     return "border-blue-500 bg-blue-100 text-blue-700";
//   } else if (role.toLowerCase().includes('product designer')) {
//     return "border-yellow-500 bg-yellow-100 text-yellow-700";
//   } else {
//     return "border-indigo-500 bg-indigo-100 text-indigo-700";
//   }
// }


export function getStatusBadgeClasses(status) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'in_progress':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-700 dark:text-teal-200';
    case 'expired':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200';
    case 'incomplete':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

export function getStatusGradientClasses(status) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-conic-110 from-green-900 to-green-500';
    case 'scheduled':
      return 'bg-conic-110 from-blue-900 to-blue-500';
    case 'in_progress':
      return 'bg-conic-110 from-teal-900 to-teal-500';
    case 'expired':
      return 'bg-conic-110 from-orange-900 to-orange-500';
    case 'cancelled':
      return 'bg-conic-110 from-red-900 to-red-500';
    case 'incomplete':
      return 'bg-conic-110 from-yellow-900 to-yellow-500';
    case 'error':
      return 'bg-conic-110 from-red-900 to-red-500';
    default:
      return 'bg-conic-110 from-gray-900 to-gray-500';
  }
}

export function getTransactionBadgeClasses(transaction) {
  switch (transaction.toLowerCase()) {
    case 'credit':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'debit':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

export function getStageNameMapping(stage) {
  switch (stage) {
    case 'Introduction':
      return 'Intro';
    case 'Data Structures and Algorithm Question':
      return 'Coding';
    case 'Questions for the Interviewer':
      return 'Questions'
    default:
      return stage.split(' ')[0]
  }
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

export function buildJsonFromForm(target) {
  let data = {}
  for(let i=0; i<target.length; i++) {
    if(target[i].name && target[i].value && isValidValue(target[i].value)) {
      const key = target[i].name.replaceAll(' ', '_');
      if(key in data) {
        if(typeof data[key] === "object") data[key].push(target[i].value);
        else data[key] = new Array([...data[key], target[i].value]);
      }
      else data[key] = target[i].value;
    }
  }
  return data;
}

export function getRoleIcon(role) {
  switch (role.toLowerCase()) {
    case "software engineer":
      return <Code />;
    case "data scientist":
      return <Database />;
    case "project manager":
      return <Briefcase />;
    case "ui/ux designer":
      return <PenTool />;
    case "product manager":
      return <BarChart />;
    case "hr":
      return <Users />;
    case "ai engineer":
      return <Cpu />;
    default:
      return <HelpCircle />; // Default icon if role is unknown
  }
}

export function getRoleBadgeClasses(role) {
  switch (role.toLowerCase()) {
    case "software engineer":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "data scientist":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "project manager":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "ui/ux designer":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "product manager":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
    case "hr":
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
    case "ai engineer":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"; // Default style
  }
}

export function filterStages(stages) {
  return stages.filter(stage => !["INTRODUCTION", "QUESTION_INTERVIEWER", "CUSTOM_QUESTIONS", "END"].includes(stage.code));
}

export function getSkillFromStage(stage) {
  switch (stage.toLowerCase()) {
    case "data structures and algorithm question":
      return "data structures and algorithms";
    case "resume discussion":
      return "resume discussion";
    default:
      return stage.split(" ")[0];
  }
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

export function getToken(redirect=true) {
  const token = Cookies.get('access_token')
  if(!token && redirect) {
    window.location.replace(process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL)
  }
  return token;
}

export function removeToken(redirect=true) {
  const token = Cookies.get('access_token')
  if(!token && redirect) {
    window.location.replace(process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL )
  } else {
    Cookies.remove('access_token', { path: '/', domain: process.env.NEXT_PUBLIC_DOMAIN })
    if(redirect) {
      window.location.replace(process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL)
    }
  }
}

export function getOrganization() {
  const token = Cookies.get('org_id')
  if(!token) {
    window.location.replace(CONFIG.NEXT_PUBLIC_AUTH_FRONTEND_URL + '/login')
  }
  return token;
}

export function setOrganization(orgId) {
  const token = Cookies.set('org_id', orgId);
  if(!token) {
    window.location.replace(CONFIG.NEXT_PUBLIC_AUTH_FRONTEND_URL + '/login')
  }
  return token;
}

export function isParamsEqual(obj, searchParams) {
  const paramsObj = {};
  for (const [key, value] of searchParams.entries()) {
    paramsObj[key] = value;
  }

  const objKeys = Object.keys(obj);
  const paramKeys = Object.keys(paramsObj);

  // First check if they have the same number of keys
  if (objKeys.length !== paramKeys.length) return false;

  // Then check each key and value
  return objKeys.every(key => obj[key] === paramsObj[key]);
}

export function getUserTheme() {
  return localStorage.getItem('theme') || 'light';
}

export function setUserTheme(theme) {
  localStorage.setItem('theme', theme);
}
