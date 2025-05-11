import React from "react";
// import axios from "axios";
import {useLocation} from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";


function toTitleCase(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    return word.replace(word[0], word[0].toUpperCase());
  }).join(' ');
}

async function createFile(path, name, type) {
  let response = await fetch(path);
  let data = await response.blob();
  let metadata = {
    type: type
  };
  return new File([data], name, metadata);
}

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function isValidValue(value) {
  if(!value) return false;
  else if(typeof value === 'string' && value.trim().length === 0) return false;
  return true;
}

function buildJsonFromForm(target) {
  let data = {}
  for(let i=0; i<target.length; i++) {
    if(target[i].name && target[i].value && isValidValue(target[i].value)) {
      data[target[i].name.replaceAll(' ', '_')] = target[i].value;
    }
  }
  return data;
}

function parseParams(params) {
  const keys = Object.keys(params)
  let options = ''

  keys.forEach((key) => {
    const isParamTypeObject = typeof params[key] === 'object'
    const isParamTypeArray = isParamTypeObject && params[key].length >= 0

    if (!isParamTypeObject) {
      options += `${key}=${params[key]}&`
    }

    if (isParamTypeObject && isParamTypeArray) {
      params[key].forEach((element) => {
        options += `${key}=${element}&`
      })
    }
  })

  return options ? options.slice(0, -1) : options
}

function displayTimer(timeObj) {
  // return `${timeObj.minutes < 10 ? '0'+timeObj.minutes : timeObj.minutes}:${timeObj.seconds < 10 ? '0'+timeObj.seconds : timeObj.seconds}`
  if (timeObj === null) return '--:--'
  return `${(timeObj.minutes).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}:${(timeObj.seconds).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}`
}

function request(config) {
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

// function getToken() {
//   const token = Cookies.get('_brandsaga_user_auth_token')
//   if(!token) {
//     window.location.replace(CONFIG.AUTH_FRONTEND_URL + '/user/signin')
//   }
//   return token;
// }

function isNull(val) {
  return (typeof val === 'undefined' || val === null)
}

function extractWavHeader(blob) {
  // Read the first 44 bytes of the blob as the WAV header
  return blob.slice(0, 44);
}

function concatenateBuffers(buffers) {
  // Concatenate an array of ArrayBuffer or Uint8Array buffers
  const totalLength = buffers.reduce((acc, buffer) => acc + buffer.byteLength, 0);
  const concatenatedBuffer = new Uint8Array(totalLength);
  let offset = 0;
  buffers.forEach(buffer => {
    concatenatedBuffer.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  });
  return concatenatedBuffer.buffer;
}

function clearTranscript(text) {
  // Remove all tokens and trim
  const regex = /(?:\[[^\]]*\]|\([^)]*\))/g
  return text.replaceAll(regex, "").trim();
}

function extractUUID(text) {
  const regex = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i
  const uuids = text.match(regex);
  // console.log(uuids)
  if(uuids && uuids.length) return uuids[0];
  return null;
}


function fileToBase64(file) {
  var reader = new FileReader();
  reader.readAsDataURL(file);
  return new Promise((resolve, reject) => {
    reader.onload = function () {
      let result = reader.result
      if(result.startsWith('data:audio/wav;base64,')) {
        result = result.replace('data:audio/wav;base64,', '')
      }
      resolve(result)
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
      reject()
    };
  })
}

function convertToBinary(raw) {
  let rawLength = raw.length;
  let arr = new Uint8Array(new ArrayBuffer(rawLength));

  for (let i = 0; i < rawLength; i++) {
    arr[i] = raw.charCodeAt(i);
  }
  return arr;
}

function getFileExtensionFromMimeType(mimeType) {
  const mainType = mimeType.split(";")[0]; // Remove parameters
  const subtype = mainType.split("/")[1]; // Extract the subtype (extension-like part)
  return subtype || null; // Return null if no subtype exists
}

export const UTILS = {
  toTitleCase,
  useQuery,
  createFile,
  // request,
  parseParams,
  buildJsonFromForm,
  isValidValue,
  displayTimer,
  request,
  // getToken,
  isNull,
  extractWavHeader,
  concatenateBuffers,
  clearTranscript,
  extractUUID,
  fileToBase64,
  convertToBinary,
  getFileExtensionFromMimeType
}